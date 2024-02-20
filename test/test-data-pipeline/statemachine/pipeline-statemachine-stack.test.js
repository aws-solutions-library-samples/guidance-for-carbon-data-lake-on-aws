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
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_12,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFFeEMsNkNBQTRDO0FBQzVDLDZDQUFrRDtBQUVsRCw0S0FBNEo7QUFFNUosUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQix3RUFBd0U7UUFDeEUsOEJBQThCO1FBQzlCLDBCQUEwQjtRQUMxQix3RkFBd0Y7UUFDeEYsMEVBQTBFO1FBQzFFLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFO1lBQ3ZFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFFRixzRUFBc0U7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUU3RCxvREFBb0Q7UUFDcEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLCtEQUF3QixDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUU7WUFDbkYsbUJBQW1CLEVBQUUsV0FBVztZQUNoQyxpQkFBaUIsRUFBRSxXQUFXO1lBQzlCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLG1CQUFtQixFQUFFLFVBQVU7WUFDL0Isb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsV0FBVztZQUM1QixjQUFjLEVBQUUsV0FBVztTQUM1QixDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQyxDQUFBO0lBRUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLFFBQVEsR0FBRyxJQUFJLENBQUE7SUFDakIsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ25DLDhCQUE4QjtRQUM5QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtDQUFrQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ2hFLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDOUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNsRCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucydcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3NucyBhcyBzbnMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IERhdGFQaXBlbGluZVN0YXRlbWFjaGluZSB9IGZyb20gJy4uLy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jb25zdHJ1Y3QtZGF0YS1waXBlbGluZS1zdGF0ZW1hY2hpbmUvY29uc3RydWN0LWRhdGEtcGlwZWxpbmUtc3RhdGVtYWNoaW5lJ1xuXG5kZXNjcmliZSgndGVzdCBzdGF0ZW1hY2hpbmUgc3RhY2snLCAoKSA9PiB7XG4gIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gU3RhdGVtYWNoaW5lIHN0YWNrIHJlcXVpcmVzIHRoZSBmb2xsb3dpbmcgcHJvcHMsIGNyZWF0ZSBhIGR1bW15IHN0YWNrXG4gICAgLy8gdG8gcHJvdmlkZSBzdWl0YWJsZSBpbnB1dHM6XG4gICAgLy8gICAtIGRhdGFMaW5lYWdlRnVuY3Rpb25cbiAgICAvLyAgIC0gZGF0YVF1YWxpdHlKb2IgPT4gdGhpcyBpcyBhIGR1bW15IHBsYWNlaG9sZGVyIHVudGlsIHRoZSBkYXRhIHF1YWxpdHkgam9iIGlzIHJlYWR5XG4gICAgLy8gICAtIHMzY29waWVyRnVuY3Rpb24gPT4gc3RhbmQtaW4gbGFtYmRhIGZ1bmN0aW9uIGZvciB0aGUgZGF0YVF1YWxpdHlKb2JcbiAgICAvLyAgIC0gZ2x1ZVRyYW5zZm9ybUpvYk5hbWVcbiAgICAvLyAgIC0gYmF0Y2hFbnVtTGFtYmRhXG4gICAgLy8gICAtIGNhbGN1bGF0aW9uSm9iXG4gICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdEdW1teUlucHV0c1N0YWNrJylcbiAgICBjb25zdCBkdW1teVRvcGljID0gbmV3IHNucy5Ub3BpYyhkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlUb3BpYycsIHt9KVxuICAgIGNvbnN0IGR1bW15TGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMixcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoJ2RlZiBsYW1iZGFfaGFuZGxlcigpOiBwYXNzJyksXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLFxuICAgIH0pXG5cbiAgICAvLyBzdGF0ZW1hY2hpbmVTdGFjayBpcyBhIG5lc3RlZCBzdGFjaywgc28gY3JlYXRlIGEgcGFyZW50IHBsYWNlaG9sZGVyXG4gICAgY29uc3QgcGFyZW50U3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnUGFyZW50UGlwZWxpbmVTdGFjaycsIHt9KVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgIGNvbnN0IHN0YXRlbWFjaGluZVN0YWNrID0gbmV3IERhdGFQaXBlbGluZVN0YXRlbWFjaGluZShwYXJlbnRTdGFjaywgJ1BpcGVsaW5lU3RhY2snLCB7XG4gICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxUmVzb3VyY2VzTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxUmVzdWx0c0xhbWJkYTogZHVtbXlMYW1iZGEsXG4gICAgICBkcUVycm9yTm90aWZpY2F0aW9uOiBkdW1teVRvcGljLFxuICAgICAgZ2x1ZVRyYW5zZm9ybUpvYk5hbWU6ICd4eXonLFxuICAgICAgYmF0Y2hFbnVtTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGNhbGN1bGF0aW9uSm9iOiBkdW1teUxhbWJkYSxcbiAgICB9KVxuXG4gICAgLy8gc3ludGggYSBjbG91ZGZvcm1hdGlvbiB0ZW1wbGF0ZSBmcm9tIHRoZSBzdGFja1xuICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHBhcmVudFN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG5cbiAgdGVzdCgnc3ludGhlc2lzZXMgYXMgZXhwZWN0ZWQnLCAoKSA9PiB7XG4gICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpTdGVwRnVuY3Rpb25zOjpTdGF0ZU1hY2hpbmUnLCAxKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpSb2xlJywgMSlcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6UG9saWN5JywgMSlcbiAgfSlcbn0pXG4iXX0=