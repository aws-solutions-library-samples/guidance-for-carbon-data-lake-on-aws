import * as cdk from 'aws-cdk-lib';
import * as cfninc from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';
import * as path from 'path';

export class CarbonlakeQuicksightStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const template = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: path.join(process.cwd(), 'lib','quicksight','cfn', 'carbonlake-qs-quicksight-cloudformation.yaml'),
      preserveLogicalIds: false
    });
  }
}
