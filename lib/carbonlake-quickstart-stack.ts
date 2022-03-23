import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkBaseStack, CdkBaseStackProps } from '../lib/base-stack/carbonlake-quickstart-base-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CarbonlakeQuickstartStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CarbonlakeQuickstartQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
