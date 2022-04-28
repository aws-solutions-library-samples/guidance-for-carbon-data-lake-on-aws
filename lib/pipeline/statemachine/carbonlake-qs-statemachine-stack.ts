import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { aws_lambda_event_sources as event_sources } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as path from 'path';

export class CarbonlakeQuickstartStatemachineStack extends Stack {
  public readonly kickoffFunction: lambda.Function;
  public readonly statemachine: sfn.StateMachine;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    /* ======== STEP FUNCTION ======== */

    // SFN Success State
    const sfnSuccess = new sfn.Succeed(this, 'Success');

    // SFN Failure State
    const sfnFailure = new sfn.Fail(this, 'Failure');

    // Data Lineage Request - 0 - RAW_DATA_INPUT
    const dataLineageTask0 = new sfn.Pass(this, 'DL: RAW_DATA_INPUT');

    // Data Quality Check
    const dataQualityTask = new sfn.Pass(this, 'LAMBDA: Data Quality Check');

    // CHOICE - Data Quality Check Passed?
    const dataQualityChoice = new sfn.Choice(this, 'CHOICE: Data Quality Passed?')

    // Data Lineage Request - 1_1 - DQ_CHECK_PASS
    const dataLineageTask1_1 = new sfn.Pass(this, 'DL: DQ_CHECK_PASS');

    // Data Lineage Request - 1_2 - DQ_CHECK_FAIL
    const dataLineageTask1_2 = new sfn.Pass(this, 'DL: DQ_CHECK_FAIL');

    // Human-in-the-loop approval step - invoked on data quality check fail
    const humanApprovalTask = new sfn.Pass(this, 'SNS: Human Approval Step');

    // Transformation Glue Job - split large input file into optimised batches with known schema
    // const transflowGlueTask = new tasks.GlueStartJobRun(this, 'carbonlakeTransfromGlueTask', {})
    const transformGlueTask = new sfn.Pass(this, 'GLUE: Synchronous Transform');

    // Lambda function to determine number and location of batches created by AWS Glue
    const batchLambdaTask = new sfn.Pass(this, 'LAMBDA: Handle Batch Data');

    // Data Lineage Request - 2 - GLUE_BATCH_SPLIT
    const dataLineageTask2 = new sfn.Pass(this, 'DL: GLUE_BATCH_SPLIT');

    // Dynamic Map State - Run n calculations depending on number of batches
    const dynamicMapState = new sfn.Map(this, 'MAP: Iterate Batches', {
      maxConcurrency: 40,
      itemsPath: "$.batches"
    });

    // Calculation Lambda function - pass in the batch to be processed
    const calculationLambdaTask = new sfn.Pass(this, 'LAMBDA: Calculate CO2 Equivalent');

    // Data Lineage Request - 3 - CALCULATION_COMPLETE
    const dataLineageTask3 = new sfn.Pass(this, 'DL: CALCULATION_COMPLETE');

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
    })

    /* ======== DEPENDENCIES ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "carbonlakeDataLineageLayer",
      `arn:aws:lambda:${process.env.AWS_DEFAULT_REGION}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    );

    /* ======== PERMISSIONS ======== */

    // kickoff function needs permissions to check s3 object type and start statemachine
    const startExecutionPolicy = new iam.PolicyStatement({
      actions: [ "states:StartExecution"],
      resources: [ this.statemachine.stateMachineArn ]
    })

    /* ======== KICKOFF LAMBDA ======== */

    // Lambda function to process incoming events, generate child node IDs and start the step function
    this.kickoffFunction = new lambda.Function(this, "carbonlakePipelineKickoffLambda", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/pipeline_kickoff/')),
      handler: "app.lambda_handler",
      layers: [dependencyLayer]
    });

    this.kickoffFunction.role?.attachInlinePolicy(new iam.Policy(this, 'startExecutionPolicy', {
      statements: [startExecutionPolicy]
    }));

    // TODO: Add the event source to invoke kickoff Lambda on S3 PUT Event
    // kickoffFunction.addEventSource(new event_sources.S3EventSource(props.landingBucket))
  }
}