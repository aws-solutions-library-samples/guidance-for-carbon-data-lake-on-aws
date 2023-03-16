import { Stack, StackProps, Names } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import { aws_athena as athena } from 'aws-cdk-lib'

interface DataLineageQueryProps extends StackProps {
  dataLineageBucket: s3.Bucket
}

export class DataLineageQuery extends Construct {
  /* 
      This stack deploys a query stage for the data lineage component to make it simple
      to query historical data lineage records stored within S3.
      This stack is designed to be self contained and an optional component deployed
      alongside the data lineage stack.
  */
  constructor(scope: Construct, id: string, props: DataLineageQueryProps) {
    super(scope, id)

    /* ====== CRAWLER ROLE ====== */
    const crawlerRole = new iam.Role(this, 'DataLineageCrawlerRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      description: 'IAM role to be assumed by the data lineage glue crawler',
      inlinePolicies: {
        GlueDataCrawlerPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject'],
              resources: [props.dataLineageBucket.bucketArn, props.dataLineageBucket.arnForObjects('*')],
            }),
          ],
        }),
      },
    })
    // add the glue service role
    crawlerRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'))

    /* ====== GLUE DB ====== */
    // Glue Data Catalogue to store data lineage schema information
    const glueDB = new glue.CfnDatabase(this, 'DataLineageQueryDB', {
      catalogId: Stack.of(this).account,
      databaseInput: { name: `glue-data-lineage-${Names.uniqueId(crawlerRole).slice(-8).toLowerCase()}` },
    })

    /* ====== GLUE TABLE ====== */
    // Glue table to be updated by the glue crawler
    const glueTable = new glue.CfnTable(this, 'DataLineagetTable', {
      catalogId: Stack.of(this).account,
      databaseName: glueDB.ref,
      tableInput: {
        name: `cdl_data_lineage_${Names.uniqueId(crawlerRole).slice(-8).toLowerCase()}`,
        storageDescriptor: {
          columns: [
            {
              name: 'record_id',
              type: 'string',
            },
            {
              name: 'root_id',
              type: 'string',
            },
            {
              name: 'lineage',
              type: 'array<struct<ttl_expiry:int,root_id:string,action_taken:string,storage_location:string,recordedAt:int,node_id:string,parent_id:string>>',
            },
            {
              name: 'partition_0',
              type: 'string',
            },
            {
              name: 'partition_1',
              type: 'string',
            },
            {
              name: 'partition_2',
              type: 'string',
            },
          ],
          compressed: false,
          inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
          location: `s3://${props.dataLineageBucket.bucketName}/`,
          numberOfBuckets: -1,
          outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
          serdeInfo: {
            name: 'data_lineage',
            parameters: {
              paths: 'lineage,record_id,root_id',
            },
            serializationLibrary: 'org.openx.data.jsonserde.JsonSerDe',
          },
        },
        parameters: {
          classification: 'json',
        },
      },
    })

    /* ====== CRAWLER ====== */
    // Setup a Glue crawler for the partitioned data lineage records in S3
    // partition scheme = year/month/day/<root_id>.jsonl
    const crawler = new glue.CfnCrawler(this, 'DataLineageCrawler', {
      role: crawlerRole.roleArn,
      databaseName: glueDB.ref,
      targets: {
        s3Targets: [{ path: props.dataLineageBucket.s3UrlForObject('/') }],
      },
      schedule: { scheduleExpression: 'cron(0 1 * * ? *)' }, // daily schedule at 1AM
      recrawlPolicy: { recrawlBehavior: 'CRAWL_NEW_FOLDERS_ONLY' },
    })

    /* ====== ATHENA ====== */
    const dlQuery = new athena.CfnNamedQuery(this, 'DataLineageQuery', {
      database: glueDB.ref,
      name: 'UnnestDataLineageRecords',
      description: 'Query the partitioned data lineage bucket and unnest lineage data',
      queryString: `
        SELECT
          record_id,
          root_id,
          unnested_lineage.action_taken,
          from_unixtime(unnested_lineage.recordedAt) as recordedAt,
          unnested_lineage.storage_location
        FROM
          "${glueDB.ref}"."${glueTable.ref}",
          UNNEST(lineage) as t(unnested_lineage)
      `,
    })
  }
}
