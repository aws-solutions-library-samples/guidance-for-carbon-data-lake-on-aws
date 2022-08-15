"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_data_lineage_stack_1 = require("../../lib/stacks/stack-data-lineage/carbonlake-data-lineage-stack");
describe('test data lineage stack', () => {
    let template;
    beforeEach(() => {
        const app = new aws_cdk_lib_1.App();
        // Data lineage stack requires an archive bucket as entry prop created
        // by the shared resources stack
        const sharedResourcesStack = new aws_cdk_lib_1.Stack(app, 'SharedResourcesStack');
        const archiveBucket = new aws_cdk_lib_2.aws_s3.Bucket(sharedResourcesStack, 'ArchiveBucket', {});
        const dataLineageStack = new carbonlake_data_lineage_stack_1.CLQSDataLineageStack(app, 'DataLineageStack', {
            archiveBucket: archiveBucket,
        });
        template = assertions_1.Template.fromStack(dataLineageStack);
    });
    afterEach(() => {
        template = null;
    });
    test('synthesises as expected', () => {
        // two queues exist
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::SQS::Queue', 2);
        // verify lambda creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::Function', 3);
        template === null || template === void 0 ? void 0 : template.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'app.lambda_handler',
            Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name,
        });
        // verify lambda subscription to aws
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::Lambda::EventSourceMapping', 2);
        // verify iam role & policy creation for all lambdas
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Policy', 3);
        // ddb created with pk=root_id and sk=node_id
        // has a gsi for querying node_id
        // has an lsi for querying action_taken
        // all attributes are projected on indexes
        template === null || template === void 0 ? void 0 : template.hasResourceProperties('AWS::DynamoDB::Table', assertions_1.Match.objectLike({
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
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1saW5lYWdlLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLWxpbmVhZ2Utc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFpRTtBQUNqRSw2Q0FBd0M7QUFDeEMsNkNBQTBDO0FBQzFDLDZDQUFrRDtBQUVsRCxxSEFBd0c7QUFFeEcsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFBO1FBRXJCLHNFQUFzRTtRQUN0RSxnQ0FBZ0M7UUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUE7UUFDbkUsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9EQUFvQixDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUN6RSxhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUE7UUFFRixRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRCxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxtQkFBbUI7UUFDbkIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUM7UUFFL0MseUJBQXlCO1FBQ3pCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFDO1FBQ3JELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxFQUFDO1FBRUYsb0NBQW9DO1FBQ3BDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxFQUFDO1FBRS9ELG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBQztRQUM5QyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBQztRQUVoRCw2Q0FBNkM7UUFDN0MsaUNBQWlDO1FBQ2pDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFDMUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUM3QixzQkFBc0IsRUFDdEIsa0JBQUssQ0FBQyxVQUFVLENBQUM7WUFDZixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLE9BQU8sRUFBRSxNQUFNO2lCQUNoQjtnQkFDRDtvQkFDRSxhQUFhLEVBQUUsU0FBUztvQkFDeEIsT0FBTyxFQUFFLE9BQU87aUJBQ2pCO2FBQ0Y7WUFDRCxzQkFBc0IsRUFBRTtnQkFDdEI7b0JBQ0UsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGFBQWEsRUFBRSxTQUFTOzRCQUN4QixPQUFPLEVBQUUsTUFBTTt5QkFDaEI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCO29CQUNFLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxhQUFhLEVBQUUsU0FBUzs0QkFDeEIsT0FBTyxFQUFFLE1BQU07eUJBQ2hCO3dCQUNEOzRCQUNFLGFBQWEsRUFBRSxjQUFjOzRCQUM3QixPQUFPLEVBQUUsT0FBTzt5QkFDakI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxFQUNIO0lBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhcHR1cmUsIE1hdGNoLCBUZW1wbGF0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2Fzc2VydGlvbnMnXG5pbXBvcnQgeyBBcHAsIFN0YWNrIH0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmltcG9ydCB7IENMUVNEYXRhTGluZWFnZVN0YWNrIH0gZnJvbSAnLi4vLi4vbGliL3N0YWNrcy9zdGFjay1kYXRhLWxpbmVhZ2UvY2FyYm9ubGFrZS1kYXRhLWxpbmVhZ2Utc3RhY2snXG5cbmRlc2NyaWJlKCd0ZXN0IGRhdGEgbGluZWFnZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwKClcblxuICAgIC8vIERhdGEgbGluZWFnZSBzdGFjayByZXF1aXJlcyBhbiBhcmNoaXZlIGJ1Y2tldCBhcyBlbnRyeSBwcm9wIGNyZWF0ZWRcbiAgICAvLyBieSB0aGUgc2hhcmVkIHJlc291cmNlcyBzdGFja1xuICAgIGNvbnN0IHNoYXJlZFJlc291cmNlc1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ1NoYXJlZFJlc291cmNlc1N0YWNrJylcbiAgICBjb25zdCBhcmNoaXZlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldChzaGFyZWRSZXNvdXJjZXNTdGFjaywgJ0FyY2hpdmVCdWNrZXQnLCB7fSlcblxuICAgIGNvbnN0IGRhdGFMaW5lYWdlU3RhY2sgPSBuZXcgQ0xRU0RhdGFMaW5lYWdlU3RhY2soYXBwLCAnRGF0YUxpbmVhZ2VTdGFjaycsIHtcbiAgICAgIGFyY2hpdmVCdWNrZXQ6IGFyY2hpdmVCdWNrZXQsXG4gICAgfSlcblxuICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKGRhdGFMaW5lYWdlU3RhY2spXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0ZW1wbGF0ZSA9IG51bGxcbiAgfSlcblxuICB0ZXN0KCdzeW50aGVzaXNlcyBhcyBleHBlY3RlZCcsICgpID0+IHtcbiAgICAvLyB0d28gcXVldWVzIGV4aXN0XG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpTUVM6OlF1ZXVlJywgMilcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgY3JlYXRpb25cbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAzKVxuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIHtcbiAgICAgIEhhbmRsZXI6ICdhcHAubGFtYmRhX2hhbmRsZXInLFxuICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lLFxuICAgIH0pXG5cbiAgICAvLyB2ZXJpZnkgbGFtYmRhIHN1YnNjcmlwdGlvbiB0byBhd3NcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OkxhbWJkYTo6RXZlbnRTb3VyY2VNYXBwaW5nJywgMilcblxuICAgIC8vIHZlcmlmeSBpYW0gcm9sZSAmIHBvbGljeSBjcmVhdGlvbiBmb3IgYWxsIGxhbWJkYXNcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6Um9sZScsIDMpXG4gICAgdGVtcGxhdGU/LnJlc291cmNlQ291bnRJcygnQVdTOjpJQU06OlBvbGljeScsIDMpXG5cbiAgICAvLyBkZGIgY3JlYXRlZCB3aXRoIHBrPXJvb3RfaWQgYW5kIHNrPW5vZGVfaWRcbiAgICAvLyBoYXMgYSBnc2kgZm9yIHF1ZXJ5aW5nIG5vZGVfaWRcbiAgICAvLyBoYXMgYW4gbHNpIGZvciBxdWVyeWluZyBhY3Rpb25fdGFrZW5cbiAgICAvLyBhbGwgYXR0cmlidXRlcyBhcmUgcHJvamVjdGVkIG9uIGluZGV4ZXNcbiAgICB0ZW1wbGF0ZT8uaGFzUmVzb3VyY2VQcm9wZXJ0aWVzKFxuICAgICAgJ0FXUzo6RHluYW1vREI6OlRhYmxlJyxcbiAgICAgIE1hdGNoLm9iamVjdExpa2Uoe1xuICAgICAgICBLZXlTY2hlbWE6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiAncm9vdF9pZCcsXG4gICAgICAgICAgICBLZXlUeXBlOiAnSEFTSCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiAnbm9kZV9pZCcsXG4gICAgICAgICAgICBLZXlUeXBlOiAnUkFOR0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIEdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBLZXlTY2hlbWE6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdub2RlX2lkJyxcbiAgICAgICAgICAgICAgICBLZXlUeXBlOiAnSEFTSCcsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgUHJvamVjdGlvbjoge1xuICAgICAgICAgICAgICBQcm9qZWN0aW9uVHlwZTogJ0FMTCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIExvY2FsU2Vjb25kYXJ5SW5kZXhlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogJ3Jvb3RfaWQnLFxuICAgICAgICAgICAgICAgIEtleVR5cGU6ICdIQVNIJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdhY3Rpb25fdGFrZW4nLFxuICAgICAgICAgICAgICAgIEtleVR5cGU6ICdSQU5HRScsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgUHJvamVjdGlvbjoge1xuICAgICAgICAgICAgICBQcm9qZWN0aW9uVHlwZTogJ0FMTCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgIClcbiAgfSlcbn0pXG4iXX0=