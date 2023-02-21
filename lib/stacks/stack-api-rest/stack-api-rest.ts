import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { RestApi } from '../../constructs/construct-rest-api/construct-rest-api'

interface RestApiStackProps extends StackProps {
  landingBucket: cdk.aws_s3.Bucket,
}

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props)

    new RestApi(this, 'RestApi', {landingBucket: props.landingBucket});

    cdk.Tags.of(this).add("component", "restApi");
  }
}
