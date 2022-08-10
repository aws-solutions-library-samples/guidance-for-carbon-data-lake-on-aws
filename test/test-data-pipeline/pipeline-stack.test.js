"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_qs_pipeline_stack_1 = require("../../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack");
describe("test pipeline stack", () => {
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
        const dummyInputsStack = new aws_cdk_lib_1.Stack(app, "DummyInputsStack");
        const dummyFunction = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, "dummyFunction", {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromInline("def lambda_handler(): pass"),
            handler: "lambda_handler"
        });
        const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, "dummyBucket", {});
        // create the pipeline stack with the required props
        const pipelineStack = new carbonlake_qs_pipeline_stack_1.CarbonlakeQuickstartPipelineStack(app, "PipelineStack", {
            dataLineageFunction: dummyFunction,
            landingBucket: dummyBucket,
            errorBucket: dummyBucket,
            rawBucket: dummyBucket,
            transformedBucket: dummyBucket,
            enrichedBucket: dummyBucket,
            notificationEmailAddress: "a@b.com"
        });
        // synth a cloudformation template from the stack
        const template = assertions_1.Template.fromStack(pipelineStack);
    });
    afterEach(() => { template = null; });
    test("synthesises as expected", () => {
        /* ====== ASSERTIONS ====== */
        // verify nested stack creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::CloudFormation::Stack", 4);
        // verify lambda creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::Lambda::Function", 3);
        template === null || template === void 0 ? void 0 : template.hasResourceProperties("AWS::Lambda::Function", {
            Handler: "app.lambda_handler",
            Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name
        });
        // verify iam role & policy creation for all lambdas
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Role", 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Policy", 3);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBeUQ7QUFDekQsNkNBQXlDO0FBQ3pDLDZDQUEyQztBQUMzQyw2Q0FBbUQ7QUFFbkQsb0hBQXNIO0FBRXRILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsSUFBSSxRQUF5QixDQUFDO0lBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWix5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7UUFFdEIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQ3pFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUM1QixDQUFDLENBQUM7UUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnRUFBaUMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQzlFLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsYUFBYSxFQUFFLFdBQVc7WUFDMUIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsU0FBUyxFQUFFLFdBQVc7WUFDdEIsaUJBQWlCLEVBQUUsV0FBVztZQUM5QixjQUFjLEVBQUUsV0FBVztZQUMzQix3QkFBd0IsRUFBRSxTQUFTO1NBQ3RDLENBQUMsQ0FBQztRQUVILGlEQUFpRDtRQUNqRCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNqQyw4QkFBOEI7UUFFOUIsK0JBQStCO1FBQy9CLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxFQUFFO1FBRTNELHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRTtRQUN0RCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDckQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsd0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7U0FDMUMsRUFBRTtRQUVILG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtRQUMvQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtJQUNyRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRQaXBlbGluZVN0YWNrIH0gZnJvbSBcIi4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jYXJib25sYWtlLXFzLXBpcGVsaW5lLXN0YWNrXCI7XG5cbmRlc2NyaWJlKFwidGVzdCBwaXBlbGluZSBzdGFja1wiLCAoKSA9PiB7XG4gICAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGw7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIC8qID09PT09PSBTRVRVUCA9PT09PT0gKi9cbiAgICAgICAgY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuXG4gICAgICAgIC8vIFBpcGVsaW5lIHN0YWNrIHJlcXVpcmVzIHRoZSBmb2xsb3dpbmcgcHJvcHMsIGNyZWF0ZSBhIGR1bW15IHN0YWNrXG4gICAgICAgIC8vIHRvIHByb3ZpZGUgc3VpdGFibGUgaW5wdXRzOlxuICAgICAgICAvLyAgIC0gZGF0YUxpbmVhZ2VGdW5jdGlvblxuICAgICAgICAvLyAgIC0gbGFuZGluZ0J1Y2tldFxuICAgICAgICAvLyAgIC0gcmF3QnVja2V0XG4gICAgICAgIC8vICAgLSB0cmFuc2Zvcm1lZEJ1Y2tldFxuICAgICAgICAvLyAgIC0gZW5yaWNoZWRCdWNrZXRcbiAgICAgICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsIFwiRHVtbXlJbnB1dHNTdGFja1wiKTtcblxuICAgICAgICBjb25zdCBkdW1teUZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCBcImR1bW15RnVuY3Rpb25cIiwge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOSxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoXCJkZWYgbGFtYmRhX2hhbmRsZXIoKTogcGFzc1wiKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwibGFtYmRhX2hhbmRsZXJcIlxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZHVtbXlCdWNrZXQgPSBuZXcgczMuQnVja2V0KGR1bW15SW5wdXRzU3RhY2ssIFwiZHVtbXlCdWNrZXRcIiwge30pO1xuICAgICAgICBcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgICAgICBjb25zdCBwaXBlbGluZVN0YWNrID0gbmV3IENhcmJvbmxha2VRdWlja3N0YXJ0UGlwZWxpbmVTdGFjayhhcHAsIFwiUGlwZWxpbmVTdGFja1wiLCB7XG4gICAgICAgICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUZ1bmN0aW9uLFxuICAgICAgICAgICAgbGFuZGluZ0J1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICAgICAgICBlcnJvckJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICAgICAgICByYXdCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgICAgICAgdHJhbnNmb3JtZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgICAgICAgZW5yaWNoZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uRW1haWxBZGRyZXNzOiBcImFAYi5jb21cIlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHBpcGVsaW5lU3RhY2spO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHsgdGVtcGxhdGUgPSBudWxsIH0pO1xuICAgIHRlc3QoXCJzeW50aGVzaXNlcyBhcyBleHBlY3RlZFwiLCAoKSA9PiB7XG4gICAgICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuXG4gICAgICAgIC8vIHZlcmlmeSBuZXN0ZWQgc3RhY2sgY3JlYXRpb25cbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrXCIsIDQpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCAzKTtcbiAgICAgICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCB7XG4gICAgICAgICAgICBIYW5kbGVyOiBcImFwcC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6SUFNOjpSb2xlXCIsIDMpO1xuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlBvbGljeVwiLCAzKTtcbiAgICB9KTtcbn0pIl19