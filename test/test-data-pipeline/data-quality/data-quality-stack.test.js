'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const assertions_1 = require('aws-cdk-lib/assertions')
const aws_cdk_lib_1 = require('aws-cdk-lib')
const aws_cdk_lib_2 = require('aws-cdk-lib')
const aws_cdk_lib_3 = require('aws-cdk-lib')
const carbonlake_qs_data_quality_1 = require('../../../lib/stacks/stack-data-pipeline/data-quality/carbonlake-qs-data-quality')
describe('test pipeline stack', () => {
  let template
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new aws_cdk_lib_1.App()
    // DQ stack requires the following props, create a dummy stack
    // to provide suitable inputs:
    //   - inputBucket
    //   - outputBucket
    //   - errorBucket
    const dummyInputsStack = new aws_cdk_lib_1.Stack(app, 'DummyInputsStack')
    const dummyBucket = new aws_cdk_lib_2.aws_s3.Bucket(dummyInputsStack, 'dummyBucket', {})
    // DQ stack is nested, create a parent stack as placeholder
    const parentStack = new aws_cdk_lib_1.Stack(app, 'DQParentStack', {})
    // create the pipeline stack with the required props
    const dqStack = new carbonlake_qs_data_quality_1.CarbonlakeDataQualityStack(parentStack, 'DQStack', {
      inputBucket: dummyBucket,
      outputBucket: dummyBucket,
      errorBucket: dummyBucket,
    })
    // synth a cloudformation template from the stack
    const template = assertions_1.Template.fromStack(dqStack)
  })
  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */
    // creates the results bucket
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::S3::Bucket', 1)
    // verify lambda creation
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 2)
    template === null || template === void 0
      ? void 0
      : template.hasResourceProperties('AWS::Lambda::Function', {
          Handler: 'app.lambda_handler',
          Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        })
    // verify iam role & policy creation for all lambdas and dq job
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3)
  })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1xdWFsaXR5LXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLXF1YWxpdHktc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF5RDtBQUN6RCw2Q0FBeUM7QUFDekMsNkNBQTJDO0FBQzNDLDZDQUFtRDtBQUVuRCxnSUFBNkg7QUFFN0gsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxJQUFJLFFBQXlCLENBQUM7SUFDOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLHlCQUF5QjtRQUN6QixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQztRQUV0Qiw4REFBOEQ7UUFDOUQsOEJBQThCO1FBQzlCLGtCQUFrQjtRQUNsQixtQkFBbUI7UUFDbkIsa0JBQWtCO1FBQ2xCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQzVELE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLDJEQUEyRDtRQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV2RCxvREFBb0Q7UUFDcEQsTUFBTSxPQUFPLEdBQUcsSUFBSSx1REFBMEIsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFO1lBQ25FLFdBQVcsRUFBRSxXQUFXO1lBQ3hCLFlBQVksRUFBRSxXQUFXO1lBQ3pCLFdBQVcsRUFBRSxXQUFXO1NBQzNCLENBQUMsQ0FBQztRQUVILGlEQUFpRDtRQUNqRCxNQUFNLFFBQVEsR0FBRyxxQkFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNqQyw4QkFBOEI7UUFFOUIsNkJBQTZCO1FBQzdCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFO1FBRWhELHlCQUF5QjtRQUN6QixRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRTtRQUN0RCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDckQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsd0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7U0FDMUMsRUFBRTtRQUVILCtEQUErRDtRQUMvRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtRQUMvQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtJQUNyRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZURhdGFRdWFsaXR5U3RhY2sgfSBmcm9tICcuLi8uLi8uLi9saWIvc3RhY2tzL3N0YWNrLWRhdGEtcGlwZWxpbmUvZGF0YS1xdWFsaXR5L2NhcmJvbmxha2UtcXMtZGF0YS1xdWFsaXR5JztcblxuZGVzY3JpYmUoXCJ0ZXN0IHBpcGVsaW5lIHN0YWNrXCIsICgpID0+IHtcbiAgICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbDtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgLyogPT09PT09IFNFVFVQID09PT09PSAqL1xuICAgICAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG5cbiAgICAgICAgLy8gRFEgc3RhY2sgcmVxdWlyZXMgdGhlIGZvbGxvd2luZyBwcm9wcywgY3JlYXRlIGEgZHVtbXkgc3RhY2tcbiAgICAgICAgLy8gdG8gcHJvdmlkZSBzdWl0YWJsZSBpbnB1dHM6XG4gICAgICAgIC8vICAgLSBpbnB1dEJ1Y2tldFxuICAgICAgICAvLyAgIC0gb3V0cHV0QnVja2V0XG4gICAgICAgIC8vICAgLSBlcnJvckJ1Y2tldFxuICAgICAgICBjb25zdCBkdW1teUlucHV0c1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgXCJEdW1teUlucHV0c1N0YWNrXCIpO1xuICAgICAgICBjb25zdCBkdW1teUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoZHVtbXlJbnB1dHNTdGFjaywgXCJkdW1teUJ1Y2tldFwiLCB7fSk7XG5cbiAgICAgICAgLy8gRFEgc3RhY2sgaXMgbmVzdGVkLCBjcmVhdGUgYSBwYXJlbnQgc3RhY2sgYXMgcGxhY2Vob2xkZXJcbiAgICAgICAgY29uc3QgcGFyZW50U3RhY2sgPSBuZXcgU3RhY2soYXBwLCBcIkRRUGFyZW50U3RhY2tcIiwge30pXG4gICAgICAgIFxuICAgICAgICAvLyBjcmVhdGUgdGhlIHBpcGVsaW5lIHN0YWNrIHdpdGggdGhlIHJlcXVpcmVkIHByb3BzXG4gICAgICAgIGNvbnN0IGRxU3RhY2sgPSBuZXcgQ2FyYm9ubGFrZURhdGFRdWFsaXR5U3RhY2socGFyZW50U3RhY2ssIFwiRFFTdGFja1wiLCB7XG4gICAgICAgICAgICBpbnB1dEJ1Y2tldDogZHVtbXlCdWNrZXQsXG4gICAgICAgICAgICBvdXRwdXRCdWNrZXQ6IGR1bW15QnVja2V0LFxuICAgICAgICAgICAgZXJyb3JCdWNrZXQ6IGR1bW15QnVja2V0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHN5bnRoIGEgY2xvdWRmb3JtYXRpb24gdGVtcGxhdGUgZnJvbSB0aGUgc3RhY2tcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soZHFTdGFjayk7XG4gICAgfSk7XG5cbiAgICBhZnRlckVhY2goKCkgPT4geyB0ZW1wbGF0ZSA9IG51bGwgfSk7XG5cbiAgICB0ZXN0KFwic3ludGhlc2lzZXMgYXMgZXhwZWN0ZWRcIiwgKCkgPT4ge1xuICAgICAgICAvKiA9PT09PT0gQVNTRVJUSU9OUyA9PT09PT0gKi9cblxuICAgICAgICAvLyBjcmVhdGVzIHRoZSByZXN1bHRzIGJ1Y2tldFxuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpTMzo6QnVja2V0XCIsIDEpO1xuXG4gICAgICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICAgICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCAyKTtcbiAgICAgICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCB7XG4gICAgICAgICAgICBIYW5kbGVyOiBcImFwcC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXMgYW5kIGRxIGpvYlxuICAgICAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlJvbGVcIiwgMyk7XG4gICAgICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OklBTTo6UG9saWN5XCIsIDMpO1xuICAgIH0pO1xufSkiXX0=
