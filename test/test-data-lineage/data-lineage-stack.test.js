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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1saW5lYWdlLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLWxpbmVhZ2Utc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFrRTtBQUNsRSw2Q0FBeUM7QUFDekMsNkNBQTJDO0FBQzNDLDZDQUFtRDtBQUVuRCxxSEFBeUg7QUFFekgsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUM7SUFFOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO1FBRXRCLHNFQUFzRTtRQUN0RSxnQ0FBZ0M7UUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDcEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9FQUFvQyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUN6RixhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUM7UUFFSCxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUVuQyxtQkFBbUI7UUFDbkIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUU7UUFFaEQseUJBQXlCO1FBQ3pCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFO1FBQ3RELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxFQUFDO1FBRUYsb0NBQW9DO1FBQ3BDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxFQUFFO1FBRWhFLG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtRQUMvQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtRQUVqRCw2Q0FBNkM7UUFDN0MsaUNBQWlDO1FBQ2pDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFDMUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUFDLHNCQUFzQixFQUFFLGtCQUFLLENBQUMsVUFBVSxDQUFDO1lBQ3ZFLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxhQUFhLEVBQUUsU0FBUztvQkFDeEIsT0FBTyxFQUFFLE1BQU07aUJBQ2hCO2dCQUNEO29CQUNFLGFBQWEsRUFBRSxTQUFTO29CQUN4QixPQUFPLEVBQUUsT0FBTztpQkFDakI7YUFDRjtZQUNELHNCQUFzQixFQUFFO2dCQUN0QjtvQkFDRSxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsYUFBYSxFQUFFLFNBQVM7NEJBQ3hCLE9BQU8sRUFBRSxNQUFNO3lCQUNoQjtxQkFDRjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsY0FBYyxFQUFFLEtBQUs7cUJBQ3RCO2lCQUNGO2FBQ0Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckI7b0JBQ0UsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGFBQWEsRUFBRSxTQUFTOzRCQUN4QixPQUFPLEVBQUUsTUFBTTt5QkFDaEI7d0JBQ0Q7NEJBQ0UsYUFBYSxFQUFFLGNBQWM7NEJBQzdCLE9BQU8sRUFBRSxPQUFPO3lCQUNqQjtxQkFDRjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsY0FBYyxFQUFFLEtBQUs7cUJBQ3RCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLEVBQUU7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2FwdHVyZSwgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnREYXRhTGluZWFnZVN0YWNrIH0gZnJvbSBcIi4uLy4uL2xpYi9zdGFja3Mvc3RhY2stZGF0YS1saW5lYWdlL2NhcmJvbmxha2UtZGF0YS1saW5lYWdlLXN0YWNrXCI7XG5cbmRlc2NyaWJlKFwidGVzdCBkYXRhIGxpbmVhZ2Ugc3RhY2tcIiwgKCkgPT4ge1xuICBsZXQgdGVtcGxhdGU6IFRlbXBsYXRlIHwgbnVsbDtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG5cbiAgICAvLyBEYXRhIGxpbmVhZ2Ugc3RhY2sgcmVxdWlyZXMgYW4gYXJjaGl2ZSBidWNrZXQgYXMgZW50cnkgcHJvcCBjcmVhdGVkXG4gICAgLy8gYnkgdGhlIHNoYXJlZCByZXNvdXJjZXMgc3RhY2tcbiAgICBjb25zdCBzaGFyZWRSZXNvdXJjZXNTdGFjayA9IG5ldyBTdGFjayhhcHAsIFwiU2hhcmVkUmVzb3VyY2VzU3RhY2tcIik7XG4gICAgY29uc3QgYXJjaGl2ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQoc2hhcmVkUmVzb3VyY2VzU3RhY2ssIFwiQXJjaGl2ZUJ1Y2tldFwiLCB7fSk7XG5cbiAgICBjb25zdCBkYXRhTGluZWFnZVN0YWNrID0gbmV3IENhcmJvbmxha2VRdWlja3N0YXJ0RGF0YUxpbmVhZ2VTdGFjayhhcHAsIFwiRGF0YUxpbmVhZ2VTdGFja1wiLCB7XG4gICAgICBhcmNoaXZlQnVja2V0OiBhcmNoaXZlQnVja2V0XG4gICAgfSk7XG5cbiAgICB0ZW1wbGF0ZSA9IFRlbXBsYXRlLmZyb21TdGFjayhkYXRhTGluZWFnZVN0YWNrKTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHsgdGVtcGxhdGUgPSBudWxsIH0pO1xuXG4gIHRlc3QoXCJzeW50aGVzaXNlcyBhcyBleHBlY3RlZFwiLCAoKSA9PiB7XG5cbiAgICAvLyB0d28gcXVldWVzIGV4aXN0XG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6U1FTOjpRdWV1ZVwiLCAyKTtcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpMYW1iZGE6OkZ1bmN0aW9uXCIsIDMpO1xuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoXCJBV1M6OkxhbWJkYTo6RnVuY3Rpb25cIiwge1xuICAgICAgSGFuZGxlcjogXCJhcHAubGFtYmRhX2hhbmRsZXJcIixcbiAgICAgIFJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzkubmFtZVxuICAgIH0pXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIHN1YnNjcmlwdGlvbiB0byBhd3NcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpMYW1iZGE6OkV2ZW50U291cmNlTWFwcGluZ1wiLCAyKTtcblxuICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlJvbGVcIiwgMyk7XG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcyhcIkFXUzo6SUFNOjpQb2xpY3lcIiwgMyk7XG5cbiAgICAvLyBkZGIgY3JlYXRlZCB3aXRoIHBrPXJvb3RfaWQgYW5kIHNrPW5vZGVfaWRcbiAgICAvLyBoYXMgYSBnc2kgZm9yIHF1ZXJ5aW5nIG5vZGVfaWRcbiAgICAvLyBoYXMgYW4gbHNpIGZvciBxdWVyeWluZyBhY3Rpb25fdGFrZW5cbiAgICAvLyBhbGwgYXR0cmlidXRlcyBhcmUgcHJvamVjdGVkIG9uIGluZGV4ZXNcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKFwiQVdTOjpEeW5hbW9EQjo6VGFibGVcIiwgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICBLZXlTY2hlbWE6IFtcbiAgICAgICAge1xuICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6IFwicm9vdF9pZFwiLFxuICAgICAgICAgIEtleVR5cGU6IFwiSEFTSFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiBcIm5vZGVfaWRcIixcbiAgICAgICAgICBLZXlUeXBlOiBcIlJBTkdFXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIEdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiBcIm5vZGVfaWRcIixcbiAgICAgICAgICAgICAgS2V5VHlwZTogXCJIQVNIXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIFByb2plY3Rpb246IHtcbiAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiBcIkFMTFwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgTG9jYWxTZWNvbmRhcnlJbmRleGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBLZXlTY2hlbWE6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogXCJyb290X2lkXCIsXG4gICAgICAgICAgICAgIEtleVR5cGU6IFwiSEFTSFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiBcImFjdGlvbl90YWtlblwiLFxuICAgICAgICAgICAgICBLZXlUeXBlOiBcIlJBTkdFXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIFByb2plY3Rpb246IHtcbiAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiBcIkFMTFwiXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkpO1xuICB9KTtcbn0pO1xuIl19
