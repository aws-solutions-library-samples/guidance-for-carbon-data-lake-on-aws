import { App, Stack, StackProps, RemovalPolicy, } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib';

import { CarbonLakeDataCompactionGlueJobsStack } from './glue/carbonlake-qs-data-compaction-glue-jobs';
import { CarbonLakeDataCompactionHistoricalCrawlerStack } from './glue/carbonlake-qs-data-compaction-historical-crawler';
import { CarbonLakeGlueEnrichedDataTodayTableStack } from './glue/carbonlake-qs-create-enriched-data-glue-today-table';
import { CarbonlakeQuickstartCreateAthenaViewsStack } from './athena/carbonlake-qs-createAthenaViews';
import { CarbonlakeDataCompactionStateMachineStack } from './statemachine/carbonlake-qs-data-compaction-state-machine';
import { CarbonLakeEventTriggerStateMachineStack } from './event/carbonlake-qs-event-trigger-state-machine';

interface CarbonLakeDataCompactionPipelineStackProps extends StackProps {
  enrichedBucket: s3.Bucket;
}

export class CarbonLakeDataCompactionPipelineStack extends Stack {
  constructor(scope: App, id: string, props: CarbonLakeDataCompactionPipelineStackProps) {
    super(scope, id, props);

    /* ======== GLUE METADATA CATALOG TABLE ======== */
    const { glueEnrichedDataTodayTable } = new CarbonLakeGlueEnrichedDataTodayTableStack(this, 'carbonLakeGlueEnrichedDataDatabaseStack', {
      enrichedBucket: props?.enrichedBucket
    });

    /* ======== GLUE COMPACTION & FLUSHING JOBS ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueCompactionJobName, glueDataFlushJobName } = new CarbonLakeDataCompactionGlueJobsStack(this, 'carbonLakeDataCompactionGlueJobsStack', {
      enrichedBucket: props?.enrichedBucket
    });

    /* ======== HISTORICAL DATA CRAWLER ======== */
    const { glueHistoricalCalculatorCrawlerName } = new CarbonLakeDataCompactionHistoricalCrawlerStack(this, 'carbonLakeDataCompactionHistoricalCrawlerStack', {
      enrichedBucket: props?.enrichedBucket
    })

    /** LAMBDAS TO CREATE ATHENA VIEWS */
    const { createIndividualAthenaViewsLambda, createCombinedAthenaViewsLambda } = new CarbonlakeQuickstartCreateAthenaViewsStack(this, 'carbonlakeQuickstartCreateAthenaViewsStack', {
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

    /* ======== STATEMACHINE ======== */
    const { stateMachineName } = new CarbonlakeDataCompactionStateMachineStack(this, 'carbonlakeDataCompactionStateMachineStack', {
      glueCompactionJobName: glueCompactionJobName,
      glueDataFlushJobName: glueDataFlushJobName,
      glueHistoricalCalculatorCrawlerName: glueHistoricalCalculatorCrawlerName,
      createIndividualAthenaViewsLambda: createIndividualAthenaViewsLambda,
      createCombinedAthenaViewLambda: createCombinedAthenaViewsLambda,
      stateMachineS3Bucket: stateMachineS3Bucket
    })

    /** VENT BRIDGE EVENT TO TRIGGER STATE MACHINE */
    const { eventRule } = new CarbonLakeEventTriggerStateMachineStack(this, 'carbonLakeEventTriggerStateMachineStack', {
      stateMachineName: stateMachineName
    })

  }
}