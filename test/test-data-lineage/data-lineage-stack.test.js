'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const assertions_1 = require('aws-cdk-lib/assertions')
const aws_cdk_lib_1 = require('aws-cdk-lib')
const aws_cdk_lib_2 = require('aws-cdk-lib')
const aws_cdk_lib_3 = require('aws-cdk-lib')
const carbonlake_data_lineage_stack_1 = require('../../lib/stacks/stack-data-lineage/carbonlake-data-lineage-stack')
describe('test data lineage stack', () => {
  let template
  beforeEach(() => {
    const app = new aws_cdk_lib_1.App()
    // Data lineage stack requires an archive bucket as entry prop created
    // by the shared resources stack
    const sharedResourcesStack = new aws_cdk_lib_1.Stack(app, 'SharedResourcesStack')
    const archiveBucket = new aws_cdk_lib_2.aws_s3.Bucket(sharedResourcesStack, 'ArchiveBucket', {})
    const dataLineageStack = new carbonlake_data_lineage_stack_1.CarbonlakeQuickstartDataLineageStack(
      app,
      'DataLineageStack',
      {
        archiveBucket: archiveBucket,
      }
    )
    template = assertions_1.Template.fromStack(dataLineageStack)
  })
  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    // two queues exist
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::SQS::Queue', 2)
    // verify lambda creation
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 3)
    template === null || template === void 0
      ? void 0
      : template.hasResourceProperties('AWS::Lambda::Function', {
          Handler: 'app.lambda_handler',
          Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        })
    // verify lambda subscription to aws
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::EventSourceMapping', 2)
    // verify iam role & policy creation for all lambdas
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3)
    template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3)
    // ddb created with pk=root_id and sk=node_id
    // has a gsi for querying node_id
    // has an lsi for querying action_taken
    // all attributes are projected on indexes
    template === null || template === void 0
      ? void 0
      : template.hasResourceProperties(
          'AWS::DynamoDB::Table',
          assertions_1.Match.objectLike({
            KeySchema: [
              {
                AttributeName: 'root_id',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'node_id',
                KeyType: 'RANGE',
              },
            ],
            GlobalSecondaryIndexes: [
              {
                KeySchema: [
                  {
                    AttributeName: 'node_id',
                    KeyType: 'HASH',
                  },
                ],
                Projection: {
                  ProjectionType: 'ALL',
                },
              },
            ],
            LocalSecondaryIndexes: [
              {
                KeySchema: [
                  {
                    AttributeName: 'root_id',
                    KeyType: 'HASH',
                  },
                  {
                    AttributeName: 'action_taken',
                    KeyType: 'RANGE',
                  },
                ],
                Projection: {
                  ProjectionType: 'ALL',
                },
              },
            ],
          })
        )
  })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1saW5lYWdlLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLWxpbmVhZ2Utc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFpRTtBQUNqRSw2Q0FBd0M7QUFDeEMsNkNBQTBDO0FBQzFDLDZDQUFrRDtBQUVsRCxxSEFBd0g7QUFFeEgsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFBO1FBRXJCLHNFQUFzRTtRQUN0RSxnQ0FBZ0M7UUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUE7UUFDbkUsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9FQUFvQyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUN6RixhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUE7UUFFRixRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRCxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxtQkFBbUI7UUFDbkIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUM7UUFFL0MseUJBQXlCO1FBQ3pCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFDO1FBQ3JELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxFQUFDO1FBRUYsb0NBQW9DO1FBQ3BDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxFQUFDO1FBRS9ELG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBQztRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQztRQUVoRCw2Q0FBNkM7UUFDN0MsaUNBQWlDO1FBQ2pDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFDMUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUM3QixzQkFBc0IsRUFDdEIsa0JBQUssQ0FBQyxVQUFVLENBQUM7WUFDZixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLE9BQU8sRUFBRSxNQUFNO2lCQUNoQjtnQkFDRDtvQkFDRSxhQUFhLEVBQUUsU0FBUztvQkFDeEIsT0FBTyxFQUFFLE9BQU87aUJBQ2pCO2FBQ0Y7WUFDRCxzQkFBc0IsRUFBRTtnQkFDdEI7b0JBQ0UsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGFBQWEsRUFBRSxTQUFTOzRCQUN4QixPQUFPLEVBQUUsTUFBTTt5QkFDaEI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCO29CQUNFLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxhQUFhLEVBQUUsU0FBUzs0QkFDeEIsT0FBTyxFQUFFLE1BQU07eUJBQ2hCO3dCQUNEOzRCQUNFLGFBQWEsRUFBRSxjQUFjOzRCQUM3QixPQUFPLEVBQUUsT0FBTzt5QkFDakI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxFQUNIO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhcHR1cmUsIE1hdGNoLCBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnXG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IENhcmJvbmxha2VRdWlja3N0YXJ0RGF0YUxpbmVhZ2VTdGFjayB9IGZyb20gJy4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1saW5lYWdlL2NhcmJvbmxha2UtZGF0YS1saW5lYWdlLXN0YWNrJ1xuXG5kZXNjcmliZSgndGVzdCBkYXRhIGxpbmVhZ2Ugc3RhY2snLCAoKSA9PiB7XG4gIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBudWxsXG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgY29uc3QgYXBwID0gbmV3IEFwcCgpXG5cbiAgICAvLyBEYXRhIGxpbmVhZ2Ugc3RhY2sgcmVxdWlyZXMgYW4gYXJjaGl2ZSBidWNrZXQgYXMgZW50cnkgcHJvcCBjcmVhdGVkXG4gICAgLy8gYnkgdGhlIHNoYXJlZCByZXNvdXJjZXMgc3RhY2tcbiAgICBjb25zdCBzaGFyZWRSZXNvdXJjZXNTdGFjayA9IG5ldyBTdGFjayhhcHAsICdTaGFyZWRSZXNvdXJjZXNTdGFjaycpXG4gICAgY29uc3QgYXJjaGl2ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoc2hhcmVkUmVzb3VyY2VzU3RhY2ssICdBcmNoaXZlQnVja2V0Jywge30pXG5cbiAgICBjb25zdCBkYXRhTGluZWFnZVN0YWNrID0gbmV3IENhcmJvbmxha2VRdWlja3N0YXJ0RGF0YUxpbmVhZ2VTdGFjayhhcHAsICdEYXRhTGluZWFnZVN0YWNrJywge1xuICAgICAgYXJjaGl2ZUJ1Y2tldDogYXJjaGl2ZUJ1Y2tldCxcbiAgICB9KVxuXG4gICAgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soZGF0YUxpbmVhZ2VTdGFjaylcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIHRlbXBsYXRlID0gbnVsbFxuICB9KVxuXG4gIHRlc3QoJ3N5bnRoZXNpc2VzIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICAgIC8vIHR3byBxdWV1ZXMgZXhpc3RcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OlNRUzo6UXVldWUnLCAyKVxuXG4gICAgLy8gdmVyaWZ5IGxhbWJkYSBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIDMpXG4gICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywge1xuICAgICAgSGFuZGxlcjogJ2FwcC5sYW1iZGFfaGFuZGxlcicsXG4gICAgICBSdW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185Lm5hbWUsXG4gICAgfSlcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgc3Vic2NyaXB0aW9uIHRvIGF3c1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6TGFtYmRhOjpFdmVudFNvdXJjZU1hcHBpbmcnLCAyKVxuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhc1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpSb2xlJywgMylcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6UG9saWN5JywgMylcblxuICAgIC8vIGRkYiBjcmVhdGVkIHdpdGggcGs9cm9vdF9pZCBhbmQgc2s9bm9kZV9pZFxuICAgIC8vIGhhcyBhIGdzaSBmb3IgcXVlcnlpbmcgbm9kZV9pZFxuICAgIC8vIGhhcyBhbiBsc2kgZm9yIHF1ZXJ5aW5nIGFjdGlvbl90YWtlblxuICAgIC8vIGFsbCBhdHRyaWJ1dGVzIGFyZSBwcm9qZWN0ZWQgb24gaW5kZXhlc1xuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoXG4gICAgICAnQVdTOjpEeW5hbW9EQjo6VGFibGUnLFxuICAgICAgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdyb290X2lkJyxcbiAgICAgICAgICAgIEtleVR5cGU6ICdIQVNIJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdub2RlX2lkJyxcbiAgICAgICAgICAgIEtleVR5cGU6ICdSQU5HRScsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgR2xvYmFsU2Vjb25kYXJ5SW5kZXhlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogJ25vZGVfaWQnLFxuICAgICAgICAgICAgICAgIEtleVR5cGU6ICdIQVNIJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9qZWN0aW9uOiB7XG4gICAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiAnQUxMJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgTG9jYWxTZWNvbmRhcnlJbmRleGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgS2V5U2NoZW1hOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiAncm9vdF9pZCcsXG4gICAgICAgICAgICAgICAgS2V5VHlwZTogJ0hBU0gnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogJ2FjdGlvbl90YWtlbicsXG4gICAgICAgICAgICAgICAgS2V5VHlwZTogJ1JBTkdFJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9qZWN0aW9uOiB7XG4gICAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiAnQUxMJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgKVxuICB9KVxufSlcbiJdfQ==
