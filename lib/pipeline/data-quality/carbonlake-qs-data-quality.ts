import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { aws_s3 as s3 } from 'aws-cdk-lib';

interface DataQualityStackProps extends StackProps {
  inputBucket: s3.Bucket;
  outputBucket: s3.Bucket;
}

/*
  Databrew jobs require a static dataset location at the point of creation
  so it is not possible to create the databrew resources within CDK, as the
  pipleine is expecting to provide an s3 key to be processed. Instead, this
  stack defines a lambda function to handle the deployment and tear down of
  databrew resources to be executed from within the step functions pipeline.
*/
export class DataQualityStack extends Stack {
  constructor(scope: Construct, id: string, props: DataQualityStackProps) {
    super(scope, id, props);

    /* ====== PERMISSIONS ====== */

    // role used by the databrew profiling job -> read/write to S3

    /* ====== RESOURCES LAMBDA ====== */

    // lambda function to handle setup and teardown of databrew resources

    /* ====== CHECK RESULTS LAMBDA ====== */

    // lambda function to check the results of the databrew profiling job

  }
}