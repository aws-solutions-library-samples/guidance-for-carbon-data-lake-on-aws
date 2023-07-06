'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const assertions_1 = require('aws-cdk-lib/assertions')
const aws_cdk_lib_1 = require('aws-cdk-lib')
const aws_cdk_lib_2 = require('aws-cdk-lib')
const aws_cdk_lib_3 = require('aws-cdk-lib')
const stack_data_pipeline_1 = require('../../lib/stacks/stack-data-pipeline/stack-data-pipeline')
describe('test pipeline stack', () => {
  let template
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new aws_cdk_lib_1.App()
    // Pipeline stack requires the following props, create a dummy stack
    // to provide suitable inputs:
    //   - dataLineageFunction
    //   - landingBucket
    //   - rawBucket
    //   - transformedBucket
    //   - enrichedBucket
    const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack')
    const dummyFunction = new aws_cdk_lib_3.aws_lambda.Function(dummyInputsStack, 'dummyFunction', {
      runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_10,
      code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
      handler: 'lambda_handler',
    })
    const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {})
    // create the pipeline stack with the required props
    const pipelineStack = new stack_data_pipeline_1.DataPipelineStack(app, 'PipelineStack', {
      dataLineageFunction: dummyFunction,
      //landingBucket: dummyBucket, <--remove because bucket is now created in pipeline stack
      errorBucket: dummyBucket,
      rawBucket: dummyBucket,
      transformedBucket: dummyBucket,
      enrichedBucket: dummyBucket,
      notificationEmailAddress: 'a@b.com',
    })
    // synth a cloudformation template from the stack
    const template = assertions_1.Template.fromStack(pipelineStack)
  })
  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */
    // verify nested stack creation
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::CloudFormation::Stack', 4)
    // verify lambda creation
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 3)
    template === null || template === void 0
      ? void 0
      : template.hasResourceProperties('AWS::Lambda::Function', {
          Handler: 'app.lambda_handler',
          Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_10.name,
        })
    // verify iam role & policy creation for all lambdas
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3)
  })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsNkNBQXdDO0FBQ3hDLDZDQUEwQztBQUMxQyw2Q0FBa0Q7QUFFbEQsa0dBQTRGO0FBRTVGLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxRQUF5QixDQUFBO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBRTNELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQzNFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV0RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSx1Q0FBaUIsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQ2hFLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsdUZBQXVGO1lBQ3ZGLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLGlCQUFpQixFQUFFLFdBQVc7WUFDOUIsY0FBYyxFQUFFLFdBQVc7WUFDM0Isd0JBQXdCLEVBQUUsU0FBUztTQUNwQyxDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBRTlCLCtCQUErQjtRQUMvQixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTFELHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3JELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxDQUFDLENBQUE7UUFFRixvREFBb0Q7UUFDcEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2xELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNYXRjaCwgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJ1xuaW1wb3J0IHsgQXBwLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJ1xuXG5pbXBvcnQgeyBEYXRhUGlwZWxpbmVTdGFjayB9IGZyb20gJy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9zdGFjay1kYXRhLXBpcGVsaW5lJ1xuXG5kZXNjcmliZSgndGVzdCBwaXBlbGluZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKVxuXG4gICAgLy8gUGlwZWxpbmUgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAvLyB0byBwcm92aWRlIHN1aXRhYmxlIGlucHV0czpcbiAgICAvLyAgIC0gZGF0YUxpbmVhZ2VGdW5jdGlvblxuICAgIC8vICAgLSBsYW5kaW5nQnVja2V0XG4gICAgLy8gICAtIHJhd0J1Y2tldFxuICAgIC8vICAgLSB0cmFuc2Zvcm1lZEJ1Y2tldFxuICAgIC8vICAgLSBlbnJpY2hlZEJ1Y2tldFxuICAgIGNvbnN0IGR1bW15SW5wdXRzU3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnRHVtbXlJbnB1dHNTdGFjaycpXG5cbiAgICBjb25zdCBkdW1teUZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbihkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzksXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKCdkZWYgbGFtYmRhX2hhbmRsZXIoKTogcGFzcycpLFxuICAgICAgaGFuZGxlcjogJ2xhbWJkYV9oYW5kbGVyJyxcbiAgICB9KVxuICAgIGNvbnN0IGR1bW15QnVja2V0ID0gbmV3IHMzLkJ1Y2tldChkdW1teUlucHV0c1N0YWNrLCAnZHVtbXlCdWNrZXQnLCB7fSlcblxuICAgIC8vIGNyZWF0ZSB0aGUgcGlwZWxpbmUgc3RhY2sgd2l0aCB0aGUgcmVxdWlyZWQgcHJvcHNcbiAgICBjb25zdCBwaXBlbGluZVN0YWNrID0gbmV3IERhdGFQaXBlbGluZVN0YWNrKGFwcCwgJ1BpcGVsaW5lU3RhY2snLCB7XG4gICAgICBkYXRhTGluZWFnZUZ1bmN0aW9uOiBkdW1teUZ1bmN0aW9uLFxuICAgICAgLy9sYW5kaW5nQnVja2V0OiBkdW1teUJ1Y2tldCwgPC0tcmVtb3ZlIGJlY2F1c2UgYnVja2V0IGlzIG5vdyBjcmVhdGVkIGluIHBpcGVsaW5lIHN0YWNrXG4gICAgICBlcnJvckJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICByYXdCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgdHJhbnNmb3JtZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgZW5yaWNoZWRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgbm90aWZpY2F0aW9uRW1haWxBZGRyZXNzOiAnYUBiLmNvbScsXG4gICAgfSlcblxuICAgIC8vIHN5bnRoIGEgY2xvdWRmb3JtYXRpb24gdGVtcGxhdGUgZnJvbSB0aGUgc3RhY2tcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhwaXBlbGluZVN0YWNrKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgdGVtcGxhdGUgPSBudWxsXG4gIH0pXG4gIHRlc3QoJ3N5bnRoZXNpc2VzIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICAgIC8qID09PT09PSBBU1NFUlRJT05TID09PT09PSAqL1xuXG4gICAgLy8gdmVyaWZ5IG5lc3RlZCBzdGFjayBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJywgNClcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAzKVxuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIHtcbiAgICAgIEhhbmRsZXI6ICdhcHAubGFtYmRhX2hhbmRsZXInLFxuICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lLFxuICAgIH0pXG5cbiAgICAvLyB2ZXJpZnkgaWFtIHJvbGUgJiBwb2xpY3kgY3JlYXRpb24gZm9yIGFsbCBsYW1iZGFzXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlJvbGUnLCAzKVxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpQb2xpY3knLCAzKVxuICB9KVxufSlcbiJdfQ==
