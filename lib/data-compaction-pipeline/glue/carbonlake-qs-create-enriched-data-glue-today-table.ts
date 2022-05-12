import { NestedStack, NestedStackProps, aws_s3 as s3, aws_glue as glue } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CarbonLakeGlueEnrichedDataTodayTableStackProps extends NestedStackProps {
  enrichedBucket: s3.Bucket;
}

export class CarbonLakeGlueEnrichedDataTodayTableStack extends NestedStack {
  public readonly glueEnrichedDataTodayTable: glue.CfnTable;

    constructor(scope: Construct, id: string, props: CarbonLakeGlueEnrichedDataTodayTableStackProps) {
        super(scope, id, props);

        
    }
}


