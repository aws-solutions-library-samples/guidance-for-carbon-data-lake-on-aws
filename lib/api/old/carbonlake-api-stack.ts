import { Construct } from 'constructs';
import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';                 // core constructs
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_cognito as cognito } from 'aws-cdk-lib';
import { AssetCode, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AuthorizationType, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';


export class CarbonlakeApiStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create s3 raw data upload bucket
        const rawUploadBucket = new s3.Bucket(this, 'rawUploadBucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            publicReadAccess: false
        })

        const s3UploadLambda = new lambda.Function(this, 's3UploadLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.main',
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda/upload')),
          });

        // Define rest api with lambda handler backend
        const api = new apigw.RestApi(this, 'carbonlakeApi', {
            description: 'REST API for CarbonLake',
            deployOptions: {
              stageName: 'dev',
            },
            // 👇 enable CORS
            defaultCorsPreflightOptions: {
              allowHeaders: [
                'Content-Type',
                'X-Amz-Date',
                'Authorization',
                'X-Api-Key',
              ],
              allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
              allowCredentials: true,
              allowOrigins: ['http://localhost:3000'],
            },
          });

        // Define CarbonLake cognito user pool for authentication
        const userPool = new cognito.UserPool(this, 'carbonlakeUserPool', {
            signInAliases: {
                email: true
            }
        })

        // Create API authorized for cognito user pool
        const authorizer = new apigw.CfnAuthorizer(this, 'cfnAuth', {
            restApiId: api.restApiId,
            name: 'CarbonLakeCalculatorAPIAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [userPool.userPoolArn],
          })

        api.root.addMethod('ANY');

        const input = api.root.addResource('input');
        input.addResource('ALL')
        
        const upload = input.addResource('upload');
        upload.addMethod(
            'POST',
            new apigw.LambdaIntegration(s3UploadLambda), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: {
                    authorizerId: authorizer.ref
                }    
            });

        const data = input.addResource('data');
        data.addMethod(
            'POST',
            new apigw.LambdaIntegration(s3UploadLambda), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: {
                    authorizerId: authorizer.ref
                }    
            });

        

        new CfnOutput(this, 'apiUrl', {value: api.url});

    }
}