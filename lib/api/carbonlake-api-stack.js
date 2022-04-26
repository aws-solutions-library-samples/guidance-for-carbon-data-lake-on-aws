"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeApiStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib"); // core constructs
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const aws_cdk_lib_4 = require("aws-cdk-lib");
const aws_cdk_lib_5 = require("aws-cdk-lib");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const path = require("path");
class CarbonlakeApiStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create s3 raw data upload bucket
        const rawUploadBucket = new aws_cdk_lib_4.aws_s3.Bucket(this, 'rawUploadBucket', {
            encryption: aws_cdk_lib_4.aws_s3.BucketEncryption.S3_MANAGED,
            publicReadAccess: false
        });
        const s3UploadLambda = new aws_cdk_lib_3.aws_lambda.Function(this, 's3UploadLambda', {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.NODEJS_14_X,
            handler: 'index.main',
            code: aws_cdk_lib_3.aws_lambda.Code.fromAsset(path.join(__dirname, './lambda/upload')),
        });
        // Define rest api with lambda handler backend
        const api = new aws_cdk_lib_2.aws_apigateway.RestApi(this, 'carbonlakeApi', {
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
        const userPool = new aws_cdk_lib_5.aws_cognito.UserPool(this, 'carbonlakeUserPool', {
            signInAliases: {
                email: true
            }
        });
        // Create API authorized for cognito user pool
        const authorizer = new aws_cdk_lib_2.aws_apigateway.CfnAuthorizer(this, 'cfnAuth', {
            restApiId: api.restApiId,
            name: 'CarbonLakeCalculatorAPIAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [userPool.userPoolArn],
        });
        api.root.addMethod('ANY');
        const input = api.root.addResource('input');
        input.addResource('ALL');
        const upload = input.addResource('upload');
        upload.addMethod('POST', new aws_cdk_lib_2.aws_apigateway.LambdaIntegration(s3UploadLambda), {
            authorizationType: aws_apigateway_1.AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        });
        const data = input.addResource('data');
        data.addMethod('POST', new aws_cdk_lib_2.aws_apigateway.LambdaIntegration(s3UploadLambda), {
            authorizationType: aws_apigateway_1.AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        });
        new aws_cdk_lib_1.CfnOutput(this, 'apiUrl', { value: api.url });
    }
}
exports.CarbonlakeApiStack = CarbonlakeApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBZ0UsQ0FBaUIsa0JBQWtCO0FBQ25HLDZDQUFzRDtBQUN0RCw2Q0FBbUQ7QUFDbkQsNkNBQTJDO0FBRTNDLDZDQUFxRDtBQUVyRCwrREFBa0Y7QUFDbEYsNkJBQTZCO0FBRzdCLE1BQWEsa0JBQW1CLFNBQVEsbUJBQUs7SUFDekMsWUFBWSxLQUFVLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQ2xELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLG1DQUFtQztRQUNuQyxNQUFNLGVBQWUsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUMzRCxVQUFVLEVBQUUsb0JBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLGdCQUFnQixFQUFFLEtBQUs7U0FDMUIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxjQUFjLEdBQUcsSUFBSSx3QkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDL0QsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLFlBQVk7WUFDckIsSUFBSSxFQUFFLHdCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3JFLENBQUMsQ0FBQztRQUVMLDhDQUE4QztRQUM5QyxNQUFNLEdBQUcsR0FBRyxJQUFJLDRCQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDakQsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxhQUFhLEVBQUU7Z0JBQ2IsU0FBUyxFQUFFLEtBQUs7YUFDakI7WUFDRCxpQkFBaUI7WUFDakIsMkJBQTJCLEVBQUU7Z0JBQzNCLFlBQVksRUFBRTtvQkFDWixjQUFjO29CQUNkLFlBQVk7b0JBQ1osZUFBZTtvQkFDZixXQUFXO2lCQUNaO2dCQUNELFlBQVksRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO2dCQUNsRSxnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixZQUFZLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQzthQUN4QztTQUNGLENBQUMsQ0FBQztRQUVMLHlEQUF5RDtRQUN6RCxNQUFNLFFBQVEsR0FBRyxJQUFJLHlCQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM5RCxhQUFhLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7YUFDZDtTQUNKLENBQUMsQ0FBQTtRQUVGLDhDQUE4QztRQUM5QyxNQUFNLFVBQVUsR0FBRyxJQUFJLDRCQUFLLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDeEQsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO1lBQ3hCLElBQUksRUFBRSxtQ0FBbUM7WUFDekMsSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixjQUFjLEVBQUUscUNBQXFDO1lBQ3JELFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7U0FDckMsQ0FBQyxDQUFBO1FBRUosR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFMUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUV4QixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQ1osTUFBTSxFQUNOLElBQUksNEJBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN6QyxpQkFBaUIsRUFBRSxrQ0FBaUIsQ0FBQyxPQUFPO1lBQzVDLFVBQVUsRUFBRTtnQkFDUixZQUFZLEVBQUUsVUFBVSxDQUFDLEdBQUc7YUFDL0I7U0FDSixDQUFDLENBQUM7UUFFUCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQ1YsTUFBTSxFQUNOLElBQUksNEJBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN6QyxpQkFBaUIsRUFBRSxrQ0FBaUIsQ0FBQyxPQUFPO1lBQzVDLFVBQVUsRUFBRTtnQkFDUixZQUFZLEVBQUUsVUFBVSxDQUFDLEdBQUc7YUFDL0I7U0FDSixDQUFDLENBQUM7UUFJUCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUVwRCxDQUFDO0NBQ0o7QUFsRkQsZ0RBa0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBBcHAsIENmbk91dHB1dCwgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7ICAgICAgICAgICAgICAgICAvLyBjb3JlIGNvbnN0cnVjdHNcbmltcG9ydCB7IGF3c19hcGlnYXRld2F5IGFzIGFwaWd3IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfaWFtIGFzIGlhbSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19jb2duaXRvIGFzIGNvZ25pdG8gfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBBc3NldENvZGUsIFJ1bnRpbWUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IEF1dGhvcml6YXRpb25UeXBlLCBMYW1iZGFJbnRlZ3JhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cblxuZXhwb3J0IGNsYXNzIENhcmJvbmxha2VBcGlTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHMzIHJhdyBkYXRhIHVwbG9hZCBidWNrZXRcbiAgICAgICAgY29uc3QgcmF3VXBsb2FkQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAncmF3VXBsb2FkQnVja2V0Jywge1xuICAgICAgICAgICAgZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgICAgICAgICAgcHVibGljUmVhZEFjY2VzczogZmFsc2VcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBzM1VwbG9hZExhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ3MzVXBsb2FkTGFtYmRhJywge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1gsXG4gICAgICAgICAgICBoYW5kbGVyOiAnaW5kZXgubWFpbicsXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4vbGFtYmRhL3VwbG9hZCcpKSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgcmVzdCBhcGkgd2l0aCBsYW1iZGEgaGFuZGxlciBiYWNrZW5kXG4gICAgICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlndy5SZXN0QXBpKHRoaXMsICdjYXJib25sYWtlQXBpJywge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSRVNUIEFQSSBmb3IgQ2FyYm9uTGFrZScsXG4gICAgICAgICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgICAgICAgIHN0YWdlTmFtZTogJ2RldicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8g8J+RhyBlbmFibGUgQ09SU1xuICAgICAgICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgICAgICAgJ1gtQXBpLUtleScsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGFsbG93TWV0aG9kczogWydPUFRJT05TJywgJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdQQVRDSCcsICdERUxFVEUnXSxcbiAgICAgICAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgICAgICAgYWxsb3dPcmlnaW5zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgQ2FyYm9uTGFrZSBjb2duaXRvIHVzZXIgcG9vbCBmb3IgYXV0aGVudGljYXRpb25cbiAgICAgICAgY29uc3QgdXNlclBvb2wgPSBuZXcgY29nbml0by5Vc2VyUG9vbCh0aGlzLCAnY2FyYm9ubGFrZVVzZXJQb29sJywge1xuICAgICAgICAgICAgc2lnbkluQWxpYXNlczoge1xuICAgICAgICAgICAgICAgIGVtYWlsOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gQ3JlYXRlIEFQSSBhdXRob3JpemVkIGZvciBjb2duaXRvIHVzZXIgcG9vbFxuICAgICAgICBjb25zdCBhdXRob3JpemVyID0gbmV3IGFwaWd3LkNmbkF1dGhvcml6ZXIodGhpcywgJ2NmbkF1dGgnLCB7XG4gICAgICAgICAgICByZXN0QXBpSWQ6IGFwaS5yZXN0QXBpSWQsXG4gICAgICAgICAgICBuYW1lOiAnQ2FyYm9uTGFrZUNhbGN1bGF0b3JBUElBdXRob3JpemVyJyxcbiAgICAgICAgICAgIHR5cGU6ICdDT0dOSVRPX1VTRVJfUE9PTFMnLFxuICAgICAgICAgICAgaWRlbnRpdHlTb3VyY2U6ICdtZXRob2QucmVxdWVzdC5oZWFkZXIuQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgICBwcm92aWRlckFybnM6IFt1c2VyUG9vbC51c2VyUG9vbEFybl0sXG4gICAgICAgICAgfSlcblxuICAgICAgICBhcGkucm9vdC5hZGRNZXRob2QoJ0FOWScpO1xuXG4gICAgICAgIGNvbnN0IGlucHV0ID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2lucHV0Jyk7XG4gICAgICAgIGlucHV0LmFkZFJlc291cmNlKCdBTEwnKVxuICAgICAgICBcbiAgICAgICAgY29uc3QgdXBsb2FkID0gaW5wdXQuYWRkUmVzb3VyY2UoJ3VwbG9hZCcpO1xuICAgICAgICB1cGxvYWQuYWRkTWV0aG9kKFxuICAgICAgICAgICAgJ1BPU1QnLFxuICAgICAgICAgICAgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKHMzVXBsb2FkTGFtYmRhKSwge1xuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgICAgICAgICAgIGF1dGhvcml6ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXplcklkOiBhdXRob3JpemVyLnJlZlxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBkYXRhID0gaW5wdXQuYWRkUmVzb3VyY2UoJ2RhdGEnKTtcbiAgICAgICAgZGF0YS5hZGRNZXRob2QoXG4gICAgICAgICAgICAnUE9TVCcsXG4gICAgICAgICAgICBuZXcgYXBpZ3cuTGFtYmRhSW50ZWdyYXRpb24oczNVcGxvYWRMYW1iZGEpLCB7XG4gICAgICAgICAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IEF1dGhvcml6YXRpb25UeXBlLkNPR05JVE8sXG4gICAgICAgICAgICAgICAgYXV0aG9yaXplcjoge1xuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemVySWQ6IGF1dGhvcml6ZXIucmVmXG4gICAgICAgICAgICAgICAgfSAgICBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIFxuXG4gICAgICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ2FwaVVybCcsIHt2YWx1ZTogYXBpLnVybH0pO1xuXG4gICAgfVxufSJdfQ==