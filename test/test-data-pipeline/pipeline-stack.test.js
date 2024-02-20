"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const stack_data_pipeline_1 = require("../../lib/stacks/stack-data-pipeline/stack-data-pipeline");
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
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_12,
            code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
            handler: 'lambda_handler',
        });
        const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {});
        // create the pipeline stack with the required props
        const pipelineStack = new stack_data_pipeline_1.DataPipelineStack(app, 'PipelineStack', {
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
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_12.name,
        });
        // verify iam role & policy creation for all lambdas
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsNkNBQXdDO0FBQ3hDLDZDQUEwQztBQUMxQyw2Q0FBa0Q7QUFFbEQsa0dBQTRGO0FBRTVGLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxRQUF5QixDQUFBO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBRTNELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQzNFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV0RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSx1Q0FBaUIsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQ2hFLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsdUZBQXVGO1lBQ3ZGLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLGlCQUFpQixFQUFFLFdBQVc7WUFDOUIsY0FBYyxFQUFFLFdBQVc7WUFDM0Isd0JBQXdCLEVBQUUsU0FBUztTQUNwQyxDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBRTlCLCtCQUErQjtRQUMvQixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTFELHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3JELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSTtTQUN6QyxDQUFDLENBQUE7UUFFRixvREFBb0Q7UUFDcEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJ1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJ1xuXG5pbXBvcnQgeyBEYXRhUGlwZWxpbmVTdGFjayB9IGZyb20gJy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9zdGFjay1kYXRhLXBpcGVsaW5lJ1xuXG5kZXNjcmliZSgndGVzdCBwaXBlbGluZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gUGlwZWxpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAvLyAgIC0gZGF0YUxpbmVhZ2VGdW5jdGlvblxuICAgIC8vICAgLSBsYW5kaW5nQnVja2V0XG4gICAgLy8gICAtIHJhd0J1Y2tldFxuICAgIC8vICAgLSB0cmFuc2Zvcm1lZEJ1Y2tldFxuICAgIC8vICAgLSBlbnJpY2hlZEJ1Y2tldFxuICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnRHVtbXlJbnB1dHNTdGFjaycpXG5cbiAgICBjb25zdCBkdW1teUZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUlubGluZSgnZGVmIGxhbWJkYV9oYW5kbGVyKCk6IHBhc3MnKSxcbiAgICAgIGhhbmRsZXI6ICdsYW1iZGFfaGFuZGxlcicsXG4gICAgfSlcbiAgICBjb25zdCBkdW1teUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoZHVtbXlJbnB1dHNTdGFjaywgJ2R1bW15QnVja2V0Jywge30pXG5cbiAgICAvLyBjcmVhdGUgdGhlIHBpcGVsaW5lIHN0YWNrIHdpdGggdGhlIHJlcXVpcmVkIHByb3BzXG4gICAgY29uc3QgcGlwZWxpbmVTdGFjayA9IG5ldyBEYXRhUGlwZWxpbmVTdGFjayhhcHAsICdQaXBlbGluZVN0YWNrJywge1xuICAgICAgZGF0YUxpbmVhZ2VGdW5jdGlvbjogZHVtbXlGdW5jdGlvbixcbiAgICAgIC8vbGFuZGluZ0J1Y2tldDogZHVtbXlCdWNrZXQsIDwtLXJlbW92ZSBiZWNhdXNlIGJ1Y2tldCBpcyBub3cgY3JlYXRlZCBpbiBwaXBlbGluZSBzdGFja1xuICAgICAgZXJyb3JCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgcmF3QnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIHRyYW5zZm9ybWVkQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIGVucmljaGVkQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIG5vdGlmaWNhdGlvbkVtYWlsQWRkcmVzczogJ2FAYi5jb20nLFxuICAgIH0pXG5cbiAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2socGlwZWxpbmVTdGFjaylcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIHRlbXBsYXRlID0gbnVsbFxuICB9KVxuICB0ZXN0KCdzeW50aGVzaXNlcyBhcyBleHBlY3RlZCcsICgpID0+IHtcbiAgICAvKiA9PT09PT0gQVNTRVJUSU9OUyA9PT09PT0gKi9cblxuICAgIC8vIHZlcmlmeSBuZXN0ZWQgc3RhY2sgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsIDQpXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIGNyZWF0aW9uXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgMylcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCB7XG4gICAgICBIYW5kbGVyOiAnYXBwLmxhbWJkYV9oYW5kbGVyJyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyLm5hbWUsXG4gICAgfSlcblxuICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6Um9sZScsIDMpXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlBvbGljeScsIDMpXG4gIH0pXG59KVxuIl19