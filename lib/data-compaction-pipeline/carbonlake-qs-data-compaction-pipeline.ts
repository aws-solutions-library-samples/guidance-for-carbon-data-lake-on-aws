import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as path from 'path';

import { CarbonLakeDataCompactionGlueJobsStack } from './glue/carbonlake-qs-data-compaction-glue-jobs';
import { CarbonLakeDataCompactionHistoricalCrawlerStack } from './glue/carbonlake-qs-data-compaction-historical-crawler';
import { CarbonLakeGlueEnrichedDataDatabaseStack } from './glue/carbonlake-qs-create-enriched-data-glue-database';
import { CarbonLakeGlueEnrichedDataTodayTableStack } from './glue/carbonlake-qs-create-enriched-data-glue-today-table';
interface CarbonLakeDataCompactionPipelineStackProps extends StackProps {
  enrichedBucket: s3.Bucket;
}

export class CarbonLakeDataCompactionPipelineStack extends Stack {
  constructor(scope: App, id: string, props: CarbonLakeDataCompactionPipelineStackProps) {
    super(scope, id, props);

    /* ======== CREATE GLUE METADATA CATALOG DATABASE & TABLE ======== */
    const { glueEnrichedDataDatabase } = new CarbonLakeGlueEnrichedDataDatabaseStack(this, 'carbonLakeGlueEnrichedDataDatabaseStack', {});
    const { glueEnrichedDataTodayTable } = new CarbonLakeGlueEnrichedDataTodayTableStack(this, 'carbonLakeGlueEnrichedDataTodayTableStack', {
      enrichedBucket: props?.enrichedBucket
    });

    /* ======== TRIGGER LAMBDA ======== */

    /* ======== GLUE COMPACTION & FLUSHING JOBS ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueCompactionJob, glueDataFlushJob } = new CarbonLakeDataCompactionGlueJobsStack(this, 'carbonLakeDataCompactionGlueJobsStack', {
      enrichedBucket: props?.enrichedBucket
    });

    /* ======== HISTORICAL DATA CRAWLER ======== */
    const { glueHistoricalCalculatorCrawler } = new CarbonLakeDataCompactionHistoricalCrawlerStack(this, 'carbonLakeDataCompactionHistoricalCrawlerStack', {
      enrichedBucket: props?.enrichedBucket
    })

    /* ======== STATEMACHINE ======== */

  }
}