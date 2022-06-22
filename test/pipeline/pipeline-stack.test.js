"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_qs_pipeline_stack_1 = require("../../lib/pipeline/carbonlake-qs-pipeline-stack");
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
            rawBucket: dummyBucket,
            transformedBucket: dummyBucket,
            enrichedBucket: dummyBucket
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBeUQ7QUFDekQsNkNBQXlDO0FBQ3pDLDZDQUEyQztBQUMzQyw2Q0FBbUQ7QUFFbkQsa0dBQW9HO0FBRXBHLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsSUFBSSxRQUF5QixDQUFDO0lBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWix5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7UUFFdEIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQ3pFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUM1QixDQUFDLENBQUM7UUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnRUFBaUMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQzlFLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsYUFBYSxFQUFFLFdBQVc7WUFDMUIsU0FBUyxFQUFFLFdBQVc7WUFDdEIsaUJBQWlCLEVBQUUsV0FBVztZQUM5QixjQUFjLEVBQUUsV0FBVztTQUM5QixDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsOEJBQThCO1FBRTlCLCtCQUErQjtRQUMvQixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBRTtRQUUzRCx5QkFBeUI7UUFDekIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUU7UUFDdEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFO1lBQ3JELE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1NBQzFDLEVBQUU7UUFFSCxvREFBb0Q7UUFDcEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUU7UUFDL0MsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUU7SUFDckQsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hdGNoLCBUZW1wbGF0ZSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hc3NlcnRpb25zXCI7XG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5cbmltcG9ydCB7IENhcmJvbmxha2VRdWlja3N0YXJ0UGlwZWxpbmVTdGFjayB9IGZyb20gXCIuLi8uLi9saWIvcGlwZWxpbmUvY2FyYm9ubGFrZS1xcy1waXBlbGluZS1zdGFja1wiO1xuXG5kZXNjcmliZShcInRlc3QgcGlwZWxpbmUgc3RhY2tcIiwgKCkgPT4ge1xuICAgIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBudWxsO1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcblxuICAgICAgICAvLyBQaXBlbGluZSBzdGFjayByZXF1aXJlcyB0aGUgZm9sbG93aW5nIHByb3BzLCBjcmVhdGUgYSBkdW1teSBzdGFja1xuICAgICAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAgICAgLy8gICAtIGRhdGFMaW5lYWdlRnVuY3Rpb25cbiAgICAgICAgLy8gICAtIGxhbmRpbmdCdWNrZXRcbiAgICAgICAgLy8gICAtIHJhd0J1Y2tldFxuICAgICAgICAvLyAgIC0gdHJhbnNmb3JtZWRCdWNrZXRcbiAgICAgICAgLy8gICAtIGVucmljaGVkQnVja2V0XG4gICAgICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCBcIkR1bW15SW5wdXRzU3RhY2tcIik7XG5cbiAgICAgICAgY29uc3QgZHVtbXlGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24oZHVtbXlJbnB1dHNTdGFjaywgXCJkdW1teUZ1bmN0aW9uXCIsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzksXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKFwiZGVmIGxhbWJkYV9oYW5kbGVyKCk6IHBhc3NcIiksXG4gICAgICAgICAgICBoYW5kbGVyOiBcImxhbWJkYV9oYW5kbGVyXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGR1bW15QnVja2V0ID0gbmV3IHMzLkJ1Y2tldChkdW1teUlucHV0c1N0YWNrLCBcImR1bW15QnVja2V0XCIsIHt9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgcGlwZWxpbmUgc3RhY2sgd2l0aCB0aGUgcmVxdWlyZWQgcHJvcHNcbiAgICAgICAgY29uc3QgcGlwZWxpbmVTdGFjayA9IG5ldyBDYXJib25sYWtlUXVpY2tzdGFydFBpcGVsaW5lU3RhY2soYXBwLCBcIlBpcGVsaW5lU3RhY2tcIiwge1xuICAgICAgICAgICAgZGF0YUxpbmVhZ2VGdW5jdGlvbjogZHVtbXlGdW5jdGlvbixcbiAgICAgICAgICAgIGxhbmRpbmdCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgICAgICAgcmF3QnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgICAgICAgIHRyYW5zZm9ybWVkQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgICAgICAgIGVucmljaGVkQnVja2V0OiBkdW1teUJ1Y2tldFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHBpcGVsaW5lU3RhY2spO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHsgdGVtcGxhdGUgPSBudWxsIH0pO1xuICAgIHRlc3QoXCJzeW50aGVzaXNlcyBhcyBleHBlY3RlZFwiLCAoKSA9PiB7XG4gICAgICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuXG4gICAgICAgIC8vIHZlcmlmeSBuZXN0ZWQgc3RhY2sgY3JlYXRpb25cbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrXCIsIDQpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCAzKTtcbiAgICAgICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCB7XG4gICAgICAgICAgICBIYW5kbGVyOiBcImFwcC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6SUFNOjpSb2xlXCIsIDMpO1xuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlBvbGljeVwiLCAzKTtcbiAgICB9KTtcbn0pIl19