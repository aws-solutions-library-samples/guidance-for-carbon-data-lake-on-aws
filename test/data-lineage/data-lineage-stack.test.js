"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertions_1 = require("aws-cdk-lib/assertions");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const carbonlake_data_lineage_stack_1 = require("../../lib/data-lineage/carbonlake-data-lineage-stack");
describe("test data lineage stack", () => {
    let template;
    beforeEach(() => {
        const app = new aws_cdk_lib_1.App();
        // Data lineage stack requires an archive bucket as entry prop created
        // by the shared resources stack
        const sharedResourcesStack = new aws_cdk_lib_1.Stack(app, "SharedResourcesStack");
        const archiveBucket = new aws_cdk_lib_2.aws_s3.Bucket(sharedResourcesStack, "ArchiveBucket", {});
        const dataLineageStack = new carbonlake_data_lineage_stack_1.CarbonlakeQuickstartDataLineageStack(app, "DataLineageStack", {
            archiveBucket: archiveBucket
        });
        template = assertions_1.Template.fromStack(dataLineageStack);
    });
    afterEach(() => { template = null; });
    test("synthesises as expected", () => {
        // two queues exist
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::SQS::Queue", 2);
        // verify lambda creation
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::Lambda::Function", 3);
        template === null || template === void 0 ? void 0 : template.hasResourceProperties("AWS::Lambda::Function", {
            Handler: "app.lambda_handler",
            Runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9.name
        });
        // verify lambda subscription to aws
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::Lambda::EventSourceMapping", 2);
        // verify iam role & policy creation for all lambdas
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Role", 3);
        template === null || template === void 0 ? void 0 : template.resourceCountIs("AWS::IAM::Policy", 3);
        // ddb created with pk=root_id and sk=node_id
        // has a gsi for querying node_id
        // has an lsi for querying action_taken
        // all attributes are projected on indexes
        template === null || template === void 0 ? void 0 : template.hasResourceProperties("AWS::DynamoDB::Table", assertions_1.Match.objectLike({
            KeySchema: [
                {
                    AttributeName: "root_id",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "node_id",
                    KeyType: "RANGE"
                }
            ],
            GlobalSecondaryIndexes: [
                {
                    KeySchema: [
                        {
                            AttributeName: "node_id",
                            KeyType: "HASH"
                        }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    }
                }
            ],
            LocalSecondaryIndexes: [
                {
                    KeySchema: [
                        {
                            AttributeName: "root_id",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "action_taken",
                            KeyType: "RANGE"
                        }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    }
                }
            ]
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1saW5lYWdlLXN0YWNrLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYXRhLWxpbmVhZ2Utc3RhY2sudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFrRTtBQUNsRSw2Q0FBeUM7QUFDekMsNkNBQTJDO0FBQzNDLDZDQUFtRDtBQUVuRCx3R0FBNEc7QUFFNUcsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQXlCLENBQUM7SUFFOUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO1FBRXRCLHNFQUFzRTtRQUN0RSxnQ0FBZ0M7UUFDaEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1CQUFLLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDcEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxvQkFBRSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0UsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9FQUFvQyxDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtZQUN6RixhQUFhLEVBQUUsYUFBYTtTQUM3QixDQUFDLENBQUM7UUFFSCxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUVuQyxtQkFBbUI7UUFDbkIsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLGVBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUU7UUFFaEQseUJBQXlCO1FBQ3pCLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFO1FBQ3RELFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxxQkFBcUIsQ0FBQyx1QkFBdUIsRUFBRTtZQUN2RCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtTQUN4QyxFQUFDO1FBRUYsb0NBQW9DO1FBQ3BDLFFBQVEsYUFBUixRQUFRLHVCQUFSLFFBQVEsQ0FBRSxlQUFlLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxFQUFFO1FBRWhFLG9EQUFvRDtRQUNwRCxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRTtRQUMvQyxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsZUFBZSxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRTtRQUVqRCw2Q0FBNkM7UUFDN0MsaUNBQWlDO1FBQ2pDLHVDQUF1QztRQUN2QywwQ0FBMEM7UUFDMUMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLHFCQUFxQixDQUFDLHNCQUFzQixFQUFFLGtCQUFLLENBQUMsVUFBVSxDQUFDO1lBQ3ZFLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxhQUFhLEVBQUUsU0FBUztvQkFDeEIsT0FBTyxFQUFFLE1BQU07aUJBQ2hCO2dCQUNEO29CQUNFLGFBQWEsRUFBRSxTQUFTO29CQUN4QixPQUFPLEVBQUUsT0FBTztpQkFDakI7YUFDRjtZQUNELHNCQUFzQixFQUFFO2dCQUN0QjtvQkFDRSxTQUFTLEVBQUU7d0JBQ1Q7NEJBQ0UsYUFBYSxFQUFFLFNBQVM7NEJBQ3hCLE9BQU8sRUFBRSxNQUFNO3lCQUNoQjtxQkFDRjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsY0FBYyxFQUFFLEtBQUs7cUJBQ3RCO2lCQUNGO2FBQ0Y7WUFDRCxxQkFBcUIsRUFBRTtnQkFDckI7b0JBQ0UsU0FBUyxFQUFFO3dCQUNUOzRCQUNFLGFBQWEsRUFBRSxTQUFTOzRCQUN4QixPQUFPLEVBQUUsTUFBTTt5QkFDaEI7d0JBQ0Q7NEJBQ0UsYUFBYSxFQUFFLGNBQWM7NEJBQzdCLE9BQU8sRUFBRSxPQUFPO3lCQUNqQjtxQkFDRjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1YsY0FBYyxFQUFFLEtBQUs7cUJBQ3RCO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLEVBQUU7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2FwdHVyZSwgTWF0Y2gsIFRlbXBsYXRlIH0gZnJvbSBcImF3cy1jZGstbGliL2Fzc2VydGlvbnNcIjtcbmltcG9ydCB7IEFwcCwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfczMgYXMgczMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcblxuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnREYXRhTGluZWFnZVN0YWNrIH0gZnJvbSBcIi4uLy4uL2xpYi9kYXRhLWxpbmVhZ2UvY2FyYm9ubGFrZS1kYXRhLWxpbmVhZ2Utc3RhY2tcIjtcblxuZGVzY3JpYmUoXCJ0ZXN0IGRhdGEgbGluZWFnZSBzdGFja1wiLCAoKSA9PiB7XG4gIGxldCB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBudWxsO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcblxuICAgIC8vIERhdGEgbGluZWFnZSBzdGFjayByZXF1aXJlcyBhbiBhcmNoaXZlIGJ1Y2tldCBhcyBlbnRyeSBwcm9wIGNyZWF0ZWRcbiAgICAvLyBieSB0aGUgc2hhcmVkIHJlc291cmNlcyBzdGFja1xuICAgIGNvbnN0IHNoYXJlZFJlc291cmNlc1N0YWNrID0gbmV3IFN0YWNrKGFwcCwgXCJTaGFyZWRSZXNvdXJjZXNTdGFja1wiKTtcbiAgICBjb25zdCBhcmNoaXZlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldChzaGFyZWRSZXNvdXJjZXNTdGFjaywgXCJBcmNoaXZlQnVja2V0XCIsIHt9KTtcblxuICAgIGNvbnN0IGRhdGFMaW5lYWdlU3RhY2sgPSBuZXcgQ2FyYm9ubGFrZVF1aWNrc3RhcnREYXRhTGluZWFnZVN0YWNrKGFwcCwgXCJEYXRhTGluZWFnZVN0YWNrXCIsIHtcbiAgICAgIGFyY2hpdmVCdWNrZXQ6IGFyY2hpdmVCdWNrZXRcbiAgICB9KTtcblxuICAgIHRlbXBsYXRlID0gVGVtcGxhdGUuZnJvbVN0YWNrKGRhdGFMaW5lYWdlU3RhY2spO1xuICB9KTtcblxuICBhZnRlckVhY2goKCkgPT4geyB0ZW1wbGF0ZSA9IG51bGwgfSk7XG5cbiAgdGVzdChcInN5bnRoZXNpc2VzIGFzIGV4cGVjdGVkXCIsICgpID0+IHtcblxuICAgIC8vIHR3byBxdWV1ZXMgZXhpc3RcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpTUVM6OlF1ZXVlXCIsIDIpO1xuXG4gICAgLy8gdmVyaWZ5IGxhbWJkYSBjcmVhdGlvblxuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OkxhbWJkYTo6RnVuY3Rpb25cIiwgMyk7XG4gICAgdGVtcGxhdGU/Lmhhc1Jlc291cmNlUHJvcGVydGllcyhcIkFXUzo6TGFtYmRhOjpGdW5jdGlvblwiLCB7XG4gICAgICBIYW5kbGVyOiBcImFwcC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgUnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfOS5uYW1lXG4gICAgfSlcblxuICAgIC8vIHZlcmlmeSBsYW1iZGEgc3Vic2NyaXB0aW9uIHRvIGF3c1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OkxhbWJkYTo6RXZlbnRTb3VyY2VNYXBwaW5nXCIsIDIpO1xuXG4gICAgLy8gdmVyaWZ5IGlhbSByb2xlICYgcG9saWN5IGNyZWF0aW9uIGZvciBhbGwgbGFtYmRhc1xuICAgIHRlbXBsYXRlPy5yZXNvdXJjZUNvdW50SXMoXCJBV1M6OklBTTo6Um9sZVwiLCAzKTtcbiAgICB0ZW1wbGF0ZT8ucmVzb3VyY2VDb3VudElzKFwiQVdTOjpJQU06OlBvbGljeVwiLCAzKTtcblxuICAgIC8vIGRkYiBjcmVhdGVkIHdpdGggcGs9cm9vdF9pZCBhbmQgc2s9bm9kZV9pZFxuICAgIC8vIGhhcyBhIGdzaSBmb3IgcXVlcnlpbmcgbm9kZV9pZFxuICAgIC8vIGhhcyBhbiBsc2kgZm9yIHF1ZXJ5aW5nIGFjdGlvbl90YWtlblxuICAgIC8vIGFsbCBhdHRyaWJ1dGVzIGFyZSBwcm9qZWN0ZWQgb24gaW5kZXhlc1xuICAgIHRlbXBsYXRlPy5oYXNSZXNvdXJjZVByb3BlcnRpZXMoXCJBV1M6OkR5bmFtb0RCOjpUYWJsZVwiLCBNYXRjaC5vYmplY3RMaWtlKHtcbiAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICB7XG4gICAgICAgICAgQXR0cmlidXRlTmFtZTogXCJyb290X2lkXCIsXG4gICAgICAgICAgS2V5VHlwZTogXCJIQVNIXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6IFwibm9kZV9pZFwiLFxuICAgICAgICAgIEtleVR5cGU6IFwiUkFOR0VcIlxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgR2xvYmFsU2Vjb25kYXJ5SW5kZXhlczogW1xuICAgICAgICB7XG4gICAgICAgICAgS2V5U2NoZW1hOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6IFwibm9kZV9pZFwiLFxuICAgICAgICAgICAgICBLZXlUeXBlOiBcIkhBU0hcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgUHJvamVjdGlvbjoge1xuICAgICAgICAgICAgUHJvamVjdGlvblR5cGU6IFwiQUxMXCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBMb2NhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIEtleVNjaGVtYTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBBdHRyaWJ1dGVOYW1lOiBcInJvb3RfaWRcIixcbiAgICAgICAgICAgICAgS2V5VHlwZTogXCJIQVNIXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIEF0dHJpYnV0ZU5hbWU6IFwiYWN0aW9uX3Rha2VuXCIsXG4gICAgICAgICAgICAgIEtleVR5cGU6IFwiUkFOR0VcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0sXG4gICAgICAgICAgUHJvamVjdGlvbjoge1xuICAgICAgICAgICAgUHJvamVjdGlvblR5cGU6IFwiQUxMXCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KSk7XG4gIH0pO1xufSk7XG4iXX0=