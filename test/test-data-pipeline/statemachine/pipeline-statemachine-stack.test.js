"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const construct_data_pipeline_statemachine_1 = require("../../../lib/stacks/stack-data-pipeline/construct-data-pipeline-statemachine/construct-data-pipeline-statemachine");
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
        const statemachineStack = new construct_data_pipeline_statemachine_1.DataPipelineStatemachine(parentStack, 'PipelineStack', {
            dataLineageFunction: dummyLambda,
            dqResourcesLambda: dummyLambda,
            dqResultsLambda: dummyLambda,
            dqErrorNotification: dummyTopic,
            glueTransformJobName: 'xyz',
            batchEnumLambda: dummyLambda,
            calculationJob: dummyLambda,
        });
        // synth a cloudformation template from the stack
        template = assertions_1.Template.fromStack(parentStack);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFFeEMsNkNBQTRDO0FBQzVDLDZDQUFrRDtBQUVsRCw0S0FBNEo7QUFFNUosUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQix3RUFBd0U7UUFDeEUsOEJBQThCO1FBQzlCLDBCQUEwQjtRQUMxQix3RkFBd0Y7UUFDeEYsMEVBQTBFO1FBQzFFLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFO1lBQ3ZFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFFRixzRUFBc0U7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUU3RCxvREFBb0Q7UUFDcEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLCtEQUF3QixDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUU7WUFDbkYsbUJBQW1CLEVBQUUsV0FBVztZQUNoQyxpQkFBaUIsRUFBRSxXQUFXO1lBQzlCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLG1CQUFtQixFQUFFLFVBQVU7WUFDL0Isb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsV0FBVztZQUM1QixjQUFjLEVBQUUsV0FBVztTQUM1QixDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQyxDQUFBO0lBRUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLFFBQVEsR0FBRyxJQUFJLENBQUE7SUFDakIsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ25DLDhCQUE4QjtRQUM5QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsRUFBQztRQUNoRSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBQztRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQztJQUNsRCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucydcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3NucyBhcyBzbnMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IERhdGFQaXBlbGluZVN0YXRlbWFjaGluZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jb25zdHJ1Y3QtZGF0YS1waXBlbGluZS1zdGF0ZW1hY2hpbmUvY29uc3RydWN0LWRhdGEtcGlwZWxpbmUtc3RhdGVtYWNoaW5lJ1xuXG5kZXNjcmliZSgndGVzdCBzdGF0ZW1hY2hpbmUgc3RhY2snLCAoKSA9PiB7XG4gIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gU3RhdGVtYWNoaW5lIHN0YWNrIHJlcXVpcmVzIHRoZSBmb2xsb3dpbmcgcHJvcHMsIGNyZWF0ZSBhIGR1bW15IHN0YWNrXG4gICAgLy8gdG8gcHJvdmlkZSBzdWl0YWJsZSBpbnB1dHM6XG4gICAgLy8gICAtIGRhdGFMaW5lYWdlRnVuY3Rpb25cbiAgICAvLyAgIC0gZGF0YVF1YWxpdHlKb2IgPT4gdGhpcyBpcyBhIGR1bW15IHBsYWNlaG9sZGVyIHVudGlsIHRoZSBkYXRhIHF1YWxpdHkgam9iIGlzIHJlYWR5XG4gICAgLy8gICAtIHMzY29waWVyRnVuY3Rpb24gPT4gc3RhbmQtaW4gbGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgZGF0YVF1YWxpdHlKb2JcbiAgICAvLyAgIC0gZ2x1ZVRyYW5zZm9ybUpvYk5hbWVcbiAgICAvLyAgIC0gYmF0Y2hFbnVtTGFtYmRhXG4gICAgLy8gICAtIGNhbGN1bGF0aW9uSm9iXG4gICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdEdW1teUlucHV0c1N0YWNrJylcbiAgICBjb25zdCBkdW1teVRvcGljID0gbmV3IHNucy5Ub3BpYyhkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlUb3BpYycsIHt9KVxuICAgIGNvbnN0IGR1bW15TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185LFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUlubGluZSgnZGVmIGxhbWJkYV9oYW5kbGVyKCk6IHBhc3MnKSxcbiAgICAgIGhhbmRsZXI6ICdsYW1iZGFfaGFuZGxlcicsXG4gICAgfSlcblxuICAgIC8vIHN0YXRlbWFjaGluZVN0YWNrIGlzIGEgbmVzdGVkIHN0YWNrLCBzbyBjcmVhdGUgYSBwYXJlbnQgcGxhY2Vob2xkZXJcbiAgICBjb25zdCBwYXJlbnRTdGFjayA9IG5ldyBTdGFjayhhcHAsICdQYXJlbnRQaXBlbGluZVN0YWNrJywge30pXG5cbiAgICAvLyBjcmVhdGUgdGhlIHBpcGVsaW5lIHN0YWNrIHdpdGggdGhlIHJlcXVpcmVkIHByb3BzXG4gICAgY29uc3Qgc3RhdGVtYWNoaW5lU3RhY2sgPSBuZXcgRGF0YVBpcGVsaW5lU3RhdGVtYWNoaW5lKHBhcmVudFN0YWNrLCAnUGlwZWxpbmVTdGFjaycsIHtcbiAgICAgIGRhdGFMaW5lYWdlRnVuY3Rpb246IGR1bW15TGFtYmRhLFxuICAgICAgZHFSZXNvdXJjZXNMYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgZHFSZXN1bHRzTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxRXJyb3JOb3RpZmljYXRpb246IGR1bW15VG9waWMsXG4gICAgICBnbHVlVHJhbnNmb3JtSm9iTmFtZTogJ3h5eicsXG4gICAgICBiYXRjaEVudW1MYW1iZGE6IGR1bW15TGFtYmRhLFxuICAgICAgY2FsY3VsYXRpb25Kb2I6IGR1bW15TGFtYmRhLFxuICAgIH0pXG5cbiAgICAvLyBzeW50aCBhIGNsb3VkZm9ybWF0aW9uIHRlbXBsYXRlIGZyb20gdGhlIHN0YWNrXG4gICAgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2socGFyZW50U3RhY2spXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0ZW1wbGF0ZSA9IG51bGxcbiAgfSlcbiAgXG4gIHRlc3QoJ3N5bnRoZXNpc2VzIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6U3RlcEZ1bmN0aW9uczo6U3RhdGVNYWNoaW5lJywgMSlcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6Um9sZScsIDEpXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlBvbGljeScsIDEpXG4gIH0pXG59KVxuIl19