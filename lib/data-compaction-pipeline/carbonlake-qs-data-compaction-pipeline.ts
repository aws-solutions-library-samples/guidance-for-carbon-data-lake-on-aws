import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib';
import { aws_glue as glue } from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as path from 'path';

import { CarbonLakeDataCompactionGlueJobsStack } from './glue/carbonlake-qs-data-compaction-glue-jobs';
import { CarbonLakeDataCompactionHistoricalCrawlerStack } from './glue/carbonlake-qs-data-compaction-historical-crawler';
import { CarbonLakeGlueEnrichedDataTodayTableStack } from './glue/carbonlake-qs-create-enriched-data-glue-today-table';
import { CarbonlakeQuickstartCreateAthenaViewsStack } from './athena/carbonlake-qs-createAthenaViews';
import { CarbonlakeDataCompactionStateMachineStack } from './statemachine/carbonlake-qs-data-compaction-state-machine';
import { CarbonLakeEventTriggerStateMachineStack } from './event/carbonlake-qs-event-trigger-state-machine';
import { Construct } from 'constructs';

interface CarbonLakeDataCompactionPipelineStackProps extends StackProps {
  enrichedBucket: s3.Bucket;
  enrichedDataDatabase: glue.CfnDatabase;
  dataLineageTraceQueue: sqs.Queue;
}

export class CarbonLakeDataCompactionPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CarbonLakeDataCompactionPipelineStackProps) {
    super(scope, id, props);

    /* ======== GLUE METADATA CATALOG TABLE ======== */
    const { glueEnrichedDataTodayTable } = new CarbonLakeGlueEnrichedDataTodayTableStack(this, 'carbonLakeGlueEnrichedDataDatabaseStack', {
      enrichedBucket: props?.enrichedBucket,
      enrichedDataDatabase: props?.enrichedDataDatabase
    });

    /* ======== GLUE COMPACTION & FLUSHING JOBS ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueCompactionJobName, glueDataFlushJobName } = new CarbonLakeDataCompactionGlueJobsStack(this, 'carbonLakeDataCompactionGlueJobsStack', {
      enrichedBucket: props?.enrichedBucket
    });

    /* ======== HISTORICAL DATA CRAWLER ======== */
    const { glueHistoricalCalculatorCrawlerName } = new CarbonLakeDataCompactionHistoricalCrawlerStack(this, 'carbonLakeDataCompactionHistoricalCrawlerStack', {
      enrichedBucket: props?.enrichedBucket,
      enrichedDataDatabase: props?.enrichedDataDatabase
    })

    /** LAMBDAS TO CREATE ATHENA VIEWS */
    const { createIndividualAthenaViewsLambda, createCombinedAthenaViewsLambda } = new CarbonlakeQuickstartCreateAthenaViewsStack(this, 'carbonlakeQuickstartCreateAthenaViewsStack', {
      enrichedDataDatabase: props?.enrichedDataDatabase
    })

    /** S3 BUCKET WITH STATE MACHINE JSON DEFINITION */
    const stateMachineS3Bucket = new s3.Bucket(this, 'stateMachineS3Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new s3_deployment.BucketDeployment(this, 'deployStateMachineJSON', {
      sources: [s3_deployment.Source.asset('./lib/data-compaction-pipeline/statemachine/json')],
      destinationBucket: stateMachineS3Bucket
    });

    /* ======== ENUMERATE DIRECTORIES LAMBDA ======== */
    // This function lists all directories within the /today folder of the enriched bucket and
    // publishes the directory names to the retrace data lineage queue for processing.
    // After this step, the data lineage component has all required information to retrace the tree.

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "carbonlakeDataCompactionLayer",
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    );

    // Lambda function to process incoming events, generate child node IDs
    const enumFunction = new lambda.Function(this, "carbonlakeDataCompactionEnum", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/enumerate_directories/')),
      handler: "app.lambda_handler",
      environment: {
        BUCKET_NAME: props.enrichedBucket.bucketName,
        SQS_QUEUE_URL: props.dataLineageTraceQueue.queueUrl
      },
      layers: [dependencyLayer]
    });

    props.enrichedBucket.grantRead(enumFunction);
    props.dataLineageTraceQueue.grantSendMessages(enumFunction);

    /* ======== STATEMACHINE ======== */
    const { stateMachineName } = new CarbonlakeDataCompactionStateMachineStack(this, 'carbonlakeDataCompactionStateMachineStack', {
      glueCompactionJobName: glueCompactionJobName,
      glueDataFlushJobName: glueDataFlushJobName,
      glueHistoricalCalculatorCrawlerName: glueHistoricalCalculatorCrawlerName,
      createIndividualAthenaViewsLambda: createIndividualAthenaViewsLambda,
      createCombinedAthenaViewLambda: createCombinedAthenaViewsLambda,
      stateMachineS3Bucket: stateMachineS3Bucket,
      enemerateDirectoriesFunction: enumFunction
    })

    /** VENT BRIDGE EVENT TO TRIGGER STATE MACHINE */
    const { eventRule } = new CarbonLakeEventTriggerStateMachineStack(this, 'carbonLakeEventTriggerStateMachineStack', {
      stateMachineName: stateMachineName
    })

  }
}