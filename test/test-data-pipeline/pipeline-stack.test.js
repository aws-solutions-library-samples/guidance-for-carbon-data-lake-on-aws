"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_qs_pipeline_stack_1 = require("../../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack");
describe('test pipeline stack', () => {
    let template;
    beforeEach(() => {
        /* ====== SETUP ====== */
        const app = new aws_cdk_lib_1.App();
        // Pipeline stack requires the following props, create a dummy stack
        // to provide suitable inputs:
        //   - dataLineageFunction
        //   - landingBucket
        //   - rawBucket
        //   - transformedBucket
        //   - enrichedBucket
        const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack');
        const dummyFunction = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, 'dummyFunction', {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
            handler: 'lambda_handler',
        });
        const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {});
        // create the pipeline stack with the required props
        const pipelineStack = new carbonlake_qs_pipeline_stack_1.CarbonlakeQuickstartPipelineStack(app, 'PipelineStack', {
            dataLineageFunction: dummyFunction,
            //landingBucket: dummyBucket, <--remove because bucket is now created in pipeline stack
            errorBucket: dummyBucket,
            rawBucket: dummyBucket,
            transformedBucket: dummyBucket,
            enrichedBucket: dummyBucket,
            notificationEmailAddress: 'a@b.com',
        });
        // synth a cloudformation template from the stack
        const template = assertions_1.Template.fromStack(pipelineStack);
    });
    afterEach(() => {
        template = null;
    });
    test('synthesises as expected', () => {
        /* ====== ASSERTIONS ====== */
        // verify nested stack creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::CloudFormation::Stack', 4);
        // verify lambda creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 3);
        template === null || template === void 0 ? void 0 : template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'app.lambda_handler',
            Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        });
        // verify iam role & policy creation for all lambdas
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsNkNBQXdDO0FBQ3hDLDZDQUEwQztBQUMxQyw2Q0FBa0Q7QUFFbEQsb0hBQXFIO0FBRXJILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxRQUF5QixDQUFBO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBRTNELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQzNFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV0RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnRUFBaUMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQ2hGLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsdUZBQXVGO1lBQ3ZGLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLGlCQUFpQixFQUFFLFdBQVc7WUFDOUIsY0FBYyxFQUFFLFdBQVc7WUFDM0Isd0JBQXdCLEVBQUUsU0FBUztTQUNwQyxDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBRTlCLCtCQUErQjtRQUMvQixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBQztRQUUxRCx5QkFBeUI7UUFDekIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUM7UUFDckQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFO1lBQ3ZELE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1NBQ3hDLEVBQUM7UUFFRixvREFBb0Q7UUFDcEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUM7UUFDOUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUM7SUFDbEQsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hdGNoLCBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnXG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IENhcmJvbmxha2VRdWlja3N0YXJ0UGlwZWxpbmVTdGFjayB9IGZyb20gJy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jYXJib25sYWtlLXFzLXBpcGVsaW5lLXN0YWNrJ1xuXG5kZXNjcmliZSgndGVzdCBwaXBlbGluZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gUGlwZWxpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAvLyAgIC0gZGF0YUxpbmVhZ2VGdW5jdGlvblxuICAgIC8vICAgLSBsYW5kaW5nQnVja2V0XG4gICAgLy8gICAtIHJhd0J1Y2tldFxuICAgIC8vICAgLSB0cmFuc2Zvcm1lZEJ1Y2tldFxuICAgIC8vICAgLSBlbnJpY2hlZEJ1Y2tldFxuICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnRHVtbXlJbnB1dHNTdGFjaycpXG5cbiAgICBjb25zdCBkdW1teUZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzksXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKCdkZWYgbGFtYmRhX2hhbmRsZXIoKTogcGFzcycpLFxuICAgICAgaGFuZGxlcjogJ2xhbWJkYV9oYW5kbGVyJyxcbiAgICB9KVxuICAgIGNvbnN0IGR1bW15QnVja2V0ID0gbmV3IHMzLkJ1Y2tldChkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlCdWNrZXQnLCB7fSlcblxuICAgIC8vIGNyZWF0ZSB0aGUgcGlwZWxpbmUgc3RhY2sgd2l0aCB0aGUgcmVxdWlyZWQgcHJvcHNcbiAgICBjb25zdCBwaXBlbGluZVN0YWNrID0gbmV3IENhcmJvbmxha2VRdWlja3N0YXJ0UGlwZWxpbmVTdGFjayhhcHAsICdQaXBlbGluZVN0YWNrJywge1xuICAgICAgZGF0YUxpbmVhZ2VGdW5jdGlvbjogZHVtbXlGdW5jdGlvbixcbiAgICAgIC8vbGFuZGluZ0J1Y2tldDogZHVtbXlCdWNrZXQsIDwtLXJlbW92ZSBiZWNhdXNlIGJ1Y2tldCBpcyBub3cgY3JlYXRlZCBpbiBwaXBlbGluZSBzdGFja1xuICAgICAgZXJyb3JCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgcmF3QnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIHRyYW5zZm9ybWVkQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIGVucmljaGVkQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIG5vdGlmaWNhdGlvbkVtYWlsQWRkcmVzczogJ2FAYi5jb20nLFxuICAgIH0pXG5cbiAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2socGlwZWxpbmVTdGFjaylcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIHRlbXBsYXRlID0gbnVsbFxuICB9KVxuICB0ZXN0KCdzeW50aGVzaXNlcyBhcyBleHBlY3RlZCcsICgpID0+IHtcbiAgICAvKiA9PT09PT0gQVNTRVJUSU9OUyA9PT09PT0gKi9cblxuICAgIC8vIHZlcmlmeSBuZXN0ZWQgc3RhY2sgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsIDQpXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIGNyZWF0aW9uXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgMylcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCB7XG4gICAgICBIYW5kbGVyOiAnYXBwLmxhbWJkYV9oYW5kbGVyJyxcbiAgICAgIFJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzkubmFtZSxcbiAgICB9KVxuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhc1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpSb2xlJywgMylcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6UG9saWN5JywgMylcbiAgfSlcbn0pXG4iXX0=