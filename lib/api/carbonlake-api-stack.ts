import { Construct } from 'constructs';
import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';                 // core constructs
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam } from 'aws-cdk-lib';
import { aws_cognito as cognito } from 'aws-cdk-lib';
import { AssetCode, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AuthorizationType, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';


export class CarbonlakeApiStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create s3 raw data upload bucket
        const inputBucket = new s3.Bucket(this, 'sample-bucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false
        })
        
        var lambdaS3PolicyStatement = new iam.PolicyStatement()
        lambdaS3PolicyStatement.addActions(
          's3:PutObject',
          's3:GetObject'
        )
        lambdaS3PolicyStatement.addResources(
          inputBucket.bucketArn + '/*'
        );

        const s3AuthLambda = new lambda.Function(this, "s3UploadLambdaHandler", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('lambda/s3-authorizer'),
            handler: "index.handler",
            environment: {
                S3_RAW_DATA_BUCKET: inputBucket.bucketName
            },
            initialPolicy: [lambdaS3PolicyStatement]
        })

        const carbonLakeCalculatorLambda = new Function(this, 'carbonLakeCalculatorLambda', {
            code: new AssetCode('lambda/hello'),
            handler: 'hello.handler',
            runtime: Runtime.NODEJS_14_X
          });

        new lambda.CfnPermission(this, "ApiGatewayPermission", {
            functionName: s3AuthLambda.functionArn,
            action: "lambda:InvokeFunction",
            principal: "apigateway.amazonaws.com",
          });

        const uploadApiAuthorizer = new apigw.LambdaRestApi(
            this,
            "UploadApi",
            {
                handler: s3AuthLambda,
            }
        );

        // Define rest api with lambda handler backend
        const api = new apigw.LambdaRestApi(this, 'carbonlakeLambdaRestApi', {
            restApiName: 'Carbonlake API',
            handler: carbonLakeCalculatorLambda,
            proxy: false,
        });

        // Define CarbonLake cognito user pool for authentication
        const userPool = new cognito.UserPool(this, 'carbonlakeUserPool', {
            signInAliases: {
                email: true
            }
        })

        // Create API authorized for cognito user pool
        const authorizer = new apigw.CfnAuthorizer(this, 'cfnAuth', {
            restApiId: carbonLakeCalculatorLambda.restApiId,
            name: 'CarbonLakeCalculatorAPIAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [userPool.userPoolArn],
          })

        api.root.addMethod('ANY');

        const input = api.root.addResource('input');
        input.addMethod('POST', new LambdaIntegration(carbonLakeCalculatorLambda), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        });
        
        const upload = input.addResource('upload');
        upload.addMethod('POST');

        const data = input.addResource('data');
        data.addMethod('POST')



    }
}