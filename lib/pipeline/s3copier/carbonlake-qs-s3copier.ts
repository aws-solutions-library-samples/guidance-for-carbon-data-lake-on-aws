import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

export interface CarbonlakeQuickstartS3copierStackProps extends NestedStackProps {
  landingBucket: s3.Bucket;
  rawBucket: s3.Bucket;
}

export class CarbonlakeQuickstartS3copierStack extends NestedStack {
  constructor(scope: Construct, id: string, props: CarbonlakeQuickstartS3copierStackProps) {
    super(scope, id, props);

    const s3copierLambda = new lambda.Function(this, "carbonLakeS3copierHandler", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: "s3copierLambda.lambda_handler",
      environment: {
        INPUT_S3_BUCKET_NAME: props.landingBucket.bucketName,
        OUTPUT_S3_BUCKET_NAME: props.rawBucket.bucketName
      }
    });

    props.landingBucket.grantRead(s3copierLambda);
    props.rawBucket.grantWrite(s3copierLambda);
  }
}