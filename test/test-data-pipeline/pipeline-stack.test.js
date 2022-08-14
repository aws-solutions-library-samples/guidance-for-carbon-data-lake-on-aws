'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const assertions_1 = require('aws-cdk-lib/assertions')
const aws_cdk_lib_1 = require('aws-cdk-lib')
const aws_cdk_lib_2 = require('aws-cdk-lib')
const aws_cdk_lib_3 = require('aws-cdk-lib')
const carbonlake_qs_pipeline_stack_1 = require('../../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack')
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
      runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
      code: aws_cdk_lib_3.aws_lambda.Code.fromInline('def lambda_handler(): pass'),
      handler: 'lambda_handler',
    })
    const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {})
    // create the pipeline stack with the required props
    const pipelineStack = new carbonlake_qs_pipeline_stack_1.CLQSPipelineStack(app, 'PipelineStack', {
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
          Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        })
    // verify iam role & policy creation for all lambdas
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3)
  })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZWxpbmUtc3RhY2sudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBpcGVsaW5lLXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBd0Q7QUFDeEQsNkNBQXdDO0FBQ3hDLDZDQUEwQztBQUMxQyw2Q0FBa0Q7QUFFbEQsb0hBQXFHO0FBRXJHLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxRQUF5QixDQUFBO0lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCx5QkFBeUI7UUFDekIsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUE7UUFFckIsb0VBQW9FO1FBQ3BFLDhCQUE4QjtRQUM5QiwwQkFBMEI7UUFDMUIsb0JBQW9CO1FBQ3BCLGdCQUFnQjtRQUNoQix3QkFBd0I7UUFDeEIscUJBQXFCO1FBQ3JCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO1FBRTNELE1BQU0sYUFBYSxHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFO1lBQzNFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7WUFDMUQsT0FBTyxFQUFFLGdCQUFnQjtTQUMxQixDQUFDLENBQUE7UUFDRixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV0RSxvREFBb0Q7UUFDcEQsTUFBTSxhQUFhLEdBQUcsSUFBSSxnREFBaUIsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFO1lBQ2hFLG1CQUFtQixFQUFFLGFBQWE7WUFDbEMsdUZBQXVGO1lBQ3ZGLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLGlCQUFpQixFQUFFLFdBQVc7WUFDOUIsY0FBYyxFQUFFLFdBQVc7WUFDM0Isd0JBQXdCLEVBQUUsU0FBUztTQUNwQyxDQUFDLENBQUE7UUFFRixpREFBaUQ7UUFDakQsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsUUFBUSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDLENBQUMsQ0FBQTtJQUNGLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDbkMsOEJBQThCO1FBRTlCLCtCQUErQjtRQUMvQixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLDRCQUE0QixFQUFFLENBQUMsRUFBQztRQUUxRCx5QkFBeUI7UUFDekIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUM7UUFDckQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFO1lBQ3ZELE9BQU8sRUFBRSxvQkFBb0I7WUFDN0IsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO1NBQ3hDLEVBQUM7UUFFRixvREFBb0Q7UUFDcEQsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUM7UUFDOUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUM7SUFDbEQsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hdGNoLCBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnXG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IENMUVNQaXBlbGluZVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliL3N0YWNrcy9zdGFjay1kYXRhLXBpcGVsaW5lL2NhcmJvbmxha2UtcXMtcGlwZWxpbmUtc3RhY2snXG5cbmRlc2NyaWJlKCd0ZXN0IHBpcGVsaW5lIHN0YWNrJywgKCkgPT4ge1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbFxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvKiA9PT09PT0gU0VUVVAgPT09PT09ICovXG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpXG5cbiAgICAvLyBQaXBlbGluZSBzdGFjayByZXF1aXJlcyB0aGUgZm9sbG93aW5nIHByb3BzLCBjcmVhdGUgYSBkdW1teSBzdGFja1xuICAgIC8vIHRvIHByb3ZpZGUgc3VpdGFibGUgaW5wdXRzOlxuICAgIC8vICAgLSBkYXRhTGluZWFnZUZ1bmN0aW9uXG4gICAgLy8gICAtIGxhbmRpbmdCdWNrZXRcbiAgICAvLyAgIC0gcmF3QnVja2V0XG4gICAgLy8gICAtIHRyYW5zZm9ybWVkQnVja2V0XG4gICAgLy8gICAtIGVucmljaGVkQnVja2V0XG4gICAgY29uc3QgZHVtbXlJbnB1dHNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdEdW1teUlucHV0c1N0YWNrJylcblxuICAgIGNvbnN0IGR1bW15RnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKGR1bW15SW5wdXRzU3RhY2ssICdkdW1teUZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoJ2RlZiBsYW1iZGFfaGFuZGxlcigpOiBwYXNzJyksXG4gICAgICBoYW5kbGVyOiAnbGFtYmRhX2hhbmRsZXInLFxuICAgIH0pXG4gICAgY29uc3QgZHVtbXlCdWNrZXQgPSBuZXcgczMuQnVja2V0KGR1bW15SW5wdXRzU3RhY2ssICdkdW1teUJ1Y2tldCcsIHt9KVxuXG4gICAgLy8gY3JlYXRlIHRoZSBwaXBlbGluZSBzdGFjayB3aXRoIHRoZSByZXF1aXJlZCBwcm9wc1xuICAgIGNvbnN0IHBpcGVsaW5lU3RhY2sgPSBuZXcgQ0xRU1BpcGVsaW5lU3RhY2soYXBwLCAnUGlwZWxpbmVTdGFjaycsIHtcbiAgICAgIGRhdGFMaW5lYWdlRnVuY3Rpb246IGR1bW15RnVuY3Rpb24sXG4gICAgICAvL2xhbmRpbmdCdWNrZXQ6IGR1bW15QnVja2V0LCA8LS1yZW1vdmUgYmVjYXVzZSBidWNrZXQgaXMgbm93IGNyZWF0ZWQgaW4gcGlwZWxpbmUgc3RhY2tcbiAgICAgIGVycm9yQnVja2V0OiBkdW1teUJ1Y2tldCxcbiAgICAgIHJhd0J1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICB0cmFuc2Zvcm1lZEJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICBlbnJpY2hlZEJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICBub3RpZmljYXRpb25FbWFpbEFkZHJlc3M6ICdhQGIuY29tJyxcbiAgICB9KVxuXG4gICAgLy8gc3ludGggYSBjbG91ZGZvcm1hdGlvbiB0ZW1wbGF0ZSBmcm9tIHRoZSBzdGFja1xuICAgIGNvbnN0IHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKHBpcGVsaW5lU3RhY2spXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0ZW1wbGF0ZSA9IG51bGxcbiAgfSlcbiAgdGVzdCgnc3ludGhlc2lzZXMgYXMgZXhwZWN0ZWQnLCAoKSA9PiB7XG4gICAgLyogPT09PT09IEFTU0VSVElPTlMgPT09PT09ICovXG5cbiAgICAvLyB2ZXJpZnkgbmVzdGVkIHN0YWNrIGNyZWF0aW9uXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLCA0KVxuXG4gICAgLy8gdmVyaWZ5IGxhbWJkYSBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIDMpXG4gICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywge1xuICAgICAgSGFuZGxlcjogJ2FwcC5sYW1iZGFfaGFuZGxlcicsXG4gICAgICBSdW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185Lm5hbWUsXG4gICAgfSlcblxuICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6Um9sZScsIDMpXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlBvbGljeScsIDMpXG4gIH0pXG59KVxuIl19
