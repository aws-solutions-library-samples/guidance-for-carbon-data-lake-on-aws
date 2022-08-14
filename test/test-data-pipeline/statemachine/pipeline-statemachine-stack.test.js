'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const assertions_1 = require('aws-cdk-lib/assertions')
const aws_cdk_lib_1 = require('aws-cdk-lib')
const aws_cdk_lib_2 = require('aws-cdk-lib')
const aws_cdk_lib_3 = require('aws-cdk-lib')
const carbonlake_qs_statemachine_stack_1 = require('../../../lib/stacks/stack-data-pipeline/statemachine/carbonlake-qs-statemachine-stack')
describe('test statemachine stack', () => {
  let template
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new aws_cdk_lib_1.App()
    // Statemachine stack requires the following props, create a dummy stack
    // to provide suitable inputs:
    //   - dataLineageFunction
    //   - dataQualityJob => this is a dummy placeholder until the data quality job is ready
    //   - s3copierFunction => stand-in lambda function for the dataQualityJob
    //   - glueTransformJobName
    //   - batchEnumLambda
    //   - calculationJob
    const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack')
    const dummyTopic = new aws_cdk_lib_2.aws_sns.Topic(dummyInputsStack, 'dummyTopic', {})
    const dummyLambda = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, 'dummyLambda', {
      runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
      code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
      handler: 'lambda_handler',
    })
    // statemachineStack is a nested stack, so create a parent placeholder
    const parentStack = new aws_cdk_lib_1.Stack(app, 'ParentPipelineStack', {})
    // create the pipeline stack with the required props
    const statemachineStack = new carbonlake_qs_statemachine_stack_1.CLQSStatemachineStack(
      parentStack,
      'PipelineStack',
      {
        dataLineageFunction: dummyLambda,
        dqResourcesLambda: dummyLambda,
        dqResultsLambda: dummyLambda,
        dqErrorNotification: dummyTopic,
        glueTransformJobName: 'xyz',
        batchEnumLambda: dummyLambda,
        calculationJob: dummyLambda,
      }
    )
    // synth a cloudformation template from the stack
    template = assertions_1.Template.fromStack(statemachineStack)
  })
  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::StepFunctions::StateMachine', 1)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 1)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 1)
  })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhdGVtYWNoaW5lLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwaXBlbGluZS1zdGF0ZW1hY2hpbmUtc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF3RDtBQUN4RCw2Q0FBd0M7QUFFeEMsNkNBQTRDO0FBQzVDLDZDQUFrRDtBQUVsRCw0SUFBNkg7QUFFN0gsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQTtRQUVyQix3RUFBd0U7UUFDeEUsOEJBQThCO1FBQzlCLDBCQUEwQjtRQUMxQix3RkFBd0Y7UUFDeEYsMEVBQTBFO1FBQzFFLDJCQUEyQjtRQUMzQixzQkFBc0I7UUFDdEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE1BQU0sVUFBVSxHQUFHLElBQUkscUJBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFO1lBQ3ZFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFFRixzRUFBc0U7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUU3RCxvREFBb0Q7UUFDcEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHdEQUFxQixDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUU7WUFDaEYsbUJBQW1CLEVBQUUsV0FBVztZQUNoQyxpQkFBaUIsRUFBRSxXQUFXO1lBQzlCLGVBQWUsRUFBRSxXQUFXO1lBQzVCLG1CQUFtQixFQUFFLFVBQVU7WUFDL0Isb0JBQW9CLEVBQUUsS0FBSztZQUMzQixlQUFlLEVBQUUsV0FBVztZQUM1QixjQUFjLEVBQUUsV0FBVztTQUM1QixDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsUUFBUSxHQUFHLHFCQUFRLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDbEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBQzlCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxFQUFDO1FBQ2hFLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFDO1FBQzlDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJ1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3Nfc25zIGFzIHNucyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYidcblxuaW1wb3J0IHsgQ0xRU1N0YXRlbWFjaGluZVN0YWNrIH0gZnJvbSAnLi4vLi4vLi4vbGliL3N0YWNrcy9zdGFjay1kYXRhLXBpcGVsaW5lL3N0YXRlbWFjaGluZS9jYXJib25sYWtlLXFzLXN0YXRlbWFjaGluZS1zdGFjaydcblxuZGVzY3JpYmUoJ3Rlc3Qgc3RhdGVtYWNoaW5lIHN0YWNrJywgKCkgPT4ge1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbFxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIC8qID09PT09PSBTRVRVUCA9PT09PT0gKi9cbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwKClcblxuICAgIC8vIFN0YXRlbWFjaGluZSBzdGFjayByZXF1aXJlcyB0aGUgZm9sbG93aW5nIHByb3BzLCBjcmVhdGUgYSBkdW1teSBzdGFja1xuICAgIC8vIHRvIHByb3ZpZGUgc3VpdGFibGUgaW5wdXRzOlxuICAgIC8vICAgLSBkYXRhTGluZWFnZUZ1bmN0aW9uXG4gICAgLy8gICAtIGRhdGFRdWFsaXR5Sm9iID0+IHRoaXMgaXMgYSBkdW1teSBwbGFjZWhvbGRlciB1bnRpbCB0aGUgZGF0YSBxdWFsaXR5IGpvYiBpcyByZWFkeVxuICAgIC8vICAgLSBzM2NvcGllckZ1bmN0aW9uID0+IHN0YW5kLWluIGxhbWJkYSBmdW5jdGlvbiBmb3IgdGhlIGRhdGFRdWFsaXR5Sm9iXG4gICAgLy8gICAtIGdsdWVUcmFuc2Zvcm1Kb2JOYW1lXG4gICAgLy8gICAtIGJhdGNoRW51bUxhbWJkYVxuICAgIC8vICAgLSBjYWxjdWxhdGlvbkpvYlxuICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnRHVtbXlJbnB1dHNTdGFjaycpXG4gICAgY29uc3QgZHVtbXlUb3BpYyA9IG5ldyBzbnMuVG9waWMoZHVtbXlJbnB1dHNTdGFjaywgJ2R1bW15VG9waWMnLCB7fSlcbiAgICBjb25zdCBkdW1teUxhbWJkYSA9IG5ldyBsYW1iZGEuRnVuY3Rpb24oZHVtbXlJbnB1dHNTdGFjaywgJ2R1bW15TGFtYmRhJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoJ2RlZiBsYW1iZGFfaGFuZGxlcigpOiBwYXNzJyksXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLFxuICAgIH0pXG5cbiAgICAvLyBzdGF0ZW1hY2hpbmVTdGFjayBpcyBhIG5lc3RlZCBzdGFjaywgc28gY3JlYXRlIGEgcGFyZW50IHBsYWNlaG9sZGVyXG4gICAgY29uc3QgcGFyZW50U3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnUGFyZW50UGlwZWxpbmVTdGFjaycsIHt9KVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgIGNvbnN0IHN0YXRlbWFjaGluZVN0YWNrID0gbmV3IENMUVNTdGF0ZW1hY2hpbmVTdGFjayhwYXJlbnRTdGFjaywgJ1BpcGVsaW5lU3RhY2snLCB7XG4gICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxUmVzb3VyY2VzTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGRxUmVzdWx0c0xhbWJkYTogZHVtbXlMYW1iZGEsXG4gICAgICBkcUVycm9yTm90aWZpY2F0aW9uOiBkdW1teVRvcGljLFxuICAgICAgZ2x1ZVRyYW5zZm9ybUpvYk5hbWU6ICd4eXonLFxuICAgICAgYmF0Y2hFbnVtTGFtYmRhOiBkdW1teUxhbWJkYSxcbiAgICAgIGNhbGN1bGF0aW9uSm9iOiBkdW1teUxhbWJkYSxcbiAgICB9KVxuXG4gICAgLy8gc3ludGggYSBjbG91ZGZvcm1hdGlvbiB0ZW1wbGF0ZSBmcm9tIHRoZSBzdGFja1xuICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHN0YXRlbWFjaGluZVN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG5cbiAgdGVzdCgnc3ludGhlc2lzZXMgYXMgZXhwZWN0ZWQnLCAoKSA9PiB7XG4gICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpTdGVwRnVuY3Rpb25zOjpTdGF0ZU1hY2hpbmUnLCAxKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpSb2xlJywgMSlcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6UG9saWN5JywgMSlcbiAgfSlcbn0pXG4iXX0=
