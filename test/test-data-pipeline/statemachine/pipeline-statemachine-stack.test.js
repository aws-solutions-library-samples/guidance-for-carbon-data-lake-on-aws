"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_qs_statemachine_stack_1 = require("../../../lib/stacks/stack-data-pipeline/statemachine/carbonlake-qs-statemachine-stack");
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
        const dummyTopic = new aws_cdk_lib_2.aws_sns.Topic(dummyInputsStack, 'dummyTopic', {});
        const dummyLambda = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, "dummyLambda", {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromInline("def lambda_handler(): pass"),
            handler: "lambda_handler"
        });
        // statemachineStack is a nested stack, so create a parent placeholder
        const parentStack = new aws_cdk_lib_1.Stack(app, "ParentPipelineStack", {});
        // create the pipeline stack with the required props
        const statemachineStack = new carbonlake_qs_statemachine_stack_1.CarbonlakeQuickstartStatemachineStack(parentStack, "PipelineStack", {
            dataLineageFunction: dummyLambda,
            dqResourcesLambda: dummyLambda,
            dqResultsLambda: dummyLambda,
            dqErrorNotification: dummyTopic,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF5RDtBQUN6RCw2Q0FBeUM7QUFFekMsNkNBQTRDO0FBQzVDLDZDQUFtRDtBQUVuRCw0SUFBOEk7QUFFOUksUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxJQUFJLFFBQXlCLENBQUM7SUFFOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQztRQUV0Qix3RUFBd0U7UUFDeEUsOEJBQThCO1FBQzlCLDBCQUEwQjtRQUMxQix3RkFBd0Y7UUFDeEYsMEVBQTBFO1FBQzFFLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzVELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFO1lBQ3JFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUM1QixDQUFDLENBQUM7UUFFSCxzRUFBc0U7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUU3RCxvREFBb0Q7UUFDcEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHdFQUFxQyxDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUU7WUFDOUYsbUJBQW1CLEVBQUUsV0FBVztZQUNoQyxpQkFBaUIsRUFBRSxXQUFXO1lBQzlCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLG1CQUFtQixFQUFFLFVBQVU7WUFDL0Isb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsV0FBVztZQUM1QixjQUFjLEVBQUUsV0FBVztTQUM5QixDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRXBDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsOEJBQThCO1FBQzlCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxFQUFFO1FBQ2pFLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFO1FBQy9DLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO0lBQ3JELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXNzZXJ0aW9uc1wiO1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19zbnMgYXMgc25zIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRTdGF0ZW1hY2hpbmVTdGFjayB9IGZyb20gXCIuLi8uLi8uLi9saWIvc3RhY2tzL3N0YWNrLWRhdGEtcGlwZWxpbmUvc3RhdGVtYWNoaW5lL2NhcmJvbmxha2UtcXMtc3RhdGVtYWNoaW5lLXN0YWNrXCI7XG5cbmRlc2NyaWJlKCd0ZXN0IHN0YXRlbWFjaGluZSBzdGFjaycsICgpID0+IHtcbiAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcblxuICAgICAgICAvLyBTdGF0ZW1hY2hpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAgICAgLy8gdG8gcHJvdmlkZSBzdWl0YWJsZSBpbnB1dHM6XG4gICAgICAgIC8vICAgLSBkYXRhTGluZWFnZUZ1bmN0aW9uXG4gICAgICAgIC8vICAgLSBkYXRhUXVhbGl0eUpvYiA9PiB0aGlzIGlzIGEgZHVtbXkgcGxhY2Vob2xkZXIgdW50aWwgdGhlIGRhdGEgcXVhbGl0eSBqb2IgaXMgcmVhZHlcbiAgICAgICAgLy8gICAtIHMzY29waWVyRnVuY3Rpb24gPT4gc3RhbmQtaW4gbGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgZGF0YVF1YWxpdHlKb2JcbiAgICAgICAgLy8gICAtIGdsdWVUcmFuc2Zvcm1Kb2JOYW1lXG4gICAgICAgIC8vICAgLSBiYXRjaEVudW1MYW1iZGFcbiAgICAgICAgLy8gICAtIGNhbGN1bGF0aW9uSm9iXG4gICAgICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCBcIkR1bW15SW5wdXRzU3RhY2tcIik7XG4gICAgICAgIGNvbnN0IGR1bW15VG9waWMgPSBuZXcgc25zLlRvcGljKGR1bW15SW5wdXRzU3RhY2ssICdkdW1teVRvcGljJywge30pO1xuICAgICAgICBjb25zdCBkdW1teUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24oZHVtbXlJbnB1dHNTdGFjaywgXCJkdW1teUxhbWJkYVwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185LFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUlubGluZShcImRlZiBsYW1iZGFfaGFuZGxlcigpOiBwYXNzXCIpLFxuICAgICAgICAgICAgaGFuZGxlcjogXCJsYW1iZGFfaGFuZGxlclwiXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN0YXRlbWFjaGluZVN0YWNrIGlzIGEgbmVzdGVkIHN0YWNrLCBzbyBjcmVhdGUgYSBwYXJlbnQgcGxhY2Vob2xkZXJcbiAgICAgICAgY29uc3QgcGFyZW50U3RhY2sgPSBuZXcgU3RhY2soYXBwLCBcIlBhcmVudFBpcGVsaW5lU3RhY2tcIiwge30pXG5cbiAgICAgICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgICAgICBjb25zdCBzdGF0ZW1hY2hpbmVTdGFjayA9IG5ldyBDYXJib25sYWtlUXVpY2tzdGFydFN0YXRlbWFjaGluZVN0YWNrKHBhcmVudFN0YWNrLCBcIlBpcGVsaW5lU3RhY2tcIiwge1xuICAgICAgICAgICAgZGF0YUxpbmVhZ2VGdW5jdGlvbjogZHVtbXlMYW1iZGEsXG4gICAgICAgICAgICBkcVJlc291cmNlc0xhbWJkYTogZHVtbXlMYW1iZGEsXG4gICAgICAgICAgICBkcVJlc3VsdHNMYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgICAgICAgZHFFcnJvck5vdGlmaWNhdGlvbjogZHVtbXlUb3BpYyxcbiAgICAgICAgICAgIGdsdWVUcmFuc2Zvcm1Kb2JOYW1lOiBcInh5elwiLFxuICAgICAgICAgICAgYmF0Y2hFbnVtTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgICAgICAgIGNhbGN1bGF0aW9uSm9iOiBkdW1teUxhbWJkYSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gc3ludGggYSBjbG91ZGZvcm1hdGlvbiB0ZW1wbGF0ZSBmcm9tIHRoZSBzdGFja1xuICAgICAgICB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhzdGF0ZW1hY2hpbmVTdGFjayk7XG4gICAgfSk7XG5cbiAgICBhZnRlckVhY2goKCkgPT4geyB0ZW1wbGF0ZSA9IG51bGwgfSlcblxuICAgIHRlc3QoXCJzeW50aGVzaXNlcyBhcyBleHBlY3RlZFwiLCAoKSA9PiB7XG4gICAgICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpTdGVwRnVuY3Rpb25zOjpTdGF0ZU1hY2hpbmVcIiwgMSk7XG4gICAgICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OklBTTo6Um9sZVwiLCAxKTtcbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6SUFNOjpQb2xpY3lcIiwgMSk7XG4gICAgfSk7XG59KSJdfQ==