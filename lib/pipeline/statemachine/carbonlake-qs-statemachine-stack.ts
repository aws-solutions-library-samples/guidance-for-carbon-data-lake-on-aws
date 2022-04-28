import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StateMachineProps extends NestedStackProps {
  dataLineageFunction: any,
  dataQualityJob: any,
  glueTransformJob: any,
  calculationJob: any
}

export class CarbonlakeQuickstartStatemachineStack extends NestedStack {
  public readonly statemachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: StateMachineProps) {
    super(scope, id, props);

    /* ======== STEP FUNCTION TASKS ======== */

    // SFN Success State
    const sfnSuccess = new sfn.Succeed(this, 'Success');

    // SFN Failure State
    const sfnFailure = new sfn.Fail(this, 'Failure');

    // Data Lineage Request - 0 - RAW_DATA_INPUT
    const dataLineageTask0 = new sfn.Pass(this, 'DL: RAW_DATA_INPUT', {
      inputPath: '$.data_lineage',
      result: sfn.Result.fromObject({ action: "RAW_DATA_INPUT", parent_id: "child_one_id" }),
      resultPath: '$.data_lineage'
    });

    // Data Quality Check
    const dataQualityTask = new sfn.Pass(this, 'LAMBDA: Data Quality Check', {
      inputPath: '$.file',
      result: sfn.Result.fromObject({ result: 'PASSED' }),
      resultPath: '$.data_quality'
    });

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

    /* ======== STEP FUNCTION ======== */

    // State machine definition
    const definition = sfn.Chain
      .start(dataLineageTask0)
      .next(dataQualityTask)
      .next(dataQualityChoice
        .when(
          sfn.Condition.stringEquals('$.data_quality.result', "PASSED"),
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
}