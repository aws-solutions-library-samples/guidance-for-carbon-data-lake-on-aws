import { NestedStack, NestedStackProps, aws_s3 as s3, aws_glue as glue } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CarbonLakeGlueEnrichedDataTodayTableStackProps extends NestedStackProps {
  enrichedBucket: s3.Bucket;
}

export class CarbonLakeGlueEnrichedDataTodayTableStack extends NestedStack {
  public readonly glueEnrichedDataTodayTable: glue.CfnTable;

    constructor(scope: Construct, id: string, props: CarbonLakeGlueEnrichedDataTodayTableStackProps) {
        super(scope, id, props);

        // Create 'today' enriched data table in Glue Metadata Catalog ahead of time with pre-defined schema to match JSON output of calculator microservice
        this.glueEnrichedDataTodayTable = new glue.CfnTable(this, "enrichedCalculatorDataTodayData", {
          catalogId: this.account,
          databaseName: 'enriched-calculator-data',
          tableInput: {
            description: "Glue Metadata Catalog table for today's calculator data",
            name: 'today',
            storageDescriptor: {
              bucketColumns: [],
              columns: [
                {
                  name: 'activity_event_id',
                  type: 'string',
                },
                {
                  name: 'asset_id',
                  type: 'string',
                },
                {
                  name: 'geo',
                  type: 'string',
                },
                {
                  name: 'origin_measurement_timestamp',
                  type: 'string',
                },
                {
                  name: 'scope',
                  type: 'string',
                },
                {
                  name: 'category',
                  type: 'string',
                },
                {
                  name: 'activity',
                  type: 'string',
                },
                {
                  name: 'source',
                  type: 'string',
                },
                {
                  name: 'raw_data',
                  type: 'string',
                },
                {
                  name: 'units',
                  type: 'string',
                },
                {
                  name: 'emissions_output',
                  type: 'struct<calculated_emissions:struct<co2:struct<amount:double,unit:string>,ch4:struct<amount:double,unit:string>,n2o:struct<amount:double,unit:string>,co2e:struct<ar4:struct<amount:double,unit:string>,ar5:struct<amount:double,unit:string>>>,emissions_factor:struct<ar4:struct<amount:string,unit:string>,ar5:struct<amount:string,unit:string>>>',
                },
                {
                  name: 'partition_0',
                  type: 'string',
                }
              ],
              compressed: false,
              inputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
              location: `s3://${props.enrichedBucket.bucketName}/today/`,
              numberOfBuckets: -1,
              outputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
              parameters: {
                "classification": "json"
              },
              serdeInfo: {
                name: 'today',
                parameters: {
                  paths: "activity,activity_event_id,asset_id,category,emissions_output,geo,origin_measurement_timestamp,raw_data,scope,source,units"
                },
                serializationLibrary: 'org.openx.data.jsonserde.JsonSerDe',
              },
              storedAsSubDirectories: false,
            },
            parameters: {
              "classification": "json"
            }
          },
        })
    }
}


