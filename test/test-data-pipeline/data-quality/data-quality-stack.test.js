"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const construct_data_quality_1 = require("../../../lib/stacks/stack-data-pipeline/construct-data-quality/construct-data-quality");
describe('test pipeline stack', () => {
    let template;
    beforeEach(() => {
        /* ====== SETUP ====== */
        const app = new aws_cdk_lib_1.App();
        // DQ stack requires the following props, create a dummy stack
        // to provide suitable inputs:
        //   - inputBucket
        //   - outputBucket
        //   - errorBucket
        const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack');
        const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {});
        // DQ stack is nested, create a parent stack as placeholder
        const parentStack = new aws_cdk_lib_1.Stack(app, 'DQParentStack', {});
        // create the pipeline stack with the required props
        const dqStack = new construct_data_quality_1.DataQuality(parentStack, 'DQStack', {
            inputBucket: dummyBucket,
            outputBucket: dummyBucket,
            errorBucket: dummyBucket,
        });
        // synth a cloudformation template from the stack
        const template = assertions_1.Template.fromStack(parentStack);
    });
    afterEach(() => {
        template = null;
    });
    test('synthesises as expected', () => {
        /* ====== ASSERTIONS ====== */
        // creates the results bucket
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::S3::Bucket', 1);
        // verify lambda creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 2);
        template === null || template === void 0 ? void 0 : template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'app.lambda_handler',
            Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        });
        // verify iam role & policy creation for all lambdas and dq job
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1xdWFsaXR5LXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLXF1YWxpdHktc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFDeEMsNkNBQTBDO0FBQzFDLDZDQUFrRDtBQUVsRCxrSUFBbUg7QUFFbkgsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNuQyxJQUFJLFFBQXlCLENBQUE7SUFDN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQiw4REFBOEQ7UUFDOUQsOEJBQThCO1FBQzlCLGtCQUFrQjtRQUNsQixtQkFBbUI7UUFDbkIsa0JBQWtCO1FBQ2xCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRXRFLDJEQUEyRDtRQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV2RCxvREFBb0Q7UUFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxvQ0FBVyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUU7WUFDdEQsV0FBVyxFQUFFLFdBQVc7WUFDeEIsWUFBWSxFQUFFLFdBQVc7WUFDekIsV0FBVyxFQUFFLFdBQVc7U0FDekIsQ0FBQyxDQUFBO1FBRUYsaURBQWlEO1FBQ2pELE1BQU0sUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0lBRUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLFFBQVEsR0FBRyxJQUFJLENBQUE7SUFDakIsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ25DLDhCQUE4QjtRQUU5Qiw2QkFBNkI7UUFDN0IsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUM7UUFFL0MseUJBQXlCO1FBQ3pCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFDO1FBQ3JELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxFQUFDO1FBRUYsK0RBQStEO1FBQy9ELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFDO1FBQzlDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJ1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJ1xuXG5pbXBvcnQgeyBEYXRhUXVhbGl0eSB9IGZyb20gJy4uLy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jb25zdHJ1Y3QtZGF0YS1xdWFsaXR5L2NvbnN0cnVjdC1kYXRhLXF1YWxpdHknXG5cbmRlc2NyaWJlKCd0ZXN0IHBpcGVsaW5lIHN0YWNrJywgKCkgPT4ge1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbFxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpXG5cbiAgICAvLyBEUSBzdGFjayByZXF1aXJlcyB0aGUgZm9sbG93aW5nIHByb3BzLCBjcmVhdGUgYSBkdW1teSBzdGFja1xuICAgIC8vIHRvIHByb3ZpZGUgc3VpdGFibGUgaW5wdXRzOlxuICAgIC8vICAgLSBpbnB1dEJ1Y2tldFxuICAgIC8vICAgLSBvdXRwdXRCdWNrZXRcbiAgICAvLyAgIC0gZXJyb3JCdWNrZXRcbiAgICBjb25zdCBkdW1teUlucHV0c1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ0R1bW15SW5wdXRzU3RhY2snKVxuICAgIGNvbnN0IGR1bW15QnVja2V0ID0gbmV3IHMzLkJ1Y2tldChkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlCdWNrZXQnLCB7fSlcblxuICAgIC8vIERRIHN0YWNrIGlzIG5lc3RlZCwgY3JlYXRlIGEgcGFyZW50IHN0YWNrIGFzIHBsYWNlaG9sZGVyXG4gICAgY29uc3QgcGFyZW50U3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnRFFQYXJlbnRTdGFjaycsIHt9KVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgIGNvbnN0IGRxU3RhY2sgPSBuZXcgRGF0YVF1YWxpdHkocGFyZW50U3RhY2ssICdEUVN0YWNrJywge1xuICAgICAgaW5wdXRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgb3V0cHV0QnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIGVycm9yQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICB9KVxuXG4gICAgLy8gc3ludGggYSBjbG91ZGZvcm1hdGlvbiB0ZW1wbGF0ZSBmcm9tIHRoZSBzdGFja1xuICAgIGNvbnN0IHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHBhcmVudFN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG5cbiAgdGVzdCgnc3ludGhlc2lzZXMgYXMgZXhwZWN0ZWQnLCAoKSA9PiB7XG4gICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG5cbiAgICAvLyBjcmVhdGVzIHRoZSByZXN1bHRzIGJ1Y2tldFxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6UzM6OkJ1Y2tldCcsIDEpXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIGNyZWF0aW9uXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgMilcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCB7XG4gICAgICBIYW5kbGVyOiAnYXBwLmxhbWJkYV9oYW5kbGVyJyxcbiAgICAgIFJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzkubmFtZSxcbiAgICB9KVxuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhcyBhbmQgZHEgam9iXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlJvbGUnLCAzKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpQb2xpY3knLCAzKVxuICB9KVxufSlcbiJdfQ==