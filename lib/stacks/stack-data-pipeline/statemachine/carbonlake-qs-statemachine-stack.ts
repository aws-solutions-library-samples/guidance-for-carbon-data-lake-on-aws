import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib'
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib'
import { aws_stepfunctions as sfn } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_sns as sns } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface StateMachineProps extends NestedStackProps {
  dataLineageFunction: lambda.Function
  dqResourcesLambda: lambda.Function
  dqResultsLambda: lambda.Function
  dqErrorNotification: sns.Topic
  glueTransformJobName: string
  batchEnumLambda: lambda.Function
  calculationJob: lambda.Function
}

export class CarbonlakeQuickstartStatemachineStack extends NestedStack {
  public readonly statemachine: sfn.StateMachine

  constructor(scope: Construct, id: string, props: StateMachineProps) {
    super(scope, id, props)

    /* ======== STEP FUNCTION TASKS ======== */

    // SFN Success State
    const sfnSuccess = new sfn.Succeed(this, 'Success')

    // SFN Failure State
    const sfnFailure = new sfn.Fail(this, 'Failure')

    // Data Lineage Request - 0 - RAW_DATA_INPUT
    const dataLineageTask0 = new tasks.LambdaInvoke(this, 'Data Lineage: RAW_DATA_INPUT', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.input.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.input.root_id'),
        action_taken: 'RAW_DATA_INPUT',
        record: {
          storage_location: sfn.JsonPath.stringAt('$.input.storage_location'),
        },
      }),
      resultPath: '$.data_lineage',
    })

    // Standup Data Quality Resources
    const dataQualitySetupTask = new tasks.LambdaInvoke(this, 'LAMBDA: Data Quality Setup', {
      lambdaFunction: props.dqResourcesLambda,
      payloadResponseOnly: true,
      resultPath: '$.data_quality',
      payload: sfn.TaskInput.fromObject({
        event_type: 'SETUP',
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        storage_location: sfn.JsonPath.stringAt('$.input.storage_location'),
      }),
    })

    // Run Data Quality Job
    const dataQualityProfileTask = new tasks.GlueDataBrewStartJobRun(this, 'DATABREW: Run Profile Job', {
      name: sfn.JsonPath.stringAt('$.data_quality.job_name'),
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      resultPath: '$.data_quality.results',
    })

    // Data Lineage Request - 0 - PROFILE_COMPLETE
    const dataLineageTask1 = new tasks.LambdaInvoke(this, 'Data Lineage: PROFILE_COMPLETE', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.data_lineage.node_id'),
        action_taken: 'PROFILE_COMPLETE',
        record: {
          storage_location: sfn.JsonPath.stringAt('$.data_lineage.storage_location'),
        },
      }),
      resultPath: '$.data_lineage',
    })

    // Cleanup Data Quality Resources
    const dataQualityCleanupTask = new tasks.LambdaInvoke(this, 'LAMBDA: Data Quality Cleanup', {
      lambdaFunction: props.dqResourcesLambda,
      payloadResponseOnly: true,
      resultPath: sfn.JsonPath.DISCARD,
      payload: sfn.TaskInput.fromObject({
        event_type: 'CLEANUP',
        job_name: sfn.JsonPath.stringAt('$.data_quality.job_name'),
        ruleset_name: sfn.JsonPath.stringAt('$.data_quality.ruleset_name'),
        dataset_name: sfn.JsonPath.stringAt('$.data_quality.dataset_name'),
      }),
    })

    // Data Quality Check
    const dataQualityCheckTask = new tasks.LambdaInvoke(this, 'LAMBDA: Data Quality Results Check', {
      lambdaFunction: props.dqResultsLambda,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        dq_results: sfn.JsonPath.objectAt('$.data_quality.results'),
        storage_location: sfn.JsonPath.stringAt('$.input.storage_location'),
      }),
      resultPath: '$.data_quality',
    })

    // CHOICE - Data Quality Check Passed?
    const dataQualityChoice = new sfn.Choice(this, 'CHOICE: Data Quality Passed?')

    // Data Lineage Request - 1_1 - DQ_CHECK_PASS
    const dataLineageTask1_1 = new tasks.LambdaInvoke(this, 'Data Lineage: DQ_CHECK_PASS', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.data_lineage.node_id'),
        record: {
          storage_location: sfn.JsonPath.stringAt('$.data_quality.storage_location'),
        },
        action_taken: 'DQ_CHECK_PASS',
      }),
      resultPath: '$.data_lineage',
    })

    // Data Lineage Request - 1_2 - DQ_CHECK_FAIL
    const dataLineageTask1_2 = new tasks.LambdaInvoke(this, 'Data Lineage: DQ_CHECK_FAIL', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.data_lineage.node_id'),
        record: {
          storage_location: sfn.JsonPath.stringAt('$.data_quality.storage_location'),
        },
        action_taken: 'DQ_CHECK_FAIL',
      }),
      resultPath: '$.data_lineage',
    })

    // Data Quality error notification - invoked on data quality check fail
    const errorNotificaiton = new tasks.SnsPublish(this, 'SNS: Notify Data Quality Error', {
      topic: props.dqErrorNotification,
      subject: 'Data Quality check failed',
      message: sfn.TaskInput.fromText(
        sfn.JsonPath.format(
          'Your Carbonlake Data Quality job has failed. Please review your dataset: {}',
          sfn.JsonPath.stringAt('$.data_quality.storage_location')
        )
      ),
      resultPath: sfn.JsonPath.DISCARD,
    })

    // Transformation Glue Job - split large input file into optimised batches with known schema
    const transformGlueTask = new tasks.GlueStartJobRun(this, 'GLUE: Synchronous Transform', {
      glueJobName: props.glueTransformJobName,
      arguments: sfn.TaskInput.fromObject({
        '--UNIQUE_DIRECTORY': sfn.JsonPath.stringAt('$.data_lineage.root_id'),
      }),
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      resultSelector: {
        job_name: sfn.JsonPath.stringAt('$.JobName'),
        job_id: sfn.JsonPath.stringAt('$.Id'),
        job_state: sfn.JsonPath.stringAt('$.JobRunState'),
      },
      resultPath: '$.glue_output',
    })

    // Lambda function to determine number and location of batches created by AWS Glue
    const batchLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Enumerate Batched Files', {
      lambdaFunction: props.batchEnumLambda,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        batch_location_dir: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
      }),
      resultPath: '$.batches',
    })

    // Data Lineage Request - 2 - GLUE_BATCH_SPLIT
    const dataLineageTask2 = new tasks.LambdaInvoke(this, 'Data Lineage: GLUE_BATCH_SPLIT', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.data_lineage.node_id'),
        action_taken: 'GLUE_BATCH_SPLIT',
        records: sfn.JsonPath.objectAt('$.batches'),
      }),
      // discarding the output as all required downstream data is already included in the `batches` array
      resultPath: sfn.JsonPath.DISCARD,
    })

    // Dynamic Map State - Run n calculations depending on number of batches
    const dynamicMapState = new sfn.Map(this, 'MAP: Iterate Batches', {
      maxConcurrency: 10,
      inputPath: '$',
      itemsPath: '$.batches',
      parameters: {
        storage_location: sfn.JsonPath.objectAt('$$.Map.Item.Value.storage_location'),
        data_lineage: {
          root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
          parent_id: sfn.JsonPath.stringAt('$$.Map.Item.Value.node_id'),
        },
      },
      resultPath: sfn.JsonPath.DISCARD,
    })

    // Calculation Lambda function - pass in the batch to be processed
    const calculationLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Calculate CO2 Equivalent', {
      lambdaFunction: props.calculationJob,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        storage_location: sfn.JsonPath.stringAt('$.storage_location'),
      }),
      resultPath: '$.calculations',
    })

    // Data Lineage Request - 3 - CALCULATION_COMPLETE
    const dataLineageTask3 = new tasks.LambdaInvoke(this, 'Data Lineage: CALCULATION_COMPLETE', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.data_lineage.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.data_lineage.parent_id'),
        action_taken: 'CALCULATION_COMPLETE',
        storage_location: sfn.JsonPath.stringAt('$.calculations.storage_location'),
        records: sfn.JsonPath.objectAt('$.calculations.records'),
      }),
      // discarding output to reduce payload size, this is the last task in the pipeline so output is not needed.
      resultPath: sfn.JsonPath.DISCARD,
    })

    /* ======== STEP FUNCTION ======== */

    // State machine definition
    const definition = sfn.Chain.start(dataLineageTask0)
      .next(dataQualitySetupTask)
      .next(dataQualityProfileTask)
      .next(dataLineageTask1)
      .next(dataQualityCleanupTask)
      .next(dataQualityCheckTask)
      .next(
        dataQualityChoice
          .when(
            sfn.Condition.booleanEquals('$.data_quality.status', true),
            sfn.Chain.start(dataLineageTask1_1)
              .next(transformGlueTask)
              .next(batchLambdaTask)
              .next(dataLineageTask2)
              .next(dynamicMapState.iterator(sfn.Chain.start(calculationLambdaTask).next(dataLineageTask3)))
              .next(sfnSuccess)
          )
          .otherwise(sfn.Chain.start(errorNotificaiton).next(dataLineageTask1_2).next(sfnFailure))
      )

    this.statemachine = new sfn.StateMachine(this, 'carbonlakePipeline', {
      definition,
      timeout: Duration.minutes(60),
    })

    this.statemachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['databrew:StartJobRun'],
        resources: ['*'],
      })
    )
  }
}
