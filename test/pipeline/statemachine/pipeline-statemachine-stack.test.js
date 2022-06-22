"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const carbonlake_qs_statemachine_stack_1 = require("../../../lib/pipeline/statemachine/carbonlake-qs-statemachine-stack");
describe('test statemachine stack', () => {
    let template;
    beforeEach(() => {
        /* ====== SETUP ====== */
        const app = new aws_cdk_lib_1.App();
        // Statemachine stack requires the following props, create a dummy stack
        // to provide suitable inputs:
        //   - dataLineageFunction
        //   - dataQualityJob => this is a dummy placeholder until the data quality job is ready
        //   - s3copierFunction => stand-in lambda function for the dataQualityJob
        //   - glueTransformJobName
        //   - batchEnumLambda
        //   - calculationJob
        const dummyInputsStack = new aws_cdk_lib_1.Stack(app, "DummyInputsStack");
        const dummyLambda = new aws_cdk_lib_2.aws_lambda.Function(dummyInputsStack, "dummyLambda", {
            runtime: aws_cdk_lib_2.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_2.aws_lambda.Code.fromInline("def lambda_handler(): pass"),
            handler: "lambda_handler"
        });
        // statemachineStack is a nested stack, so create a parent placeholder
        const parentStack = new aws_cdk_lib_1.Stack(app, "ParentPipelineStack", {});
        // create the pipeline stack with the required props
        const statemachineStack = new carbonlake_qs_statemachine_stack_1.CarbonlakeQuickstartStatemachineStack(parentStack, "PipelineStack", {
            dataLineageFunction: dummyLambda,
            dataQualityJob: "abc",
            s3copierLambda: dummyLambda,
            glueTransformJobName: "xyz",
            batchEnumLambda: dummyLambda,
            calculationJob: dummyLambda,
        });
        // synth a cloudformation template from the stack
        template = assertions_1.Template.fromStack(statemachineStack);
    });
    afterEach(() => { template = null; });
    test("synthesises as expected", () => {
        /* ====== ASSERTIONS ====== */
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Role", 1);
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Policy", 1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF5RDtBQUN6RCw2Q0FBeUM7QUFFekMsNkNBQW1EO0FBRW5ELDBIQUE0SDtBQUU1SCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO0lBQ3JDLElBQUksUUFBeUIsQ0FBQztJQUU5QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1oseUJBQXlCO1FBQ3pCLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO1FBRXRCLHdFQUF3RTtRQUN4RSw4QkFBOEI7UUFDOUIsMEJBQTBCO1FBQzFCLHdGQUF3RjtRQUN4RiwwRUFBMEU7UUFDMUUsMkJBQTJCO1FBQzNCLHNCQUFzQjtRQUN0QixxQkFBcUI7UUFDckIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDNUQsTUFBTSxXQUFXLEdBQUcsSUFBSSx3QkFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLEVBQUU7WUFDckUsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7WUFDbEMsSUFBSSxFQUFFLHdCQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQztZQUMxRCxPQUFPLEVBQUUsZ0JBQWdCO1NBQzVCLENBQUMsQ0FBQztRQUVILHNFQUFzRTtRQUN0RSxNQUFNLFdBQVcsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRTdELG9EQUFvRDtRQUNwRCxNQUFNLGlCQUFpQixHQUFHLElBQUksd0VBQXFDLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRTtZQUM5RixtQkFBbUIsRUFBRSxXQUFXO1lBQ2hDLGNBQWMsRUFBRSxLQUFLO1lBQ3JCLGNBQWMsRUFBRSxXQUFXO1lBQzNCLG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsZUFBZSxFQUFFLFdBQVc7WUFDNUIsY0FBYyxFQUFFLFdBQVc7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVwQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ2pDLDhCQUE4QjtRQUM5QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsRUFBRTtRQUNqRSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtRQUMvQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtJQUNyRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRTdGF0ZW1hY2hpbmVTdGFjayB9IGZyb20gXCIuLi8uLi8uLi9saWIvcGlwZWxpbmUvc3RhdGVtYWNoaW5lL2NhcmJvbmxha2UtcXMtc3RhdGVtYWNoaW5lLXN0YWNrXCI7XG5cbmRlc2NyaWJlKCd0ZXN0IHN0YXRlbWFjaGluZSBzdGFjaycsICgpID0+IHtcbiAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcblxuICAgICAgICAvLyBTdGF0ZW1hY2hpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAgICAgLy8gdG8gcHJvdmlkZSBzdWl0YWJsZSBpbnB1dHM6XG4gICAgICAgIC8vICAgLSBkYXRhTGluZWFnZUZ1bmN0aW9uXG4gICAgICAgIC8vICAgLSBkYXRhUXVhbGl0eUpvYiA9PiB0aGlzIGlzIGEgZHVtbXkgcGxhY2Vob2xkZXIgdW50aWwgdGhlIGRhdGEgcXVhbGl0eSBqb2IgaXMgcmVhZHlcbiAgICAgICAgLy8gICAtIHMzY29waWVyRnVuY3Rpb24gPT4gc3RhbmQtaW4gbGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgZGF0YVF1YWxpdHlKb2JcbiAgICAgICAgLy8gICAtIGdsdWVUcmFuc2Zvcm1Kb2JOYW1lXG4gICAgICAgIC8vICAgLSBiYXRjaEVudW1MYW1iZGFcbiAgICAgICAgLy8gICAtIGNhbGN1bGF0aW9uSm9iXG4gICAgICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCBcIkR1bW15SW5wdXRzU3RhY2tcIik7XG4gICAgICAgIGNvbnN0IGR1bW15TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCBcImR1bW15TGFtYmRhXCIsIHtcbiAgICAgICAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzksXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKFwiZGVmIGxhbWJkYV9oYW5kbGVyKCk6IHBhc3NcIiksXG4gICAgICAgICAgICBoYW5kbGVyOiBcImxhbWJkYV9oYW5kbGVyXCJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3RhdGVtYWNoaW5lU3RhY2sgaXMgYSBuZXN0ZWQgc3RhY2ssIHNvIGNyZWF0ZSBhIHBhcmVudCBwbGFjZWhvbGRlclxuICAgICAgICBjb25zdCBwYXJlbnRTdGFjayA9IG5ldyBTdGFjayhhcHAsIFwiUGFyZW50UGlwZWxpbmVTdGFja1wiLCB7fSlcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIHBpcGVsaW5lIHN0YWNrIHdpdGggdGhlIHJlcXVpcmVkIHByb3BzXG4gICAgICAgIGNvbnN0IHN0YXRlbWFjaGluZVN0YWNrID0gbmV3IENhcmJvbmxha2VRdWlja3N0YXJ0U3RhdGVtYWNoaW5lU3RhY2socGFyZW50U3RhY2ssIFwiUGlwZWxpbmVTdGFja1wiLCB7XG4gICAgICAgICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUxhbWJkYSxcbiAgICAgICAgICAgIGRhdGFRdWFsaXR5Sm9iOiBcImFiY1wiLFxuICAgICAgICAgICAgczNjb3BpZXJMYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgICAgICAgZ2x1ZVRyYW5zZm9ybUpvYk5hbWU6IFwieHl6XCIsXG4gICAgICAgICAgICBiYXRjaEVudW1MYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgICAgICAgY2FsY3VsYXRpb25Kb2I6IGR1bW15TGFtYmRhLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHN0YXRlbWFjaGluZVN0YWNrKTtcbiAgICB9KTtcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7IHRlbXBsYXRlID0gbnVsbCB9KVxuXG4gICAgdGVzdChcInN5bnRoZXNpc2VzIGFzIGV4cGVjdGVkXCIsICgpID0+IHtcbiAgICAgICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG4gICAgICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OlN0ZXBGdW5jdGlvbnM6OlN0YXRlTWFjaGluZVwiLCAxKTtcbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6SUFNOjpSb2xlXCIsIDEpO1xuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlBvbGljeVwiLCAxKTtcbiAgICB9KTtcbn0pIl19