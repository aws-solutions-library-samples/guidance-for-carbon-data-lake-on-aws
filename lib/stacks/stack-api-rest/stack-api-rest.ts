import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { RestApi } from '../../constructs/construct-rest-api/construct-rest-api'
import { RestApiDocsSite } from '../../constructs/construct-rest-api/construct-rest-api-docs-site';

interface RestApiStackProps extends StackProps {
  landingBucket: cdk.aws_s3.Bucket,
}

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props)

    const restApi = new RestApi(this, 'RestApi', {landingBucket: props.landingBucket});
    const restApiDocsSite = new RestApiDocsSite(this, 'RestApiDocsSite', {
      restHttpApi: restApi.restHttpApi,
      env: props.env
    })

    new cdk.CfnOutput(this, 'restApiUrl', {
      value: restApi.restHttpApi.url ?? '',
      description: 'URL for the deployed REST API',
      exportName: 'cdlRestApiUrl',
    });

    new cdk.CfnOutput(this, 'restApiDocsSiteUrl', {
      value: `${restApi.restHttpApi.url}${restApiDocsSite.restApiDocsSitePath}`,
      description: 'URL for the deployed REST API docs site (i.e. Swagger)',
      exportName: 'cdlRestApiDocsSiteUrl'
    });

    new cdk.CfnOutput(this, 'restApiDocsSiteBucket', {
      value: restApiDocsSite.restApiDocsSiteBucket.bucketName,
      description: 'Bucket used to store artifacts for REST API docs site (i.e. Swagger)',
      exportName: 'cdlRestApiDocsSiteBucket'
    });

    new cdk.CfnOutput(this, 'restOpenApiSpecFile', {
      value: `${restApiDocsSite.restApiDocsSiteBucket.bucketName}/${restApiDocsSite.restApiSpecFile}`,
      description: 'Location of the OpenAPI spec file -- {bucketName}/{fileName}',
      exportName: 'cdlRestOpenApiSpecFile'
    });

    cdk.Tags.of(this).add("component", "restApi");
  }
}
