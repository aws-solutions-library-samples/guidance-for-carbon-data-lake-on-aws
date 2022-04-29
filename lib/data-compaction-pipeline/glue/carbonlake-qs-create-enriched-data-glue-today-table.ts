import { NestedStack, NestedStackProps, aws_s3 as s3, aws_glue as glue } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CarbonLakeGlueEnrichedDataTodayTableStackProps extends NestedStackProps {
  enrichedBucket: s3.Bucket;
}

export class CarbonLakeGlueEnrichedDataTodayTableStack extends NestedStack {
  public readonly glueEnrichedDataTodayTable: glue.CfnTable;

    constructor(scope: Construct, id: string, props: CarbonLakeGlueEnrichedDataTodayTableStackProps) {
        super(scope, id, props);

        this.glueEnrichedDataTodayTable = new glue.CfnTable(this, "enrichedCalculatorDataTodayData", {
          catalogId: this.account,
          databaseName: "enriched-calculator-data",
          tableInput: {
            description: "Glue Metadata Catalog table for today's calculator data",
            name: 'today',
            storageDescriptor: {
              bucketColumns: [],
              columns: [
                {
                  name: 'record_id',
                  type: 'string',
                },
                {
                  name: 'asset_id',
                  type: 'string',
                },
                {
                  name: 'activity_id',
                  type: 'struct<activity:string,category:string,scope:int>',
                },
                {
                  name: 'emissions_output',
                  type: 'struct<calculated_emissions:struct<ch4:struct<amount:double,unit:string>,co2:struct<amount:double,unit:string>,co2e:struct<amount:double,unit:string>,n20:struct<amount:double,unit:string>>,emissions_factor:double,emissions_factor_reference:string>',
                },
                {
                  name: 'geo',
                  type: 'struct<lat:double,long:double>',
                },
                {
                  name: 'origin_measurement_timestamp',
                  type: 'string',
                },
                {
                  name: 'raw_data',
                  type: 'double',
                },
                {
                  name: 'source',
                  type: 'string',
                },
                {
                  name: 'units',
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
                  paths: "activity_id,asset_id,emissions_output,geo,origin_measurement_timestamp,raw_data,record_id,source,units"
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


