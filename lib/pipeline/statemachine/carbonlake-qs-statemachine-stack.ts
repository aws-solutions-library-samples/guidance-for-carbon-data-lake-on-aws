import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { CfnJob } from 'aws-cdk-lib/aws-glue';
import { Construct } from 'constructs';

interface StateMachineProps extends NestedStackProps {
  dataLineageFunction: lambda.Function,
  dataQualityJob: any,
  s3copierLambda: lambda.Function,
  glueTransformJobName: string,
  batchEnumLambda: lambda.Function,
  calculationJob: lambda.Function
}

export class CarbonlakeQuickstartStatemachineStack extends NestedStack {
  public readonly statemachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StateMachineProps) {
    super(scope, id, props);

    /* ======== STEP FUNCTION TASKS ======== */

    // SFN Success State
    const sfnSuccess = new sfn.Succeed(this, 'Success');

    // SFN Failure State
    const sfnFailure = new sfn.Fail(this, 'Failure');

    // Data Lineage Request - 0 - RAW_DATA_INPUT
    const dataLineageTask0 = this.buildDataLineageSFNTask(props.dataLineageFunction, "RAW_DATA_INPUT");

    // Data Quality Check
    const dataQualityTask = new tasks.LambdaInvoke(this, 'LAMBDA: Data Quality Check', {
      lambdaFunction: props.s3copierLambda,
      payloadResponseOnly: true,
    });

    // CHOICE - Data Quality Check Passed?
    const dataQualityChoice = new sfn.Choice(this, 'CHOICE: Data Quality Passed?')

    // Data Lineage Request - 1_1 - DQ_CHECK_PASS
    const dataLineageTask1_1 = this.buildDataLineageSFNTask(props.dataLineageFunction, "DQ_CHECK_PASS");

    // Data Lineage Request - 1_2 - DQ_CHECK_FAIL
    const dataLineageTask1_2 = this.buildDataLineageSFNTask(props.dataLineageFunction, "DQ_CHECK_FAIL");

    // Human-in-the-loop approval step - invoked on data quality check fail
    const humanApprovalTask = new sfn.Pass(this, 'SNS: Human Approval Step');

    // Transformation Glue Job - split large input file into optimised batches with known schema
    const transformGlueTask = new tasks.GlueStartJobRun(this, 'GLUE: Synchronous Transform', {
      glueJobName: props.glueTransformJobName,
      arguments: sfn.TaskInput.fromObject({
        "--UNIQUE_DIRECTORY": sfn.JsonPath.stringAt("$.data_lineage.parent_id")
      }),
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      resultSelector: {
        "job_name": sfn.JsonPath.stringAt("$.JobName"),
        "job_id": sfn.JsonPath.stringAt("$.Id"),
        "job_state": sfn.JsonPath.stringAt("$.JobRunState")
      },
      resultPath: "$.glue_output"
    })

    // Lambda function to determine number and location of batches created by AWS Glue
    const batchLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Enumerate Batched Files', {
      lambdaFunction: props.batchEnumLambda,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "batch_location_dir":  sfn.JsonPath.stringAt("$.data_lineage.parent_id")
      }),
      resultPath: '$.batches'
    })

    // Data Lineage Request - 2 - GLUE_BATCH_SPLIT
    const dataLineageTask2 = this.buildDataLineageSFNTask(props.dataLineageFunction, "GLUE_BATCH_SPLIT");

    // Dynamic Map State - Run n calculations depending on number of batches
    const dynamicMapState = new sfn.Map(this, 'MAP: Iterate Batches', {
      maxConcurrency: 40,
      inputPath: '$',
      itemsPath: "$.batches",
      parameters: {
        "location": sfn.JsonPath.objectAt("$$.Map.Item.Value"),
        "data_lineage": sfn.JsonPath.stringAt('$.data_lineage')
      },
      resultPath: '$.batch_results'
    });

    // Calculation Lambda function - pass in the batch to be processed
    // const calculationLambdaTask = new sfn.Pass(this, 'LAMBDA: Calculate CO2 Equivalent', {
    //   inputPath: sfn.JsonPath.stringAt("$.location"),
    //   result: sfn.Result.fromString("s3://<enriched_bucket>/<node_id>/<batch_id>.json"),
    //   resultPath: "$.calculation_results"
    // });
    const calculationLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Calculate CO2 Equivalent', {
      lambdaFunction: props.calculationJob,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "location":  sfn.JsonPath.stringAt("$.location")
      }),
      resultPath: '$.data_lineage.storage_location'
    })

    // Data Lineage Request - 3 - CALCULATION_COMPLETE
    const dataLineageTask3 = this.buildDataLineageSFNTask(props.dataLineageFunction, "CALCULATION_COMPLETE");
    

    /* ======== STEP FUNCTION ======== */

    // State machine definition
    const definition = sfn.Chain
      .start(dataLineageTask0)
      .next(dataQualityTask)
      .next(dataQualityChoice
        .when(
          sfn.Condition.stringEquals('$.data_quality_check', "PASSED"),
          sfn.Chain
            .start(dataLineageTask1_1)
            .next(transformGlueTask)
            .next(batchLambdaTask)
            .next(dataLineageTask2)
            .next(dynamicMapState.iterator(sfn.Chain
              .start(calculationLambdaTask)
              .next(dataLineageTask3)
            ))
            .next(sfnSuccess)
        )
        .otherwise(sfn.Chain
          .start(humanApprovalTask)
          .next(dataLineageTask1_2)
          .next(sfnFailure)
        )
      )

    this.statemachine = new sfn.StateMachine(this, 'carbonlakePipeline', {
      definition,
      timeout: Duration.minutes(15)
    });
  }

  private buildDataLineageSFNTask = (dlFunction: lambda.Function, action: string) : tasks.LambdaInvoke => {
    return new tasks.LambdaInvoke(this, `Data Lineage: ${action}`, {
      lambdaFunction: dlFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.data_lineage.parent_id"),
        "storage_type":  sfn.JsonPath.stringAt("$.data_lineage.storage_type"),
        "storage_location": sfn.JsonPath.stringAt("$.data_lineage.storage_location"),
        "action_taken": action
      }),
      resultPath: '$.data_lineage',
    });
  }
}