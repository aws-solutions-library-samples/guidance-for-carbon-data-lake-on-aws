"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const stack_data_lineage_1 = require("../../lib/stacks/stack-data-lineage/stack-data-lineage");
describe('test data lineage stack', () => {
    let template;
    beforeEach(() => {
        const app = new aws_cdk_lib_1.App();
        // Data lineage stack requires an archive bucket as entry prop created
        // by the shared resources stack
        const sharedResourcesStack = new aws_cdk_lib_1.Stack(app, 'SharedResourcesStack');
        const archiveBucket = new aws_cdk_lib_2.aws_s3.Bucket(sharedResourcesStack, 'ArchiveBucket', {});
        const dataLineageStack = new stack_data_lineage_1.DataLineageStack(app, 'DataLineageStack', {
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
        template === null || template === void 0 ? void 0 : template.resourceCountIs('AWS::IAM::Role', 4);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1saW5lYWdlLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLWxpbmVhZ2Utc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFpRTtBQUNqRSw2Q0FBd0M7QUFDeEMsNkNBQTBDO0FBQzFDLDZDQUFrRDtBQUNsRCwrRkFBeUY7QUFFekYsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUE7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFBO1FBRXJCLHNFQUFzRTtRQUN0RSxnQ0FBZ0M7UUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUE7UUFDbkUsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFOUUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHFDQUFnQixDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUNyRSxhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUE7UUFFRixRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNqRCxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixRQUFRLEdBQUcsSUFBSSxDQUFBO0lBQ2pCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxtQkFBbUI7UUFDbkIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUUvQyx5QkFBeUI7UUFDekIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNyRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUscUJBQXFCLENBQUMsdUJBQXVCLEVBQUU7WUFDdkQsT0FBTyxFQUFFLG9CQUFvQjtZQUM3QixPQUFPLEVBQUUsd0JBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7U0FDeEMsQ0FBQyxDQUFBO1FBRUYsb0NBQW9DO1FBQ3BDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFL0Qsb0RBQW9EO1FBQ3BELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDOUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUVoRCw2Q0FBNkM7UUFDN0MsaUNBQWlDO1FBQ2pDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFDMUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUM3QixzQkFBc0IsRUFDdEIsa0JBQUssQ0FBQyxVQUFVLENBQUM7WUFDZixTQUFTLEVBQUU7Z0JBQ1Q7b0JBQ0UsYUFBYSxFQUFFLFNBQVM7b0JBQ3hCLE9BQU8sRUFBRSxNQUFNO2lCQUNoQjtnQkFDRDtvQkFDRSxhQUFhLEVBQUUsU0FBUztvQkFDeEIsT0FBTyxFQUFFLE9BQU87aUJBQ2pCO2FBQ0Y7WUFDRCxzQkFBc0IsRUFBRTtnQkFDdEI7b0JBQ0UsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGFBQWEsRUFBRSxTQUFTOzRCQUN4QixPQUFPLEVBQUUsTUFBTTt5QkFDaEI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1lBQ0QscUJBQXFCLEVBQUU7Z0JBQ3JCO29CQUNFLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxhQUFhLEVBQUUsU0FBUzs0QkFDeEIsT0FBTyxFQUFFLE1BQU07eUJBQ2hCO3dCQUNEOzRCQUNFLGFBQWEsRUFBRSxjQUFjOzRCQUM3QixPQUFPLEVBQUUsT0FBTzt5QkFDakI7cUJBQ0Y7b0JBQ0QsVUFBVSxFQUFFO3dCQUNWLGNBQWMsRUFBRSxLQUFLO3FCQUN0QjtpQkFDRjthQUNGO1NBQ0YsQ0FBQyxDQUNILENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2FwdHVyZSwgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSAnYXdzLWNkay1saWIvYXNzZXJ0aW9ucydcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IERhdGFMaW5lYWdlU3RhY2sgfSBmcm9tICcuLi8uLi9saWIvc3RhY2tzL3N0YWNrLWRhdGEtbGluZWFnZS9zdGFjay1kYXRhLWxpbmVhZ2UnXG5cbmRlc2NyaWJlKCd0ZXN0IGRhdGEgbGluZWFnZSBzdGFjaycsICgpID0+IHtcbiAgbGV0IHRlbXBsYXRlOiBUZW1wbGF0ZSB8IG51bGxcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwKClcblxuICAgIC8vIERhdGEgbGluZWFnZSBzdGFjayByZXF1aXJlcyBhbiBhcmNoaXZlIGJ1Y2tldCBhcyBlbnRyeSBwcm9wIGNyZWF0ZWRcbiAgICAvLyBieSB0aGUgc2hhcmVkIHJlc291cmNlcyBzdGFja1xuICAgIGNvbnN0IHNoYXJlZFJlc291cmNlc1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ1NoYXJlZFJlc291cmNlc1N0YWNrJylcbiAgICBjb25zdCBhcmNoaXZlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldChzaGFyZWRSZXNvdXJjZXNTdGFjaywgJ0FyY2hpdmVCdWNrZXQnLCB7fSlcblxuICAgIGNvbnN0IGRhdGFMaW5lYWdlU3RhY2sgPSBuZXcgRGF0YUxpbmVhZ2VTdGFjayhhcHAsICdEYXRhTGluZWFnZVN0YWNrJywge1xuICAgICAgYXJjaGl2ZUJ1Y2tldDogYXJjaGl2ZUJ1Y2tldCxcbiAgICB9KVxuXG4gICAgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soZGF0YUxpbmVhZ2VTdGFjaylcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIHRlbXBsYXRlID0gbnVsbFxuICB9KVxuXG4gIHRlc3QoJ3N5bnRoZXNpc2VzIGFzIGV4cGVjdGVkJywgKCkgPT4ge1xuICAgIC8vIHR3byBxdWV1ZXMgZXhpc3RcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OlNRUzo6UXVldWUnLCAyKVxuXG4gICAgLy8gdmVyaWZ5IGxhbWJkYSBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsIDMpXG4gICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywge1xuICAgICAgSGFuZGxlcjogJ2FwcC5sYW1iZGFfaGFuZGxlcicsXG4gICAgICBSdW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185Lm5hbWUsXG4gICAgfSlcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgc3Vic2NyaXB0aW9uIHRvIGF3c1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6TGFtYmRhOjpFdmVudFNvdXJjZU1hcHBpbmcnLCAyKVxuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhc1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoJ0FXUzo6SUFNOjpSb2xlJywgNClcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKCdBV1M6OklBTTo6UG9saWN5JywgMylcblxuICAgIC8vIGRkYiBjcmVhdGVkIHdpdGggcGs9cm9vdF9pZCBhbmQgc2s9bm9kZV9pZFxuICAgIC8vIGhhcyBhIGdzaSBmb3IgcXVlcnlpbmcgbm9kZV9pZFxuICAgIC8vIGhhcyBhbiBsc2kgZm9yIHF1ZXJ5aW5nIGFjdGlvbl90YWtlblxuICAgIC8vIGFsbCBhdHRyaWJ1dGVzIGFyZSBwcm9qZWN0ZWQgb24gaW5kZXhlc1xuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoXG4gICAgICAnQVdTOjpEeW5hbW9EQjo6VGFibGUnLFxuICAgICAgTWF0Y2gub2JqZWN0TGlrZSh7XG4gICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdyb290X2lkJyxcbiAgICAgICAgICAgIEtleVR5cGU6ICdIQVNIJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6ICdub2RlX2lkJyxcbiAgICAgICAgICAgIEtleVR5cGU6ICdSQU5HRScsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgR2xvYmFsU2Vjb25kYXJ5SW5kZXhlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogJ25vZGVfaWQnLFxuICAgICAgICAgICAgICAgIEtleVR5cGU6ICdIQVNIJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9qZWN0aW9uOiB7XG4gICAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiAnQUxMJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgTG9jYWxTZWNvbmRhcnlJbmRleGVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgS2V5U2NoZW1hOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiAncm9vdF9pZCcsXG4gICAgICAgICAgICAgICAgS2V5VHlwZTogJ0hBU0gnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQXR0cmlidXRlTmFtZTogJ2FjdGlvbl90YWtlbicsXG4gICAgICAgICAgICAgICAgS2V5VHlwZTogJ1JBTkdFJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9qZWN0aW9uOiB7XG4gICAgICAgICAgICAgIFByb2plY3Rpb25UeXBlOiAnQUxMJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgKVxuICB9KVxufSlcbiJdfQ==