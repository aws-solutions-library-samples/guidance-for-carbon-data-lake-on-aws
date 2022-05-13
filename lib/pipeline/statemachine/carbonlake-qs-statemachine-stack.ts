import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { CfnJob } from 'aws-cdk-lib/aws-glue';
import { Construct } from 'constructs';

interface StateMachineProps extends NestedStackProps {
  dataLineageFunction: lambda.Function,
  dataLineageTraceFunction: lambda.Function,
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
    const dataLineageTask0 = new tasks.LambdaInvoke(this, 'Data Lineage: RAW_DATA_INPUT', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.input.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.input.root_id"),
        "action_taken": "RAW_DATA_INPUT",
        "record": {
          "storage_location": sfn.JsonPath.stringAt("$.input.storage_location")
        }
        
      }),
      resultPath: '$.data_lineage',
    });

    // Data Quality Check
    const dataQualityTask = new tasks.LambdaInvoke(this, 'LAMBDA: Data Quality Check', {
      lambdaFunction: props.s3copierLambda,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "storage_location": sfn.JsonPath.stringAt("$.input.storage_location")
      }),
      resultPath: '$.data_quality'
    });

    // CHOICE - Data Quality Check Passed?
    const dataQualityChoice = new sfn.Choice(this, 'CHOICE: Data Quality Passed?')

    // Data Lineage Request - 1_1 - DQ_CHECK_PASS
    const dataLineageTask1_1 = new tasks.LambdaInvoke(this, 'Data Lineage: DQ_CHECK_PASS', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.data_lineage.node_id"),
        "record": {
          "storage_location": sfn.JsonPath.stringAt("$.data_quality.storage_location")
        },
        "action_taken": "DQ_CHECK_PASS"
      }),
      resultPath: '$.data_lineage',
    });
    // Data Lineage Request - 1_2 - DQ_CHECK_FAIL
    const dataLineageTask1_2 = new tasks.LambdaInvoke(this, 'Data Lineage: DQ_CHECK_FAIL', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.data_lineage.node_id"),
        "record": {
          "storage_location": sfn.JsonPath.stringAt("$.data_quality.storage_location")
        },
        "action_taken": "DQ_CHECK_FAIL"
      }),
      resultPath: '$.data_lineage',
    });

    // Human-in-the-loop approval step - invoked on data quality check fail
    const humanApprovalTask = new sfn.Pass(this, 'SNS: Human Approval Step');

    // Transformation Glue Job - split large input file into optimised batches with known schema
    const transformGlueTask = new tasks.GlueStartJobRun(this, 'GLUE: Synchronous Transform', {
      glueJobName: props.glueTransformJobName,
      arguments: sfn.TaskInput.fromObject({
        "--UNIQUE_DIRECTORY": sfn.JsonPath.stringAt("$.data_lineage.node_id")
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
        "batch_location_dir":  sfn.JsonPath.stringAt("$.data_lineage.node_id")
      }),
      resultPath: '$.batches'
    })

    // Data Lineage Request - 2 - GLUE_BATCH_SPLIT
    const dataLineageTask2 = new tasks.LambdaInvoke(this, 'Data Lineage: GLUE_BATCH_SPLIT', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.data_lineage.node_id"),
        "action_taken": "GLUE_BATCH_SPLIT",
        "records": sfn.JsonPath.objectAt("$.batches")
      }),
      resultPath: '$.data_lineage',
    });

    // Dynamic Map State - Run n calculations depending on number of batches
    const dynamicMapState = new sfn.Map(this, 'MAP: Iterate Batches', {
      maxConcurrency: 10,
      inputPath: '$',
      itemsPath: "$.batches",
      parameters: {
        "storage_location": sfn.JsonPath.objectAt("$$.Map.Item.Value.storage_location"),
        "data_lineage": {
          "root_id": sfn.JsonPath.stringAt('$.data_lineage.root_id'),
          "parent_id": sfn.JsonPath.stringAt('$$.Map.Item.Value.node_id')
        }
      },
      resultPath: sfn.JsonPath.DISCARD
    });

    // Calculation Lambda function - pass in the batch to be processed
    const calculationLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Calculate CO2 Equivalent', {
      lambdaFunction: props.calculationJob,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "storage_location":  sfn.JsonPath.stringAt("$.storage_location")
      }),
      resultPath: '$.calculations'
    })

    // Data Lineage Request - 3 - CALCULATION_COMPLETE
    const dataLineageTask3 = new tasks.LambdaInvoke(this, 'Data Lineage: CALCULATION_COMPLETE', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id"),
        "parent_id": sfn.JsonPath.stringAt("$.data_lineage.parent_id"),
        "action_taken": "CALCULATION_COMPLETE",
        "records": sfn.JsonPath.objectAt("$.calculations")
      }),
      resultPath: '$.data_lineage',
    });

    // Data Lineage Trace Function - rebuild the lineage tree for a given root_id
    const dataLineageTraceTask = new tasks.LambdaInvoke(this, 'Data Lineage - retrace tree', {
      lambdaFunction: props.dataLineageTraceFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        "root_id": sfn.JsonPath.stringAt("$.data_lineage.root_id")
      }),
      resultPath: "$.data_lineage"
    })

    /* ======== STEP FUNCTION ======== */

    // State machine definition
    const definition = sfn.Chain
      .start(dataLineageTask0)
      .next(dataQualityTask)
      .next(dataQualityChoice
        .when(
          sfn.Condition.stringEquals('$.data_quality.status', "PASSED"),
          sfn.Chain
            .start(dataLineageTask1_1)
            .next(transformGlueTask)
            .next(batchLambdaTask)
            .next(dataLineageTask2)
            .next(dynamicMapState.iterator(sfn.Chain
              .start(calculationLambdaTask)
              .next(dataLineageTask3)
            ))
        )
        .otherwise(sfn.Chain
          .start(humanApprovalTask)
          .next(dataLineageTask1_2)
        )
        .afterwards()
      )
      .next(dataLineageTraceTask)
      .next(sfnSuccess)

    this.statemachine = new sfn.StateMachine(this, 'carbonlakePipeline', {
      definition,
      timeout: Duration.minutes(60)
    });
  }
}