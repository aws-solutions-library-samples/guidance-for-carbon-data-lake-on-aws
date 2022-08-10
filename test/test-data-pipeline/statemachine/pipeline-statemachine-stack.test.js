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
        const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack');
        const dummyTopic = new aws_cdk_lib_2.aws_sns.Topic(dummyInputsStack, 'dummyTopic', {});
        const dummyLambda = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, 'dummyLambda', {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
            handler: 'lambda_handler',
        });
        // statemachineStack is a nested stack, so create a parent placeholder
        const parentStack = new aws_cdk_lib_1.Stack(app, 'ParentPipelineStack', {});
        // create the pipeline stack with the required props
        const statemachineStack = new carbonlake_qs_statemachine_stack_1.CarbonlakeQuickstartStatemachineStack(parentStack, 'PipelineStack', {
            dataLineageFunction: dummyLambda,
            dqResourcesLambda: dummyLambda,
            dqResultsLambda: dummyLambda,
            dqErrorNotification: dummyTopic,
            glueTransformJobName: 'xyz',
            batchEnumLambda: dummyLambda,
            calculationJob: dummyLambda,
        });
        // synth a cloudformation template from the stack
        template = assertions_1.Template.fromStack(statemachineStack);
    });
    afterEach(() => {
        template = null;
    });
    test('synthesises as expected', () => {
        /* ====== ASSERTIONS ====== */
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 1);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFFeEMsNkNBQTRDO0FBQzVDLDZDQUFrRDtBQUVsRCw0SUFBNkk7QUFFN0ksUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQix3RUFBd0U7UUFDeEUsOEJBQThCO1FBQzlCLDBCQUEwQjtRQUMxQix3RkFBd0Y7UUFDeEYsMEVBQTBFO1FBQzFFLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFO1lBQ3ZFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFFRixzRUFBc0U7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUU3RCxvREFBb0Q7UUFDcEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHdFQUFxQyxDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUU7WUFDaEcsbUJBQW1CLEVBQUUsV0FBVztZQUNoQyxpQkFBaUIsRUFBRSxXQUFXO1lBQzlCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLG1CQUFtQixFQUFFLFVBQVU7WUFDL0Isb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsV0FBVztZQUM1QixjQUFjLEVBQUUsV0FBVztTQUM1QixDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDbEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBQzlCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxFQUFDO1FBQ2hFLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFDO1FBQzlDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJ1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3Nfc25zIGFzIHNucyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYidcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRTdGF0ZW1hY2hpbmVTdGFjayB9IGZyb20gJy4uLy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9zdGF0ZW1hY2hpbmUvY2FyYm9ubGFrZS1xcy1zdGF0ZW1hY2hpbmUtc3RhY2snXG5cbmRlc2NyaWJlKCd0ZXN0IHN0YXRlbWFjaGluZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpXG5cbiAgICAvLyBTdGF0ZW1hY2hpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAvLyAgIC0gZGF0YUxpbmVhZ2VGdW5jdGlvblxuICAgIC8vICAgLSBkYXRhUXVhbGl0eUpvYiA9PiB0aGlzIGlzIGEgZHVtbXkgcGxhY2Vob2xkZXIgdW50aWwgdGhlIGRhdGEgcXVhbGl0eSBqb2IgaXMgcmVhZHlcbiAgICAvLyAgIC0gczNjb3BpZXJGdW5jdGlvbiA9PiBzdGFuZC1pbiBsYW1iZGEgZnVuY3Rpb24gZm9yIHRoZSBkYXRhUXVhbGl0eUpvYlxuICAgIC8vICAgLSBnbHVlVHJhbnNmb3JtSm9iTmFtZVxuICAgIC8vICAgLSBiYXRjaEVudW1MYW1iZGFcbiAgICAvLyAgIC0gY2FsY3VsYXRpb25Kb2JcbiAgICBjb25zdCBkdW1teUlucHV0c1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ0R1bW15SW5wdXRzU3RhY2snKVxuICAgIGNvbnN0IGR1bW15VG9waWMgPSBuZXcgc25zLlRvcGljKGR1bW15SW5wdXRzU3RhY2ssICdkdW1teVRvcGljJywge30pXG4gICAgY29uc3QgZHVtbXlMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKGR1bW15SW5wdXRzU3RhY2ssICdkdW1teUxhbWJkYScsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzksXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKCdkZWYgbGFtYmRhX2hhbmRsZXIoKTogcGFzcycpLFxuICAgICAgaGFuZGxlcjogJ2xhbWJkYV9oYW5kbGVyJyxcbiAgICB9KVxuXG4gICAgLy8gc3RhdGVtYWNoaW5lU3RhY2sgaXMgYSBuZXN0ZWQgc3RhY2ssIHNvIGNyZWF0ZSBhIHBhcmVudCBwbGFjZWhvbGRlclxuICAgIGNvbnN0IHBhcmVudFN0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ1BhcmVudFBpcGVsaW5lU3RhY2snLCB7fSlcblxuICAgIC8vIGNyZWF0ZSB0aGUgcGlwZWxpbmUgc3RhY2sgd2l0aCB0aGUgcmVxdWlyZWQgcHJvcHNcbiAgICBjb25zdCBzdGF0ZW1hY2hpbmVTdGFjayA9IG5ldyBDYXJib25sYWtlUXVpY2tzdGFydFN0YXRlbWFjaGluZVN0YWNrKHBhcmVudFN0YWNrLCAnUGlwZWxpbmVTdGFjaycsIHtcbiAgICAgIGRhdGFMaW5lYWdlRnVuY3Rpb246IGR1bW15TGFtYmRhLFxuICAgICAgZHFSZXNvdXJjZXNMYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgZHFSZXN1bHRzTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxRXJyb3JOb3RpZmljYXRpb246IGR1bW15VG9waWMsXG4gICAgICBnbHVlVHJhbnNmb3JtSm9iTmFtZTogJ3h5eicsXG4gICAgICBiYXRjaEVudW1MYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgY2FsY3VsYXRpb25Kb2I6IGR1bW15TGFtYmRhLFxuICAgIH0pXG5cbiAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soc3RhdGVtYWNoaW5lU3RhY2spXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0ZW1wbGF0ZSA9IG51bGxcbiAgfSlcblxuICB0ZXN0KCdzeW50aGVzaXNlcyBhcyBleHBlY3RlZCcsICgpID0+IHtcbiAgICAvKiA9PT09PT0gQVNTRVJUSU9OUyA9PT09PT0gKi9cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OlN0ZXBGdW5jdGlvbnM6OlN0YXRlTWFjaGluZScsIDEpXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlJvbGUnLCAxKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpQb2xpY3knLCAxKVxuICB9KVxufSlcbiJdfQ==