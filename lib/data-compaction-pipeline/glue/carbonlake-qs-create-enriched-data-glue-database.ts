import { NestedStack, NestedStackProps, aws_s3 as s3, aws_glue as glue } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CarbonLakeGlueEnrichedDataDatabaseStackProps extends NestedStackProps {}

export class CarbonLakeGlueEnrichedDataDatabaseStack extends NestedStack {
  public readonly glueEnrichedDataDatabase: glue.CfnDatabase;

    constructor(scope: Construct, id: string, props: CarbonLakeGlueEnrichedDataDatabaseStackProps) {
        super(scope, id, props);
        

        this.glueEnrichedDataDatabase = new glue.CfnDatabase(this, "enrichedCalculatorDataDatabase", {
          catalogId: this.account,
          databaseInput: {
            description: 'Glue Metadata Catalog database for enriched calculator data',
            name: 'enriched-calculator-data'
          },
        });
    }
}