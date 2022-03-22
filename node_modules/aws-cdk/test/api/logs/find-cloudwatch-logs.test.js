"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const find_cloudwatch_logs_1 = require("../../../lib/api/logs/find-cloudwatch-logs");
const util_1 = require("../../util");
const mock_sdk_1 = require("../../util/mock-sdk");
let logsMockSdkProvider;
let mockGetEndpointSuffix;
beforeEach(() => {
    logsMockSdkProvider = new LogsMockSdkProvider();
    mockGetEndpointSuffix = jest.fn(() => 'amazonaws.com');
    logsMockSdkProvider.stubGetEndpointSuffix(mockGetEndpointSuffix);
    // clear the array
    currentCfnStackResources.splice(0);
});
test('add log groups from lambda function', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        FunctionName: 'my-function',
                    },
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('Func', 'AWS::Lambda::Function', 'my-function'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['/aws/lambda/my-function']);
});
test('add log groups from lambda function without physical name', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('Func', 'AWS::Lambda::Function', 'my-function'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['/aws/lambda/my-function']);
});
test('empty template', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {},
    });
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual([]);
});
test('add log groups from ECS Task Definitions', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                LogGroup: {
                    Type: 'AWS::Logs::LogGroup',
                    Properties: {
                        LogGroupName: 'log_group',
                    },
                },
                Def: {
                    Type: 'AWS::ECS::TaskDefinition',
                    Properties: {
                        Family: 'app',
                        ContainerDefinitions: [
                            {
                                LogConfiguration: {
                                    LogDriver: 'awslogs',
                                    Options: {
                                        'awslogs-group': { Ref: 'LogGroup' },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('LogGroup', 'AWS::Logs::LogGroup', 'log_group'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['log_group']);
});
test('add log groups from State Machines', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                LogGroup: {
                    Type: 'AWS::Logs::LogGroup',
                    Properties: {
                        LogGroupName: 'log_group',
                    },
                },
                Def: {
                    Type: 'AWS::StepFunctions::StateMachine',
                    Properties: {
                        LoggingConfiguration: {
                            Destinations: [
                                {
                                    CloudWatchLogsLogGroup: {
                                        LogGroupArn: {
                                            'Fn::GetAtt': ['LogGroup', 'Arn'],
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('LogGroup', 'AWS::Logs::LogGroup', 'log_group'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['log_group']);
});
test('excluded log groups are not added', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                LogGroup: {
                    Type: 'AWS::Logs::LogGroup',
                    Properties: {
                        LogGroupName: 'log_group',
                    },
                },
                LogGroup2: {
                    Type: 'AWS::Logs::LogGroup',
                    Properties: {
                        LogGroupName: 'log_group2',
                    },
                },
                Def: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        PojectName: 'project',
                        LogsConfig: {
                            CloudWatchLogs: {
                                GroupName: { Ref: 'LogGroup' },
                            },
                        },
                    },
                },
                FlowLog: {
                    Type: 'AWS::EC2::FlowLog',
                    Properties: {
                        LogDestination: { Ref: 'LogGroup' },
                    },
                },
                FlowLog2: {
                    Type: 'AWS::EC2::FlowLog',
                    Properties: {
                        LogDestination: {
                            'Fn::GetAtt': ['LogGroup2', 'Arn'],
                        },
                    },
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('LogGroup', 'AWS::Logs::LogGroup', 'log_group'));
    pushStackResourceSummaries(stackSummaryOf('LogGroup2', 'AWS::Logs::LogGroup', 'log_group2'));
    pushStackResourceSummaries(stackSummaryOf('FlowLog', 'AWS::EC2::FlowLog', 'flow_log'));
    pushStackResourceSummaries(stackSummaryOf('FlowLog2', 'AWS::EC2::FlowLog', 'flow_log2'));
    pushStackResourceSummaries(stackSummaryOf('Def', 'AWS::CodeBuild:Project', 'project'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual([]);
});
test('unassociated log groups are added', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                LogGroup: {
                    Type: 'AWS::Logs::LogGroup',
                    Properties: {
                        LogGroupName: 'log_group',
                    },
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('LogGroup', 'AWS::Logs::LogGroup', 'log_group'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['log_group']);
});
test('log groups without physical names are added', async () => {
    // GIVEN
    const cdkStackArtifact = cdkStackArtifactOf({
        template: {
            Resources: {
                LogGroup: {
                    Type: 'AWS::Logs::LogGroup',
                },
            },
        },
    });
    pushStackResourceSummaries(stackSummaryOf('LogGroup', 'AWS::Logs::LogGroup', 'log_group'));
    // WHEN
    const result = await find_cloudwatch_logs_1.findCloudWatchLogGroups(logsMockSdkProvider.mockSdkProvider, cdkStackArtifact);
    // THEN
    expect(result.logGroupNames).toEqual(['log_group']);
});
const STACK_NAME = 'withouterrors';
const currentCfnStackResources = [];
function pushStackResourceSummaries(...items) {
    currentCfnStackResources.push(...items);
}
function stackSummaryOf(logicalId, resourceType, physicalResourceId) {
    return {
        LogicalResourceId: logicalId,
        PhysicalResourceId: physicalResourceId,
        ResourceType: resourceType,
        ResourceStatus: 'CREATE_COMPLETE',
        LastUpdatedTimestamp: new Date(),
    };
}
function cdkStackArtifactOf(testStackArtifact = {}) {
    return util_1.testStack({
        stackName: STACK_NAME,
        ...testStackArtifact,
    });
}
class LogsMockSdkProvider {
    constructor() {
        this.mockSdkProvider = new mock_sdk_1.MockSdkProvider({ realSdk: false });
        this.mockSdkProvider.stubCloudFormation({
            listStackResources: ({ StackName: stackName }) => {
                if (stackName !== STACK_NAME) {
                    throw new Error(`Expected Stack name in listStackResources() call to be: '${STACK_NAME}', but received: ${stackName}'`);
                }
                return {
                    StackResourceSummaries: currentCfnStackResources,
                };
            },
        });
    }
    stubGetEndpointSuffix(stub) {
        this.mockSdkProvider.stubGetEndpointSuffix(stub);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1jbG91ZHdhdGNoLWxvZ3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpbmQtY2xvdWR3YXRjaC1sb2dzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxxRkFBcUY7QUFDckYscUNBQTBEO0FBQzFELGtEQUFzRDtBQUV0RCxJQUFJLG1CQUF3QyxDQUFDO0FBQzdDLElBQUkscUJBQW1DLENBQUM7QUFFeEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLG1CQUFtQixHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztJQUNoRCxxQkFBcUIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3ZELG1CQUFtQixDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDakUsa0JBQWtCO0lBQ2xCLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNyRCxRQUFRO0lBQ1IsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQztRQUMxQyxRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixZQUFZLEVBQUUsYUFBYTtxQkFDNUI7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsMEJBQTBCLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBRTNGLE9BQU87SUFDUCxNQUFNLE1BQU0sR0FBRyxNQUFNLDhDQUF1QixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXBHLE9BQU87SUFDUCxNQUFNLENBQUMsTUFBTSxDQUFD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Q0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY3hhcGkgZnJvbSAnQGF3cy1jZGsvY3gtYXBpJztcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBmaW5kQ2xvdWRXYXRjaExvZ0dyb3VwcyB9IGZyb20gJy4uLy4uLy4uL2xpYi9hcGkvbG9ncy9maW5kLWNsb3Vkd2F0Y2gtbG9ncyc7XG5pbXBvcnQgeyB0ZXN0U3RhY2ssIFRlc3RTdGFja0FydGlmYWN0IH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgeyBNb2NrU2RrUHJvdmlkZXIgfSBmcm9tICcuLi8uLi91dGlsL21vY2stc2RrJztcblxubGV0IGxvZ3NNb2NrU2RrUHJvdmlkZXI6IExvZ3NNb2NrU2RrUHJvdmlkZXI7XG5sZXQgbW9ja0dldEVuZHBvaW50U3VmZml4OiAoKSA9PiBzdHJpbmc7XG5cbmJlZm9yZUVhY2goKCkgPT4ge1xuICBsb2dzTW9ja1Nka1Byb3ZpZGVyID0gbmV3IExvZ3NNb2NrU2RrUHJvdmlkZXIoKTtcbiAgbW9ja0dldEVuZHBvaW50U3VmZml4ID0gamVzdC5mbigoKSA9PiAnYW1hem9uYXdzLmNvbScpO1xuICBsb2dzTW9ja1Nka1Byb3ZpZGVyLnN0dWJHZXRFbmRwb2ludFN1ZmZpeChtb2NrR2V0RW5kcG9pbnRTdWZmaXgpO1xuICAvLyBjbGVhciB0aGUgYXJyYXlcbiAgY3VycmVudENmblN0YWNrUmVzb3VyY2VzLnNwbGljZSgwKTtcbn0pO1xuXG50ZXN0KCdhZGQgbG9nIGdyb3VwcyBmcm9tIGxhbWJkYSBmdW5jdGlvbicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IGNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBwdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzdGFja1N1bW1hcnlPZignRnVuYycsICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAnbXktZnVuY3Rpb24nKSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaW5kQ2xvdWRXYXRjaExvZ0dyb3Vwcyhsb2dzTW9ja1Nka1Byb3ZpZGVyLm1vY2tTZGtQcm92aWRlciwgY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QocmVzdWx0LmxvZ0dyb3VwTmFtZXMpLnRvRXF1YWwoWycvYXdzL2xhbWJkYS9teS1mdW5jdGlvbiddKTtcbn0pO1xuXG50ZXN0KCdhZGQgbG9nIGdyb3VwcyBmcm9tIGxhbWJkYSBmdW5jdGlvbiB3aXRob3V0IHBoeXNpY2FsIG5hbWUnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBjZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgcHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoc3RhY2tTdW1tYXJ5T2YoJ0Z1bmMnLCAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgJ215LWZ1bmN0aW9uJykpO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZENsb3VkV2F0Y2hMb2dHcm91cHMobG9nc01vY2tTZGtQcm92aWRlci5tb2NrU2RrUHJvdmlkZXIsIGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KHJlc3VsdC5sb2dHcm91cE5hbWVzKS50b0VxdWFsKFsnL2F3cy9sYW1iZGEvbXktZnVuY3Rpb24nXSk7XG59KTtcblxudGVzdCgnZW1wdHkgdGVtcGxhdGUnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBjZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7fSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaW5kQ2xvdWRXYXRjaExvZ0dyb3Vwcyhsb2dzTW9ja1Nka1Byb3ZpZGVyLm1vY2tTZGtQcm92aWRlciwgY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QocmVzdWx0LmxvZ0dyb3VwTmFtZXMpLnRvRXF1YWwoW10pO1xufSk7XG5cbnRlc3QoJ2FkZCBsb2cgZ3JvdXBzIGZyb20gRUNTIFRhc2sgRGVmaW5pdGlvbnMnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBjZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgTG9nR3JvdXA6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMb2dzOjpMb2dHcm91cCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgTG9nR3JvdXBOYW1lOiAnbG9nX2dyb3VwJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBEZWY6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpFQ1M6OlRhc2tEZWZpbml0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBGYW1pbHk6ICdhcHAnLFxuICAgICAgICAgICAgQ29udGFpbmVyRGVmaW5pdGlvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIExvZ0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgIExvZ0RyaXZlcjogJ2F3c2xvZ3MnLFxuICAgICAgICAgICAgICAgICAgT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAnYXdzbG9ncy1ncm91cCc6IHsgUmVmOiAnTG9nR3JvdXAnIH0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBwdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzdGFja1N1bW1hcnlPZignTG9nR3JvdXAnLCAnQVdTOjpMb2dzOjpMb2dHcm91cCcsICdsb2dfZ3JvdXAnKSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBmaW5kQ2xvdWRXYXRjaExvZ0dyb3Vwcyhsb2dzTW9ja1Nka1Byb3ZpZGVyLm1vY2tTZGtQcm92aWRlciwgY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QocmVzdWx0LmxvZ0dyb3VwTmFtZXMpLnRvRXF1YWwoWydsb2dfZ3JvdXAnXSk7XG59KTtcblxudGVzdCgnYWRkIGxvZyBncm91cHMgZnJvbSBTdGF0ZSBNYWNoaW5lcycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IGNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBMb2dHcm91cDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxvZ3M6OkxvZ0dyb3VwJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBMb2dHcm91cE5hbWU6ICdsb2dfZ3JvdXAnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIERlZjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OlN0ZXBGdW5jdGlvbnM6OlN0YXRlTWFjaGluZScsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgTG9nZ2luZ0NvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgRGVzdGluYXRpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgQ2xvdWRXYXRjaExvZ3NMb2dHcm91cDoge1xuICAgICAgICAgICAgICAgICAgICBMb2dHcm91cEFybjoge1xuICAgICAgICAgICAgICAgICAgICAgICdGbjo6R2V0QXR0JzogWydMb2dHcm91cCcsICdBcm4nXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIHB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHN0YWNrU3VtbWFyeU9mKCdMb2dHcm91cCcsICdBV1M6OkxvZ3M6OkxvZ0dyb3VwJywgJ2xvZ19ncm91cCcpKTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRDbG91ZFdhdGNoTG9nR3JvdXBzKGxvZ3NNb2NrU2RrUHJvdmlkZXIubW9ja1Nka1Byb3ZpZGVyLCBjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChyZXN1bHQubG9nR3JvdXBOYW1lcykudG9FcXVhbChbJ2xvZ19ncm91cCddKTtcbn0pO1xuXG50ZXN0KCdleGNsdWRlZCBsb2cgZ3JvdXBzIGFyZSBub3QgYWRkZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBjZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgTG9nR3JvdXA6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMb2dzOjpMb2dHcm91cCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgTG9nR3JvdXBOYW1lOiAnbG9nX2dyb3VwJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBMb2dHcm91cDI6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMb2dzOjpMb2dHcm91cCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgTG9nR3JvdXBOYW1lOiAnbG9nX2dyb3VwMicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRGVmOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBQb2plY3ROYW1lOiAncHJvamVjdCcsXG4gICAgICAgICAgICBMb2dzQ29uZmlnOiB7XG4gICAgICAgICAgICAgIENsb3VkV2F0Y2hMb2dzOiB7XG4gICAgICAgICAgICAgICAgR3JvdXBOYW1lOiB7IFJlZjogJ0xvZ0dyb3VwJyB9LFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBGbG93TG9nOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6RUMyOjpGbG93TG9nJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBMb2dEZXN0aW5hdGlvbjogeyBSZWY6ICdMb2dHcm91cCcgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBGbG93TG9nMjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkVDMjo6Rmxvd0xvZycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgTG9nRGVzdGluYXRpb246IHtcbiAgICAgICAgICAgICAgJ0ZuOjpHZXRBdHQnOiBbJ0xvZ0dyb3VwMicsICdBcm4nXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIHB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHN0YWNrU3VtbWFyeU9mKCdMb2dHcm91cCcsICdBV1M6OkxvZ3M6OkxvZ0dyb3VwJywgJ2xvZ19ncm91cCcpKTtcbiAgcHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoc3RhY2tTdW1tYXJ5T2YoJ0xvZ0dyb3VwMicsICdBV1M6OkxvZ3M6OkxvZ0dyb3VwJywgJ2xvZ19ncm91cDInKSk7XG4gIHB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHN0YWNrU3VtbWFyeU9mKCdGbG93TG9nJywgJ0FXUzo6RUMyOjpGbG93TG9nJywgJ2Zsb3dfbG9nJykpO1xuICBwdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzdGFja1N1bW1hcnlPZignRmxvd0xvZzInLCAnQVdTOjpFQzI6OkZsb3dMb2cnLCAnZmxvd19sb2cyJykpO1xuICBwdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzdGFja1N1bW1hcnlPZignRGVmJywgJ0FXUzo6Q29kZUJ1aWxkOlByb2plY3QnLCAncHJvamVjdCcpKTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRDbG91ZFdhdGNoTG9nR3JvdXBzKGxvZ3NNb2NrU2RrUHJvdmlkZXIubW9ja1Nka1Byb3ZpZGVyLCBjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChyZXN1bHQubG9nR3JvdXBOYW1lcykudG9FcXVhbChbXSk7XG59KTtcblxudGVzdCgndW5hc3NvY2lhdGVkIGxvZyBncm91cHMgYXJlIGFkZGVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIExvZ0dyb3VwOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TG9nczo6TG9nR3JvdXAnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIExvZ0dyb3VwTmFtZTogJ2xvZ19ncm91cCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIHB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHN0YWNrU3VtbWFyeU9mKCdMb2dHcm91cCcsICdBV1M6OkxvZ3M6OkxvZ0dyb3VwJywgJ2xvZ19ncm91cCcpKTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZpbmRDbG91ZFdhdGNoTG9nR3JvdXBzKGxvZ3NNb2NrU2RrUHJvdmlkZXIubW9ja1Nka1Byb3ZpZGVyLCBjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChyZXN1bHQubG9nR3JvdXBOYW1lcykudG9FcXVhbChbJ2xvZ19ncm91cCddKTtcbn0pO1xuXG50ZXN0KCdsb2cgZ3JvdXBzIHdpdGhvdXQgcGh5c2ljYWwgbmFtZXMgYXJlIGFkZGVkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIExvZ0dyb3VwOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TG9nczo6TG9nR3JvdXAnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgcHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoc3RhY2tTdW1tYXJ5T2YoJ0xvZ0dyb3VwJywgJ0FXUzo6TG9nczo6TG9nR3JvdXAnLCAnbG9nX2dyb3VwJykpO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZENsb3VkV2F0Y2hMb2dHcm91cHMobG9nc01vY2tTZGtQcm92aWRlci5tb2NrU2RrUHJvdmlkZXIsIGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KHJlc3VsdC5sb2dHcm91cE5hbWVzKS50b0VxdWFsKFsnbG9nX2dyb3VwJ10pO1xufSk7XG5cbmNvbnN0IFNUQUNLX05BTUUgPSAnd2l0aG91dGVycm9ycyc7XG5jb25zdCBjdXJyZW50Q2ZuU3RhY2tSZXNvdXJjZXM6IENsb3VkRm9ybWF0aW9uLlN0YWNrUmVzb3VyY2VTdW1tYXJ5W10gPSBbXTtcblxuZnVuY3Rpb24gcHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoLi4uaXRlbXM6IENsb3VkRm9ybWF0aW9uLlN0YWNrUmVzb3VyY2VTdW1tYXJ5W10pIHtcbiAgY3VycmVudENmblN0YWNrUmVzb3VyY2VzLnB1c2goLi4uaXRlbXMpO1xufVxuXG5mdW5jdGlvbiBzdGFja1N1bW1hcnlPZihsb2dpY2FsSWQ6IHN0cmluZywgcmVzb3VyY2VUeXBlOiBzdHJpbmcsIHBoeXNpY2FsUmVzb3VyY2VJZDogc3RyaW5nKTogQ2xvdWRGb3JtYXRpb24uU3RhY2tSZXNvdXJjZVN1bW1hcnkge1xuICByZXR1cm4ge1xuICAgIExvZ2ljYWxSZXNvdXJjZUlkOiBsb2dpY2FsSWQsXG4gICAgUGh5c2ljYWxSZXNvdXJjZUlkOiBwaHlzaWNhbFJlc291cmNlSWQsXG4gICAgUmVzb3VyY2VUeXBlOiByZXNvdXJjZVR5cGUsXG4gICAgUmVzb3VyY2VTdGF0dXM6ICdDUkVBVEVfQ09NUExFVEUnLFxuICAgIExhc3RVcGRhdGVkVGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjZGtTdGFja0FydGlmYWN0T2YodGVzdFN0YWNrQXJ0aWZhY3Q6IFBhcnRpYWw8VGVzdFN0YWNrQXJ0aWZhY3Q+ID0ge30pOiBjeGFwaS5DbG91ZEZvcm1hdGlvblN0YWNrQXJ0aWZhY3Qge1xuICByZXR1cm4gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6IFNUQUNLX05BTUUsXG4gICAgLi4udGVzdFN0YWNrQXJ0aWZhY3QsXG4gIH0pO1xufVxuXG5jbGFzcyBMb2dzTW9ja1Nka1Byb3ZpZGVyIHtcbiAgcHVibGljIHJlYWRvbmx5IG1vY2tTZGtQcm92aWRlcjogTW9ja1Nka1Byb3ZpZGVyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubW9ja1Nka1Byb3ZpZGVyID0gbmV3IE1vY2tTZGtQcm92aWRlcih7IHJlYWxTZGs6IGZhbHNlIH0pO1xuXG4gICAgdGhpcy5tb2NrU2RrUHJvdmlkZXIuc3R1YkNsb3VkRm9ybWF0aW9uKHtcbiAgICAgIGxpc3RTdGFja1Jlc291cmNlczogKHsgU3RhY2tOYW1lOiBzdGFja05hbWUgfSkgPT4ge1xuICAgICAgICBpZiAoc3RhY2tOYW1lICE9PSBTVEFDS19OQU1FKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBTdGFjayBuYW1lIGluIGxpc3RTdGFja1Jlc291cmNlcygpIGNhbGwgdG8gYmU6ICcke1NUQUNLX05BTUV9JywgYnV0IHJlY2VpdmVkOiAke3N0YWNrTmFtZX0nYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBTdGFja1Jlc291cmNlU3VtbWFyaWVzOiBjdXJyZW50Q2ZuU3RhY2tSZXNvdXJjZXMsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHN0dWJHZXRFbmRwb2ludFN1ZmZpeChzdHViOiAoKSA9PiBzdHJpbmcpIHtcbiAgICB0aGlzLm1vY2tTZGtQcm92aWRlci5zdHViR2V0RW5kcG9pbnRTdWZmaXgoc3R1Yik7XG4gIH1cbn1cbiJdfQ==