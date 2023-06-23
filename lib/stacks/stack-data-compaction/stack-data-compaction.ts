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
import { CdlS3 } from '../../constructs/construct-cdl-s3-bucket/construct-cdl-s3-bucket'
import { CdlPythonLambda } from '../../constructs/construct-cdl-python-lambda-function/construct-cdl-python-lambda-function'

interface CompactionStackProps extends StackProps {
  enrichedBucket: s3.Bucket
  enrichedDataDatabase: glue.CfnDatabase
  dataLineageTraceQueue: sqs.Queue
}

export class DataCompactionStack extends Stack {
  constructor(scope: Construct, id: string, props: CompactionStackProps) {
    super(scope, id, props)

    /* ======== GLUE METADATA CATALOG TABLE ======== */
    new GlueEnrichedDataTodayTable(this, 'cdlGlueEnrichedDataDatabaseStack', {
      enrichedBucket: props?.enrichedBucket,
      enrichedDataDatabase: props?.enrichedDataDatabase,
    })

    /* ======== GLUE COMPACTION & FLUSHING JOBS ======== */
    const { glueCompactionJobName, glueDataFlushJobName } = new DataCompactionGlueJobs(
      this,
      'cdlDataCompactionGlueJobsStack',
      {
        enrichedBucket: props?.enrichedBucket,
      }
    )

    /* ======== HISTORICAL DATA CRAWLER ======== */
    const { glueHistoricalCalculatorCrawlerName } = new DataCompactionHistoricalCrawler(
      this,
      'cdlDataCompactionHistoricalCrawlerStack',
      {
        enrichedBucket: props?.enrichedBucket,
        enrichedDataDatabase: props?.enrichedDataDatabase,
      }
    )

    /** LAMBDAS TO CREATE ATHENA VIEWS */
    const { createIndividualAthenaViewsLambda, createCombinedAthenaViewsLambda } = new CreateAthenaViews(
      this,
      'cdlCreateAthenaViewsStack',
      {
        enrichedDataDatabase: props?.enrichedDataDatabase,
      }
    )

    /** S3 BUCKET WITH STATE MACHINE JSON DEFINITION */
    const stateMachineS3Bucket = new CdlS3(this, 'stateMachineS3Bucket', {
      bucketName: 'stateMachineS3Bucket',
    })

    const deployStateMachineJSON = new s3_deployment.BucketDeployment(this, 'deployStateMachineJSON', {
      sources: [
        s3_deployment.Source.asset('./lib/stacks/stack-data-compaction/construct-data-compaction-statemachine/json'),
      ],
      destinationBucket: stateMachineS3Bucket,
    })

    /* ======== ENUMERATE DIRECTORIES LAMBDA ======== */
    // This function lists all directories within the /today folder of the enriched bucket and
    // publishes the directory names to the retrace data lineage queue for processing.
    // After this step, the data lineage component has all required information to retrace the tree.

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'cdlDataCompactionLayer',
      `arn:aws:lambda:${Stack.of(this).region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    )

    // Lambda function to process incoming events, generate child node IDs
    const enumFunction = new CdlPythonLambda(this, 'cdlDataCompactionEnum', {
      lambdaName: 'cdlDataCompactionEnum',
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
    const { stateMachineName } = new DataCompactionStateMachine(this, 'cdlDataCompactionStateMachineStack', {
      glueCompactionJobName: glueCompactionJobName,
      glueDataFlushJobName: glueDataFlushJobName,
      glueHistoricalCalculatorCrawlerName: glueHistoricalCalculatorCrawlerName,
      createIndividualAthenaViewsLambda: createIndividualAthenaViewsLambda,
      createCombinedAthenaViewLambda: createCombinedAthenaViewsLambda,
      stateMachineS3Bucket: stateMachineS3Bucket,
      enemerateDirectoriesFunction: enumFunction,
    })

    enumFunction.node.addDependency(deployStateMachineJSON)

    /** VENT BRIDGE EVENT TO TRIGGER STATE MACHINE */
    new EventTriggerStateMachine(this, 'cdlEventTriggerStateMachineStack', {
      stateMachineName: stateMachineName,
    })

    Tags.of(this).add('component', 'dataCompactionPipeline')
  }
}
