"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeApiStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib"); // core constructs
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const aws_cdk_lib_4 = require("aws-cdk-lib");
const aws_cdk_lib_5 = require("aws-cdk-lib");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
class CarbonlakeApiStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create s3 raw data upload bucket
        const inputBucket = new aws_cdk_lib_4.aws_s3.Bucket(this, 'sample-bucket', {
            encryption: aws_cdk_lib_4.aws_s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false
        });
        var lambdaS3PolicyStatement = new iam.PolicyStatement();
        lambdaS3PolicyStatement.addActions('s3:PutObject', 's3:GetObject');
        lambdaS3PolicyStatement.addResources(inputBucket.bucketArn + '/*');
        const s3AuthLambda = new aws_cdk_lib_3.aws_lambda.Function(this, "s3UploadLambdaHandler", {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.NODEJS_14_X,
            code: aws_cdk_lib_3.aws_lambda.Code.fromAsset('lambda/s3-authorizer'),
            handler: "index.handler",
            environment: {
                S3_RAW_DATA_BUCKET: inputBucket.bucketName
            },
            initialPolicy: [lambdaS3PolicyStatement]
        });
        const carbonLakeCalculatorLambda = new Function(this, 'carbonLakeCalculatorLambda', {
            code: new aws_lambda_1.AssetCode('lambda/hello'),
            handler: 'hello.handler',
            runtime: aws_lambda_1.Runtime.NODEJS_14_X
        });
        new aws_cdk_lib_3.aws_lambda.CfnPermission(this, "ApiGatewayPermission", {
            functionName: s3AuthLambda.functionArn,
            action: "lambda:InvokeFunction",
            principal: "apigateway.amazonaws.com",
        });
        const uploadApiAuthorizer = new aws_cdk_lib_2.aws_apigateway.LambdaRestApi(this, "UploadApi", {
            handler: s3AuthLambda,
        });
        // Define rest api with lambda handler backend
        const api = new aws_cdk_lib_2.aws_apigateway.LambdaRestApi(this, 'carbonlakeLambdaRestApi', {
            restApiName: 'Carbonlake API',
            handler: carbonLakeCalculatorLambda,
            proxy: false,
        });
        // Define CarbonLake cognito user pool for authentication
        const userPool = new aws_cdk_lib_5.aws_cognito.UserPool(this, 'carbonlakeUserPool', {
            signInAliases: {
                email: true
            }
        });
        // Create API authorized for cognito user pool
        const authorizer = new aws_cdk_lib_2.aws_apigateway.CfnAuthorizer(this, 'cfnAuth', {
            restApiId: carbonLakeCalculatorLambda.restApiId,
            name: 'CarbonLakeCalculatorAPIAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [userPool.userPoolArn],
        });
        api.root.addMethod('ANY');
        const input = api.root.addResource('input');
        input.addMethod('POST', new aws_apigateway_1.LambdaIntegration(carbonLakeCalculatorLambda), {
            authorizationType: aws_apigateway_1.AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        });
        const upload = input.addResource('upload');
        upload.addMethod('POST');
        const data = input.addResource('data');
        data.addMethod('POST');
    }
}
exports.CarbonlakeApiStack = CarbonlakeApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBZ0UsQ0FBaUIsa0JBQWtCO0FBQ25HLDZDQUFzRDtBQUN0RCw2Q0FBbUQ7QUFDbkQsNkNBQTJDO0FBRTNDLDZDQUFxRDtBQUNyRCx1REFBNEQ7QUFDNUQsK0RBQWtGO0FBR2xGLE1BQWEsa0JBQW1CLFNBQVEsbUJBQUs7SUFDekMsWUFBWSxLQUFVLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQ2xELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG1DQUFtQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDckQsVUFBVSxFQUFFLG9CQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtZQUMxQyxnQkFBZ0IsRUFBRSxLQUFLO1NBQzFCLENBQUMsQ0FBQTtRQUVGLElBQUksdUJBQXVCLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDdkQsdUJBQXVCLENBQUMsVUFBVSxDQUNoQyxjQUFjLEVBQ2QsY0FBYyxDQUNmLENBQUE7UUFDRCx1QkFBdUIsQ0FBQyxZQUFZLENBQ2xDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUM3QixDQUFDO1FBRUYsTUFBTSxZQUFZLEdBQUcsSUFBSSx3QkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDcEUsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsSUFBSSxFQUFFLHdCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQztZQUNuRCxPQUFPLEVBQUUsZUFBZTtZQUN4QixXQUFXLEVBQUU7Z0JBQ1Qsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLFVBQVU7YUFDN0M7WUFDRCxhQUFhLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztTQUMzQyxDQUFDLENBQUE7UUFFRixNQUFNLDBCQUEwQixHQUFHLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUNoRixJQUFJLEVBQUUsSUFBSSxzQkFBUyxDQUFDLGNBQWMsQ0FBQztZQUNuQyxPQUFPLEVBQUUsZUFBZTtZQUN4QixPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO1NBQzdCLENBQUMsQ0FBQztRQUVMLElBQUksd0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQ25ELFlBQVksRUFBRSxZQUFZLENBQUMsV0FBVztZQUN0QyxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLFNBQVMsRUFBRSwwQkFBMEI7U0FDdEMsQ0FBQyxDQUFDO1FBRUwsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLDRCQUFLLENBQUMsYUFBYSxDQUMvQyxJQUFJLEVBQ0osV0FBVyxFQUNYO1lBQ0ksT0FBTyxFQUFFLFlBQVk7U0FDeEIsQ0FDSixDQUFDO1FBRUYsOENBQThDO1FBQzlDLE1BQU0sR0FBRyxHQUFHLElBQUksNEJBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFO1lBQ2pFLFdBQVcsRUFBRSxnQkFBZ0I7WUFDN0IsT0FBTyxFQUFFLDBCQUEwQjtZQUNuQyxLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztRQUVILHlEQUF5RDtRQUN6RCxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM5RCxhQUFhLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7YUFDZDtTQUNKLENBQUMsQ0FBQTtRQUVGLDhDQUE4QztRQUM5QyxNQUFNLFVBQVUsR0FBRyxJQUFJLDRCQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEQsU0FBUyxFQUFFLDBCQUEwQixDQUFDLFNBQVM7WUFDL0MsSUFBSSxFQUFFLG1DQUFtQztZQUN6QyxJQUFJLEVBQUUsb0JBQW9CO1lBQzFCLGNBQWMsRUFBRSxxQ0FBcUM7WUFDckQsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztTQUNyQyxDQUFDLENBQUE7UUFFSixHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLGtDQUFpQixDQUFDLDBCQUEwQixDQUFDLEVBQUU7WUFDdkUsaUJBQWlCLEVBQUUsa0NBQWlCLENBQUMsT0FBTztZQUM1QyxVQUFVLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxHQUFHO2FBQy9CO1NBQ0osQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXpCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUkxQixDQUFDO0NBQ0o7QUEzRkQsZ0RBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBBcHAsIENmbk91dHB1dCwgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7ICAgICAgICAgICAgICAgICAvLyBjb3JlIGNvbnN0cnVjdHNcbmltcG9ydCB7IGF3c19hcGlnYXRld2F5IGFzIGFwaWd3IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfaWFtIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2NvZ25pdG8gYXMgY29nbml0byB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEFzc2V0Q29kZSwgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQXV0aG9yaXphdGlvblR5cGUsIExhbWJkYUludGVncmF0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuXG5cbmV4cG9ydCBjbGFzcyBDYXJib25sYWtlQXBpU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IEFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBzMyByYXcgZGF0YSB1cGxvYWQgYnVja2V0XG4gICAgICAgIGNvbnN0IGlucHV0QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnc2FtcGxlLWJ1Y2tldCcsIHtcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICAgIFxuICAgICAgICB2YXIgbGFtYmRhUzNQb2xpY3lTdGF0ZW1lbnQgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpXG4gICAgICAgIGxhbWJkYVMzUG9saWN5U3RhdGVtZW50LmFkZEFjdGlvbnMoXG4gICAgICAgICAgJ3MzOlB1dE9iamVjdCcsXG4gICAgICAgICAgJ3MzOkdldE9iamVjdCdcbiAgICAgICAgKVxuICAgICAgICBsYW1iZGFTM1BvbGljeVN0YXRlbWVudC5hZGRSZXNvdXJjZXMoXG4gICAgICAgICAgaW5wdXRCdWNrZXQuYnVja2V0QXJuICsgJy8qJ1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHMzQXV0aExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgXCJzM1VwbG9hZExhbWJkYUhhbmRsZXJcIiwge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1gsXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYS9zMy1hdXRob3JpemVyJyksXG4gICAgICAgICAgICBoYW5kbGVyOiBcImluZGV4LmhhbmRsZXJcIixcbiAgICAgICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgICAgUzNfUkFXX0RBVEFfQlVDS0VUOiBpbnB1dEJ1Y2tldC5idWNrZXROYW1lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW5pdGlhbFBvbGljeTogW2xhbWJkYVMzUG9saWN5U3RhdGVtZW50XVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IGNhcmJvbkxha2VDYWxjdWxhdG9yTGFtYmRhID0gbmV3IEZ1bmN0aW9uKHRoaXMsICdjYXJib25MYWtlQ2FsY3VsYXRvckxhbWJkYScsIHtcbiAgICAgICAgICAgIGNvZGU6IG5ldyBBc3NldENvZGUoJ2xhbWJkYS9oZWxsbycpLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2hlbGxvLmhhbmRsZXInLFxuICAgICAgICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTRfWFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBsYW1iZGEuQ2ZuUGVybWlzc2lvbih0aGlzLCBcIkFwaUdhdGV3YXlQZXJtaXNzaW9uXCIsIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogczNBdXRoTGFtYmRhLmZ1bmN0aW9uQXJuLFxuICAgICAgICAgICAgYWN0aW9uOiBcImxhbWJkYTpJbnZva2VGdW5jdGlvblwiLFxuICAgICAgICAgICAgcHJpbmNpcGFsOiBcImFwaWdhdGV3YXkuYW1hem9uYXdzLmNvbVwiLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHVwbG9hZEFwaUF1dGhvcml6ZXIgPSBuZXcgYXBpZ3cuTGFtYmRhUmVzdEFwaShcbiAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICBcIlVwbG9hZEFwaVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IHMzQXV0aExhbWJkYSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBEZWZpbmUgcmVzdCBhcGkgd2l0aCBsYW1iZGEgaGFuZGxlciBiYWNrZW5kXG4gICAgICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlndy5MYW1iZGFSZXN0QXBpKHRoaXMsICdjYXJib25sYWtlTGFtYmRhUmVzdEFwaScsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnQ2FyYm9ubGFrZSBBUEknLFxuICAgICAgICAgICAgaGFuZGxlcjogY2FyYm9uTGFrZUNhbGN1bGF0b3JMYW1iZGEsXG4gICAgICAgICAgICBwcm94eTogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERlZmluZSBDYXJib25MYWtlIGNvZ25pdG8gdXNlciBwb29sIGZvciBhdXRoZW50aWNhdGlvblxuICAgICAgICBjb25zdCB1c2VyUG9vbCA9IG5ldyBjb2duaXRvLlVzZXJQb29sKHRoaXMsICdjYXJib25sYWtlVXNlclBvb2wnLCB7XG4gICAgICAgICAgICBzaWduSW5BbGlhc2VzOiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBDcmVhdGUgQVBJIGF1dGhvcml6ZWQgZm9yIGNvZ25pdG8gdXNlciBwb29sXG4gICAgICAgIGNvbnN0IGF1dGhvcml6ZXIgPSBuZXcgYXBpZ3cuQ2ZuQXV0aG9yaXplcih0aGlzLCAnY2ZuQXV0aCcsIHtcbiAgICAgICAgICAgIHJlc3RBcGlJZDogY2FyYm9uTGFrZUNhbGN1bGF0b3JMYW1iZGEucmVzdEFwaUlkLFxuICAgICAgICAgICAgbmFtZTogJ0NhcmJvbkxha2VDYWxjdWxhdG9yQVBJQXV0aG9yaXplcicsXG4gICAgICAgICAgICB0eXBlOiAnQ09HTklUT19VU0VSX1BPT0xTJyxcbiAgICAgICAgICAgIGlkZW50aXR5U291cmNlOiAnbWV0aG9kLnJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nLFxuICAgICAgICAgICAgcHJvdmlkZXJBcm5zOiBbdXNlclBvb2wudXNlclBvb2xBcm5dLFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdBTlknKTtcblxuICAgICAgICBjb25zdCBpbnB1dCA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbnB1dCcpO1xuICAgICAgICBpbnB1dC5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgTGFtYmRhSW50ZWdyYXRpb24oY2FyYm9uTGFrZUNhbGN1bGF0b3JMYW1iZGEpLCB7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogQXV0aG9yaXphdGlvblR5cGUuQ09HTklUTyxcbiAgICAgICAgICAgIGF1dGhvcml6ZXI6IHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemVySWQ6IGF1dGhvcml6ZXIucmVmXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBsb2FkID0gaW5wdXQuYWRkUmVzb3VyY2UoJ3VwbG9hZCcpO1xuICAgICAgICB1cGxvYWQuYWRkTWV0aG9kKCdQT1NUJyk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IGlucHV0LmFkZFJlc291cmNlKCdkYXRhJyk7XG4gICAgICAgIGRhdGEuYWRkTWV0aG9kKCdQT1NUJylcblxuXG5cbiAgICB9XG59Il19