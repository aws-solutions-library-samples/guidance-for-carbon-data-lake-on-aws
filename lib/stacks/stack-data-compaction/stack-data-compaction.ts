import { Stack, StackProps, RemovalPolicy, Tags } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import { aws_sqs as sqs } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import * as path from 'path'

import { DataCompactionGlueJobs } from './construct-data-compaction-glue/construct-data-compaction-glue-jobs'
import { DataCompactionHistoricalCrawler } from './construct-data-compaction-glue/construct-data-compaction-historical-crawler'
import { GlueEnrichedDataTodayTable } from './construct-data-compaction-glue/construct-create-enriched-data-glue-today-table'
import { CreateAthenaViews } from './construct-data-compaction-athena/construct-create-athena-views'
import { DataCompactionStateMachine } from './construct-data-compaction-statemachine/construct-data-compaction-state-machine'
import { EventTriggerStateMachine } from './construct-data-compaction-state-machine-event-trigger/construct-event-trigger-state-machine'

interface CompactionStackProps extends StackProps {
  enrichedBucket: s3.Bucket
  enrichedDataDatabase: glue.CfnDatabase
  dataLineageTraceQueue: sqs.Queue
}

export class DataCompactionStack extends Stack {
  constructor(scope: Construct, id: string, props: CompactionStackProps) {
    super(scope, id, props)

    /* ======== GLUE METADATA CATALOG TABLE ======== */
    const { glueEnrichedDataTodayTable } = new GlueEnrichedDataTodayTable(
      this,
      'carbonLakeGlueEnrichedDataDatabaseStack',
      {
        enrichedBucket: props?.enrichedBucket,
        enrichedDataDatabase: props?.enrichedDataDatabase,
      }
    )

    /* ======== GLUE COMPACTION & FLUSHING JOBS ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueCompactionJobName, glueDataFlushJobName } = new DataCompactionGlueJobs(
      this,
      'carbonLakeDataCompactionGlueJobsStack',
      {
        enrichedBucket: props?.enrichedBucket,
      }
    )

    /* ======== HISTORICAL DATA CRAWLER ======== */
    const { glueHistoricalCalculatorCrawlerName } = new DataCompactionHistoricalCrawler(
      this,
      'carbonLakeDataCompactionHistoricalCrawlerStack',
      {
        enrichedBucket: props?.enrichedBucket,
        enrichedDataDatabase: props?.enrichedDataDatabase,
      }
    )

    /** LAMBDAS TO CREATE ATHENA VIEWS */
    const { createIndividualAthenaViewsLambda, createCombinedAthenaViewsLambda } = new CreateAthenaViews(
      this,
      'CLQSCreateAthenaViewsStack',
      {
        enrichedDataDatabase: props?.enrichedDataDatabase,
      }
    )

    /** S3 BUCKET WITH STATE MACHINE JSON DEFINITION */
    const stateMachineS3Bucket = new s3.Bucket(this, 'stateMachineS3Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    new s3_deployment.BucketDeployment(this, 'deployStateMachineJSON', {
      sources: [s3_deployment.Source.asset('./lib/stacks/stack-data-compaction/statemachine/json')],
      destinationBucket: stateMachineS3Bucket,
    })

    /* ======== ENUMERATE DIRECTORIES LAMBDA ======== */
    // This function lists all directories within the /today folder of the enriched bucket and
    // publishes the directory names to the retrace data lineage queue for processing.
    // After this step, the data lineage component has all required information to retrace the tree.

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'carbonlakeDataCompactionLayer',
      `arn:aws:lambda:${Stack.of(this).region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    )

    // Lambda function to process incoming events, generate child node IDs
    const enumFunction = new lambda.Function(this, 'carbonlakeDataCompactionEnum', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/enumerate_directories/')),
      handler: 'app.lambda_handler',
      environment: {
        BUCKET_NAME: props.enrichedBucket.bucketName,
        SQS_QUEUE_URL: props.dataLineageTraceQueue.queueUrl,
      },
      layers: [dependencyLayer],
    })

    props.enrichedBucket.grantRead(enumFunction)
    props.dataLineageTraceQueue.grantSendMessages(enumFunction)

    /* ======== STATEMACHINE ======== */
    const { stateMachineName } = new DataCompactionStateMachine(
      this,
      'carbonlakeDataCompactionStateMachineStack',
      {
        glueCompactionJobName: glueCompactionJobName,
        glueDataFlushJobName: glueDataFlushJobName,
        glueHistoricalCalculatorCrawlerName: glueHistoricalCalculatorCrawlerName,
        createIndividualAthenaViewsLambda: createIndividualAthenaViewsLambda,
        createCombinedAthenaViewLambda: createCombinedAthenaViewsLambda,
        stateMachineS3Bucket: stateMachineS3Bucket,
        enemerateDirectoriesFunction: enumFunction,
      }
    )

    /** VENT BRIDGE EVENT TO TRIGGER STATE MACHINE */
    const { eventRule } = new EventTriggerStateMachine(this, 'carbonLakeEventTriggerStateMachineStack', {
      stateMachineName: stateMachineName,
    })

    Tags.of(this).add("component", "dataCompactionPipeline");
  }
}
