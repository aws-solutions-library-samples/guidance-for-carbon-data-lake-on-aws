import * as cdk from 'aws-cdk-lib';
import * as cfninc from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';
import * as path from 'path';

export class CarbonlakeForecastStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    const template = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: path.join(process.cwd(), 'lib','forecast','cfn', 'carbonlake-qs-forecast-cloudformation.yaml'),
    });
  }
}
