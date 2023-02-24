import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';

interface RestApiProps {
  landingBucket: cdk.aws_s3.Bucket,
}

export class RestApi extends Construct {
  public readonly restHttpApi: HttpApi;

  constructor(scope: Construct, id: string, props: RestApiProps) {
    super(scope, id)

    const httpApi = new HttpApi(this, 'CDLRestApi', {
      description: 'CDL REST API'
    });    

    const activitiesLambda = new lambda.NodejsFunction(this, 'activities', {
      environment: {
        'LANDING_BUCKET': props.landingBucket.bucketName
      }
    });

    props.landingBucket.grantPut(activitiesLambda);

    const lineageLambda = new lambda.NodejsFunction(this, 'lineage');

    httpApi.addRoutes({
      path: '/activities',
      methods: [HttpMethod.POST, HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'ActivitiesApiIntegration',
        activitiesLambda,
      ),
    });

    httpApi.addRoutes({
      path: '/lineage',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'LineageApiIntegration',
        lineageLambda,
      ),
    });

    this.restHttpApi = httpApi;
  }
}