"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_qs_data_quality_1 = require("../../../lib/stacks/stack-data-pipeline/data-quality/carbonlake-qs-data-quality");
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
        const dqStack = new carbonlake_qs_data_quality_1.CarbonlakeDataQualityStack(parentStack, 'DQStack', {
            inputBucket: dummyBucket,
            outputBucket: dummyBucket,
            errorBucket: dummyBucket,
        });
        // synth a cloudformation template from the stack
        const template = assertions_1.Template.fromStack(dqStack);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1xdWFsaXR5LXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLXF1YWxpdHktc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFDeEMsNkNBQTBDO0FBQzFDLDZDQUFrRDtBQUVsRCxnSUFBNEg7QUFFNUgsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNuQyxJQUFJLFFBQXlCLENBQUE7SUFDN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQiw4REFBOEQ7UUFDOUQsOEJBQThCO1FBQzlCLGtCQUFrQjtRQUNsQixtQkFBbUI7UUFDbkIsa0JBQWtCO1FBQ2xCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRXRFLDJEQUEyRDtRQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV2RCxvREFBb0Q7UUFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFO1lBQ3JFLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFlBQVksRUFBRSxXQUFXO1lBQ3pCLFdBQVcsRUFBRSxXQUFXO1NBQ3pCLENBQUMsQ0FBQTtRQUVGLGlEQUFpRDtRQUNqRCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM5QyxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNuQyw4QkFBOEI7UUFFOUIsNkJBQTZCO1FBQzdCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFDO1FBRS9DLHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBQztRQUNyRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDdkQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsd0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7U0FDeEMsRUFBQztRQUVGLCtEQUErRDtRQUMvRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBQztRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQztJQUNsRCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucydcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYidcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZURhdGFRdWFsaXR5U3RhY2sgfSBmcm9tICcuLi8uLi8uLi9saWIvc3RhY2tzL3N0YWNrLWRhdGEtcGlwZWxpbmUvZGF0YS1xdWFsaXR5L2NhcmJvbmxha2UtcXMtZGF0YS1xdWFsaXR5J1xuXG5kZXNjcmliZSgndGVzdCBwaXBlbGluZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gRFEgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAvLyAgIC0gaW5wdXRCdWNrZXRcbiAgICAvLyAgIC0gb3V0cHV0QnVja2V0XG4gICAgLy8gICAtIGVycm9yQnVja2V0XG4gICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdEdW1teUlucHV0c1N0YWNrJylcbiAgICBjb25zdCBkdW1teUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoZHVtbXlJbnB1dHNTdGFjaywgJ2R1bW15QnVja2V0Jywge30pXG5cbiAgICAvLyBEUSBzdGFjayBpcyBuZXN0ZWQsIGNyZWF0ZSBhIHBhcmVudCBzdGFjayBhcyBwbGFjZWhvbGRlclxuICAgIGNvbnN0IHBhcmVudFN0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ0RRUGFyZW50U3RhY2snLCB7fSlcblxuICAgIC8vIGNyZWF0ZSB0aGUgcGlwZWxpbmUgc3RhY2sgd2l0aCB0aGUgcmVxdWlyZWQgcHJvcHNcbiAgICBjb25zdCBkcVN0YWNrID0gbmV3IENhcmJvbmxha2VEYXRhUXVhbGl0eVN0YWNrKHBhcmVudFN0YWNrLCAnRFFTdGFjaycsIHtcbiAgICAgIGlucHV0QnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIG91dHB1dEJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICBlcnJvckJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgfSlcblxuICAgIC8vIHN5bnRoIGEgY2xvdWRmb3JtYXRpb24gdGVtcGxhdGUgZnJvbSB0aGUgc3RhY2tcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhkcVN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG5cbiAgdGVzdCgnc3ludGhlc2lzZXMgYXMgZXhwZWN0ZWQnLCAoKSA9PiB7XG4gICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG5cbiAgICAvLyBjcmVhdGVzIHRoZSByZXN1bHRzIGJ1Y2tldFxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6UzM6OkJ1Y2tldCcsIDEpXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIGNyZWF0aW9uXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgMilcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCB7XG4gICAgICBIYW5kbGVyOiAnYXBwLmxhbWJkYV9oYW5kbGVyJyxcbiAgICAgIFJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzkubmFtZSxcbiAgICB9KVxuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhcyBhbmQgZHEgam9iXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlJvbGUnLCAzKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpQb2xpY3knLCAzKVxuICB9KVxufSlcbiJdfQ==