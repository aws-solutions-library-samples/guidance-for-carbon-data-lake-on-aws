import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib'
import { aws_stepfunctions as sfn } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_sqs as sqs } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { Construct } from 'constructs'

// how wide to parallelise the step function map state
const STATEMACHINE_MAX_CONCURRENCY = 100;
// how many rows to process per calculation function invocation
const STATEMACHINE_MAX_ITEMS_PER_BATCH = 1000;
const STATEMACHINE_NAME = 'cdl-data-pipeline-sfn';


interface StateMachineProps extends StackProps {
  /**
   * Function invoked for a new data lineage request
   */
  dataLineageFunction: lambda.Function
  /**
   * Function invoked to cleanup data quality resources
   */
  dqResourcesLambda: lambda.Function
  /**
   * Function invoked to parse data quality results
   */
  dqResultsLambda: lambda.Function
  /**
   * SNS topic trigger on data quality job failure
   */
  dqErrorNotification: sns.Topic
  /**
   * Function invoked to calculate CO2e value from emissions data
   */
  calculationJob: lambda.Function
  /**
   * SQS queue to hold records failed within the Calculator
   */
  calculationErrorQueue: sqs.Queue
  /**
   * The S3 bucket to read data in from
   */
  rawBucket: s3.Bucket
}

export class DataPipelineStatemachine extends Construct {
  /**
   * The statemachine which orchestrates the data pipeline
   */
  public readonly statemachine: sfn.StateMachine

  /**
   * Defines the serverless data pipeline using Amazon Step Functions.
   * Orchestrates data quality, data lineage, and emissions calculation
   * using a distributed map state.
   * @param scope 
   * @param id 
   * @param props 
   */
  constructor(scope: Construct, id: string, props: StateMachineProps) {
    super(scope, id)

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
    const errorNotification = new tasks.SnsPublish(this, 'SNS: Notify Data Quality Error', {
      topic: props.dqErrorNotification,
      subject: 'Data Quality check failed',
      message: sfn.TaskInput.fromText(
        sfn.JsonPath.format(
          'Your Carbon Data Lake Data Quality job has failed. Please review your dataset: {}',
          sfn.JsonPath.stringAt('$.data_quality.storage_location')
        )
      ),
      resultPath: sfn.JsonPath.DISCARD,
    })

    // Calculation Lambda function - pass in the batch to be processed
    const calculationLambdaTask = new tasks.LambdaInvoke(this, 'LAMBDA: Calculate CO2 Equivalent', {
      lambdaFunction: props.calculationJob,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        items: sfn.JsonPath.listAt('$.Items'),
        execution_id: sfn.JsonPath.stringAt('$$.Execution.Name'),
        root_id: sfn.JsonPath.stringAt('$.BatchInput.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.BatchInput.parent_id')
      }),
      resultPath: '$'
    })

    // Data Lineage Request - 2_1 - CALCULATION_COMPLETE
    const dataLineageTask2_1 = new tasks.LambdaInvoke(this, 'Data Lineage: CALCULATION_COMPLETE', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.parent_id'),
        action_taken: 'CALCULATION_COMPLETE',
        storage_location: sfn.JsonPath.stringAt('$.storage_location'),
        records: sfn.JsonPath.objectAt('$.records'),
      }),
      resultSelector: {
        root_id: sfn.JsonPath.stringAt('$.root_id')
      }
    })

    // Boolean choice state for failed records - checks whether failed_records payload array is empty
    const failedRecordCheck = new sfn.Choice(this, 'CHOICE: Failed records?');

    // Data Lineage Request - 2_2 - CALCULATION_FAILED
    const dataLineageTask2_2 = new tasks.LambdaInvoke(this, 'Data Lineage: CALCULATION_FAILED', {
      lambdaFunction: props.dataLineageFunction,
      payloadResponseOnly: true,
      payload: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.root_id'),
        parent_id: sfn.JsonPath.stringAt('$.parent_id'),
        action_taken: 'CALCULATION_FAILED',
        storage_location: sfn.JsonPath.stringAt('$.error_storage_location'),
        records: sfn.JsonPath.objectAt('$.failed_records'),
      })
    })

    // SQS Send Message Task for handling failed messages within the calculator
    const failedQueueTask = new tasks.SqsSendMessage(this, 'SQS: Send Failed Activities to Queue', {
      queue: props.calculationErrorQueue,
      messageBody: sfn.TaskInput.fromObject({
        root_id: sfn.JsonPath.stringAt('$.root_id'),
        failed_records: sfn.JsonPath.objectAt('$.records')
      })
    });

    // setup a parallel state for handling clean and failed records
    const splitActivities = new sfn.Parallel(this, 'Split clean and failed activities');
    splitActivities.branch(dataLineageTask2_1) // "Good" path
    splitActivities.branch(failedRecordCheck
      .when(
        sfn.Condition.booleanEquals('$.has_errors', true),
        dataLineageTask2_2.next(failedQueueTask)
      )
      .otherwise(new sfn.Pass(this, 'No failed records'))
    ) // "Bad" path

    // hardcoding a distributed map state via custom JSON until native support is provided
    // as per - https://github.com/aws/aws-cdk/issues/23216
    const dummyMap = new sfn.Map(this, "MAP: Iterate Records")
    dummyMap.iterator(calculationLambdaTask.next(splitActivities));

    const distributedMapState = new sfn.CustomState(this, "DistributedMap", {
      stateJson: {
        Type: "Map",
        MaxConcurrency: STATEMACHINE_MAX_CONCURRENCY,
        ItemReader: {
          Resource: "arn:aws:states:::s3:getObject",
          ReaderConfig: {
            InputType: "CSV",
            CSVHeaderLocation: "FIRST_ROW",
          },
          Parameters: {
            Bucket: props.rawBucket.bucketName,
            "Key.$": "$.data_quality.s3_key"
          },
        },
        ItemBatcher: {
          MaxItemsPerBatch: STATEMACHINE_MAX_ITEMS_PER_BATCH,
          MaxInputBytesPerBatch: 200000, // max is 256KB, included some buffer here for BatchInput fields
          BatchInput: {
            "root_id.$": "$.data_lineage.root_id",
            "parent_id.$": "$.data_lineage.node_id"
          }
        },
        ItemProcessor: {
          ...(dummyMap.toStateJson() as any).Iterator,
          ProcessorConfig: {
            Mode: "DISTRIBUTED",
            ExecutionType: "STANDARD",
          },
        },
        ResultPath: null
      }
    });

    /* ======== STEP FUNCTION ======== */

    // State machine definition
    const definition = sfn.Chain
      .start(dataLineageTask0)
      .next(dataQualitySetupTask)
      .next(dataQualityProfileTask)
      .next(dataLineageTask1)
      .next(dataQualityCleanupTask)
      .next(dataQualityCheckTask)
      .next(dataQualityChoice
        .when(
          sfn.Condition.booleanEquals('$.data_quality.status', true),
          sfn.Chain.start(dataLineageTask1_1)
            .next(distributedMapState)
            .next(sfnSuccess)
        )
        .otherwise(
          sfn.Chain.start(errorNotification)
            .next(dataLineageTask1_2)
            .next(sfnFailure)
        )
      )

    this.statemachine = new sfn.StateMachine(this, 'cdlPipeline', {
      stateMachineName: STATEMACHINE_NAME, // hardcoding name to prevent circular permissions dependency
      definition,
      timeout: Duration.minutes(60),
    })

    /* ======== PERMISSIONS ======== */

    // allow statemachine to read from raw bucket
    // required for distributed map state
    props.rawBucket.grantRead(this.statemachine);

    // explicitly permit statemachine to invoke calculator and data lineage functions
    // NOTE: this will be done implicitly when sfn distributed maps are native in CDK
    props.calculationJob.grantInvoke(this.statemachine);
    props.dataLineageFunction.grantInvoke(this.statemachine);

    // allow statemachine to run databrew jobs
    this.statemachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['databrew:StartJobRun'],
        resources: [ `arn:aws:databrew:${Stack.of(this).region}:${Stack.of(this).account}:job/*` ],
      })
    )

    // permit statemachine to send failed activities to SQS
    props.calculationErrorQueue.grantSendMessages(this.statemachine);

    // allow statemachine to start new statemachine executions as children.
    // required for the distributed map state
    // NOTE: this will be done implicitly when sfn distributed maps are native in CDK
    this.statemachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'states:StartExecution',
        ],
        resources: [ `arn:aws:states:${Stack.of(this).region}:${Stack.of(this).account}:stateMachine:${STATEMACHINE_NAME}` ]
      })
    );
    this.statemachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'states:DescribeExecution',
          'states:StopExecution'
        ],
        resources: [ `arn:aws:states:${Stack.of(this).region}:${Stack.of(this).account}:stateMachine:${STATEMACHINE_NAME}/*` ]
      })
    );
  }
}
