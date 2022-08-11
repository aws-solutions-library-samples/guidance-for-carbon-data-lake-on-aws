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
            landingBucket: dummyBucket,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsNkNBQXdDO0FBQ3hDLDZDQUEwQztBQUMxQyw2Q0FBa0Q7QUFFbEQsb0hBQXFIO0FBRXJILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxRQUF5QixDQUFBO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBRTNELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQzNFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV0RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnRUFBaUMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQ2hGLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsYUFBYSxFQUFFLFdBQVc7WUFDMUIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsU0FBUyxFQUFFLFdBQVc7WUFDdEIsaUJBQWlCLEVBQUUsV0FBVztZQUM5QixjQUFjLEVBQUUsV0FBVztZQUMzQix3QkFBd0IsRUFBRSxTQUFTO1NBQ3BDLENBQUMsQ0FBQTtRQUVGLGlEQUFpRDtRQUNqRCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUNwRCxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBQ0YsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNuQyw4QkFBOEI7UUFFOUIsK0JBQStCO1FBQy9CLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxFQUFDO1FBRTFELHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBQztRQUNyRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDdkQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsd0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7U0FDeEMsRUFBQztRQUVGLG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBQztRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQztJQUNsRCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucydcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYidcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRQaXBlbGluZVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliL3N0YWNrcy9zdGFjay1kYXRhLXBpcGVsaW5lL2NhcmJvbmxha2UtcXMtcGlwZWxpbmUtc3RhY2snXG5cbmRlc2NyaWJlKCd0ZXN0IHBpcGVsaW5lIHN0YWNrJywgKCkgPT4ge1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbFxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpXG5cbiAgICAvLyBQaXBlbGluZSBzdGFjayByZXF1aXJlcyB0aGUgZm9sbG93aW5nIHByb3BzLCBjcmVhdGUgYSBkdW1teSBzdGFja1xuICAgIC8vIHRvIHByb3ZpZGUgc3VpdGFibGUgaW5wdXRzOlxuICAgIC8vICAgLSBkYXRhTGluZWFnZUZ1bmN0aW9uXG4gICAgLy8gICAtIGxhbmRpbmdCdWNrZXRcbiAgICAvLyAgIC0gcmF3QnVja2V0XG4gICAgLy8gICAtIHRyYW5zZm9ybWVkQnVja2V0XG4gICAgLy8gICAtIGVucmljaGVkQnVja2V0XG4gICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdEdW1teUlucHV0c1N0YWNrJylcblxuICAgIGNvbnN0IGR1bW15RnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKGR1bW15SW5wdXRzU3RhY2ssICdkdW1teUZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoJ2RlZiBsYW1iZGFfaGFuZGxlcigpOiBwYXNzJyksXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLFxuICAgIH0pXG4gICAgY29uc3QgZHVtbXlCdWNrZXQgPSBuZXcgczMuQnVja2V0KGR1bW15SW5wdXRzU3RhY2ssICdkdW1teUJ1Y2tldCcsIHt9KVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgIGNvbnN0IHBpcGVsaW5lU3RhY2sgPSBuZXcgQ2FyYm9ubGFrZVF1aWNrc3RhcnRQaXBlbGluZVN0YWNrKGFwcCwgJ1BpcGVsaW5lU3RhY2snLCB7XG4gICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUZ1bmN0aW9uLFxuICAgICAgbGFuZGluZ0J1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICBlcnJvckJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICByYXdCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgdHJhbnNmb3JtZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgZW5yaWNoZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgbm90aWZpY2F0aW9uRW1haWxBZGRyZXNzOiAnYUBiLmNvbScsXG4gICAgfSlcblxuICAgIC8vIHN5bnRoIGEgY2xvdWRmb3JtYXRpb24gdGVtcGxhdGUgZnJvbSB0aGUgc3RhY2tcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhwaXBlbGluZVN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG4gIHRlc3QoJ3N5bnRoZXNpc2VzIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuXG4gICAgLy8gdmVyaWZ5IG5lc3RlZCBzdGFjayBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJywgNClcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAzKVxuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIHtcbiAgICAgIEhhbmRsZXI6ICdhcHAubGFtYmRhX2hhbmRsZXInLFxuICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lLFxuICAgIH0pXG5cbiAgICAvLyB2ZXJpZnkgaWFtIHJvbGUgJiBwb2xpY3kgY3JlYXRpb24gZm9yIGFsbCBsYW1iZGFzXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlJvbGUnLCAzKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpQb2xpY3knLCAzKVxuICB9KVxufSlcbiJdfQ==