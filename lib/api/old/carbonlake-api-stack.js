"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeApiStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib"); // core constructs
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const aws_cdk_lib_4 = require("aws-cdk-lib");
const aws_cdk_lib_5 = require("aws-cdk-lib");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const path = __importStar(require("path"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsNkNBQWdFLENBQWlCLGtCQUFrQjtBQUNuRyw2Q0FBc0Q7QUFDdEQsNkNBQW1EO0FBQ25ELDZDQUEyQztBQUUzQyw2Q0FBcUQ7QUFFckQsK0RBQWtGO0FBQ2xGLDJDQUE2QjtBQUc3QixNQUFhLGtCQUFtQixTQUFRLG1CQUFLO0lBQ3pDLFlBQVksS0FBVSxFQUFFLEVBQVUsRUFBRSxLQUFrQjtRQUNsRCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixtQ0FBbUM7UUFDbkMsTUFBTSxlQUFlLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDM0QsVUFBVSxFQUFFLG9CQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtZQUMxQyxnQkFBZ0IsRUFBRSxLQUFLO1NBQzFCLENBQUMsQ0FBQTtRQUVGLE1BQU0sY0FBYyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQy9ELE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxZQUFZO1lBQ3JCLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUNyRSxDQUFDLENBQUM7UUFFTCw4Q0FBOEM7UUFDOUMsTUFBTSxHQUFHLEdBQUcsSUFBSSw0QkFBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ2pELFdBQVcsRUFBRSx5QkFBeUI7WUFDdEMsYUFBYSxFQUFFO2dCQUNiLFNBQVMsRUFBRSxLQUFLO2FBQ2pCO1lBQ0QsaUJBQWlCO1lBQ2pCLDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUU7b0JBQ1osY0FBYztvQkFDZCxZQUFZO29CQUNaLGVBQWU7b0JBQ2YsV0FBVztpQkFDWjtnQkFDRCxZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztnQkFDbEUsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsWUFBWSxFQUFFLENBQUMsdUJBQXVCLENBQUM7YUFDeEM7U0FDRixDQUFDLENBQUM7UUFFTCx5REFBeUQ7UUFDekQsTUFBTSxRQUFRLEdBQUcsSUFBSSx5QkFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDOUQsYUFBYSxFQUFFO2dCQUNYLEtBQUssRUFBRSxJQUFJO2FBQ2Q7U0FDSixDQUFDLENBQUE7UUFFRiw4Q0FBOEM7UUFDOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSw0QkFBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ3hELFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztZQUN4QixJQUFJLEVBQUUsbUNBQW1DO1lBQ3pDLElBQUksRUFBRSxvQkFBb0I7WUFDMUIsY0FBYyxFQUFFLHFDQUFxQztZQUNyRCxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO1NBQ3JDLENBQUMsQ0FBQTtRQUVKLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFeEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsU0FBUyxDQUNaLE1BQU0sRUFDTixJQUFJLDRCQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekMsaUJBQWlCLEVBQUUsa0NBQWlCLENBQUMsT0FBTztZQUM1QyxVQUFVLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxHQUFHO2FBQy9CO1NBQ0osQ0FBQyxDQUFDO1FBRVAsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxDQUNWLE1BQU0sRUFDTixJQUFJLDRCQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDekMsaUJBQWlCLEVBQUUsa0NBQWlCLENBQUMsT0FBTztZQUM1QyxVQUFVLEVBQUU7Z0JBQ1IsWUFBWSxFQUFFLFVBQVUsQ0FBQyxHQUFHO2FBQy9CO1NBQ0osQ0FBQyxDQUFDO1FBSVAsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7SUFFcEQsQ0FBQztDQUNKO0FBbEZELGdEQWtGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQXBwLCBDZm5PdXRwdXQsIFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInOyAgICAgICAgICAgICAgICAgLy8gY29yZSBjb25zdHJ1Y3RzXG5pbXBvcnQgeyBhd3NfYXBpZ2F0ZXdheSBhcyBhcGlndyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2lhbSBhcyBpYW0gfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfY29nbml0byBhcyBjb2duaXRvIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQXNzZXRDb2RlLCBSdW50aW1lIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBBdXRob3JpemF0aW9uVHlwZSwgTGFtYmRhSW50ZWdyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5cbmV4cG9ydCBjbGFzcyBDYXJib25sYWtlQXBpU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IEFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBzMyByYXcgZGF0YSB1cGxvYWQgYnVja2V0XG4gICAgICAgIGNvbnN0IHJhd1VwbG9hZEJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ3Jhd1VwbG9hZEJ1Y2tldCcsIHtcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlXG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgczNVcGxvYWRMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdzM1VwbG9hZExhbWJkYScsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xNF9YLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2luZGV4Lm1haW4nLFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xhbWJkYS91cGxvYWQnKSksXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRGVmaW5lIHJlc3QgYXBpIHdpdGggbGFtYmRhIGhhbmRsZXIgYmFja2VuZFxuICAgICAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ3cuUmVzdEFwaSh0aGlzLCAnY2FyYm9ubGFrZUFwaScsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUkVTVCBBUEkgZm9yIENhcmJvbkxha2UnLFxuICAgICAgICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdkZXYnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIPCfkYcgZW5hYmxlIENPUlNcbiAgICAgICAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICBhbGxvd01ldGhvZHM6IFsnT1BUSU9OUycsICdHRVQnLCAnUE9TVCcsICdQVVQnLCAnUEFUQ0gnLCAnREVMRVRFJ10sXG4gICAgICAgICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICAgICAgICAgIGFsbG93T3JpZ2luczogWydodHRwOi8vbG9jYWxob3N0OjMwMDAnXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRGVmaW5lIENhcmJvbkxha2UgY29nbml0byB1c2VyIHBvb2wgZm9yIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgIGNvbnN0IHVzZXJQb29sID0gbmV3IGNvZ25pdG8uVXNlclBvb2wodGhpcywgJ2NhcmJvbmxha2VVc2VyUG9vbCcsIHtcbiAgICAgICAgICAgIHNpZ25JbkFsaWFzZXM6IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIENyZWF0ZSBBUEkgYXV0aG9yaXplZCBmb3IgY29nbml0byB1c2VyIHBvb2xcbiAgICAgICAgY29uc3QgYXV0aG9yaXplciA9IG5ldyBhcGlndy5DZm5BdXRob3JpemVyKHRoaXMsICdjZm5BdXRoJywge1xuICAgICAgICAgICAgcmVzdEFwaUlkOiBhcGkucmVzdEFwaUlkLFxuICAgICAgICAgICAgbmFtZTogJ0NhcmJvbkxha2VDYWxjdWxhdG9yQVBJQXV0aG9yaXplcicsXG4gICAgICAgICAgICB0eXBlOiAnQ09HTklUT19VU0VSX1BPT0xTJyxcbiAgICAgICAgICAgIGlkZW50aXR5U291cmNlOiAnbWV0aG9kLnJlcXVlc3QuaGVhZGVyLkF1dGhvcml6YXRpb24nLFxuICAgICAgICAgICAgcHJvdmlkZXJBcm5zOiBbdXNlclBvb2wudXNlclBvb2xBcm5dLFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgYXBpLnJvb3QuYWRkTWV0aG9kKCdBTlknKTtcblxuICAgICAgICBjb25zdCBpbnB1dCA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbnB1dCcpO1xuICAgICAgICBpbnB1dC5hZGRSZXNvdXJjZSgnQUxMJylcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHVwbG9hZCA9IGlucHV0LmFkZFJlc291cmNlKCd1cGxvYWQnKTtcbiAgICAgICAgdXBsb2FkLmFkZE1ldGhvZChcbiAgICAgICAgICAgICdQT1NUJyxcbiAgICAgICAgICAgIG5ldyBhcGlndy5MYW1iZGFJbnRlZ3JhdGlvbihzM1VwbG9hZExhbWJkYSksIHtcbiAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogQXV0aG9yaXphdGlvblR5cGUuQ09HTklUTyxcbiAgICAgICAgICAgICAgICBhdXRob3JpemVyOiB7XG4gICAgICAgICAgICAgICAgICAgIGF1dGhvcml6ZXJJZDogYXV0aG9yaXplci5yZWZcbiAgICAgICAgICAgICAgICB9ICAgIFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IGlucHV0LmFkZFJlc291cmNlKCdkYXRhJyk7XG4gICAgICAgIGRhdGEuYWRkTWV0aG9kKFxuICAgICAgICAgICAgJ1BPU1QnLFxuICAgICAgICAgICAgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKHMzVXBsb2FkTGFtYmRhKSwge1xuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgICAgICAgICAgIGF1dGhvcml6ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXplcklkOiBhdXRob3JpemVyLnJlZlxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBcblxuICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdhcGlVcmwnLCB7dmFsdWU6IGFwaS51cmx9KTtcblxuICAgIH1cbn0iXX0=