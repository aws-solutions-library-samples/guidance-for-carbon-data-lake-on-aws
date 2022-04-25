"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let hotswapMockSdkProvider;
let mockUpdateResolver;
let mockUpdateFunction;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateResolver = jest.fn();
    mockUpdateFunction = jest.fn();
    hotswapMockSdkProvider.stubAppSync({ updateResolver: mockUpdateResolver, updateFunction: mockUpdateFunction });
});
test('returns undefined when a new Resolver is added to the Stack', async () => {
    // GIVEN
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncResolver: {
                    Type: 'AWS::AppSync::Resolver',
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
});
test('calls the updateResolver() API when it receives only a mapping template difference in a Unit Resolver', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncResolver: {
                Type: 'AWS::AppSync::Resolver',
                Properties: {
                    ApiId: 'apiId',
                    FieldName: 'myField',
                    TypeName: 'Query',
                    DataSourceName: 'my-datasource',
                    Kind: 'UNIT',
                    RequestMappingTemplate: '## original request template',
                    ResponseMappingTemplate: '## original response template',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('AppSyncResolver', 'AWS::AppSync::Resolver', 'arn:aws:appsync:us-east-1:111111111111:apis/apiId/types/Query/resolvers/myField'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncResolver: {
                    Type: 'AWS::AppSync::Resolver',
                    Properties: {
                        ApiId: 'apiId',
                        FieldName: 'myField',
                        TypeName: 'Query',
                        DataSourceName: 'my-datasource',
                        Kind: 'UNIT',
                        RequestMappingTemplate: '## new request template',
                        ResponseMappingTemplate: '## original response template',
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateResolver).toHaveBeenCalledWith({
        apiId: 'apiId',
        dataSourceName: 'my-datasource',
        typeName: 'Query',
        fieldName: 'myField',
        kind: 'UNIT',
        requestMappingTemplate: '## new request template',
        responseMappingTemplate: '## original response template',
    });
});
test('does not call the updateResolver() API when it receives only a mapping template difference in a Pipeline Resolver', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncResolver: {
                Type: 'AWS::AppSync::Resolver',
                Properties: {
                    ApiId: 'apiId',
                    FieldName: 'myField',
                    TypeName: 'Query',
                    DataSourceName: 'my-datasource',
                    Kind: 'PIPELINE',
                    PipelineConfig: ['function1'],
                    RequestMappingTemplate: '## original request template',
                    ResponseMappingTemplate: '## original response template',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncResolver: {
                    Type: 'AWS::AppSync::Resolver',
                    Properties: {
                        ApiId: 'apiId',
                        FieldName: 'myField',
                        TypeName: 'Query',
                        DataSourceName: 'my-datasource',
                        Kind: 'PIPELINE',
                        PipelineConfig: ['function1'],
                        RequestMappingTemplate: '## new request template',
                        ResponseMappingTemplate: '## original response template',
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateResolver).not.toHaveBeenCalled();
});
test('does not call the updateResolver() API when it receives a change that is not a mapping template difference in a Resolver', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncResolver: {
                Type: 'AWS::AppSync::Resolver',
                Properties: {
                    RequestMappingTemplate: '## original template',
                    FieldName: 'oldField',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncResolver: {
                    Type: 'AWS::AppSync::Resolver',
                    Properties: {
                        RequestMappingTemplate: '## new template',
                        FieldName: 'newField',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateResolver).not.toHaveBeenCalled();
});
test('does not call the updateResolver() API when a resource with type that is not AWS::AppSync::Resolver but has the same properties is changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncResolver: {
                Type: 'AWS::AppSync::NotAResolver',
                Properties: {
                    RequestMappingTemplate: '## original template',
                    FieldName: 'oldField',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncResolver: {
                    Type: 'AWS::AppSync::NotAResolver',
                    Properties: {
                        RequestMappingTemplate: '## new template',
                        FieldName: 'newField',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateResolver).not.toHaveBeenCalled();
});
test('calls the updateFunction() API when it receives only a mapping template difference in a Function', async () => {
    // GIVEN
    const mockListFunctions = jest.fn().mockReturnValue({ functions: [{ name: 'my-function', functionId: 'functionId' }] });
    hotswapMockSdkProvider.stubAppSync({ listFunctions: mockListFunctions, updateFunction: mockUpdateFunction });
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncFunction: {
                Type: 'AWS::AppSync::FunctionConfiguration',
                Properties: {
                    Name: 'my-function',
                    ApiId: 'apiId',
                    DataSourceName: 'my-datasource',
                    FunctionVersion: '2018-05-29',
                    RequestMappingTemplate: '## original request template',
                    ResponseMappingTemplate: '## original response template',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncFunction: {
                    Type: 'AWS::AppSync::FunctionConfiguration',
                    Properties: {
                        Name: 'my-function',
                        ApiId: 'apiId',
                        DataSourceName: 'my-datasource',
                        FunctionVersion: '2018-05-29',
                        RequestMappingTemplate: '## original request template',
                        ResponseMappingTemplate: '## new response template',
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateFunction).toHaveBeenCalledWith({
        apiId: 'apiId',
        dataSourceName: 'my-datasource',
        functionId: 'functionId',
        functionVersion: '2018-05-29',
        name: 'my-function',
        requestMappingTemplate: '## original request template',
        responseMappingTemplate: '## new response template',
    });
});
test('does not call the updateFunction() API when it receives a change that is not a mapping template difference in a Function', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncFunction: {
                Type: 'AWS::AppSync::FunctionConfiguration',
                Properties: {
                    RequestMappingTemplate: '## original template',
                    Name: 'my-function',
                    DataSourceName: 'my-datasource',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncFunction: {
                    Type: 'AWS::AppSync::FunctionConfiguration',
                    Properties: {
                        RequestMappingTemplate: '## new template',
                        Name: 'my-function',
                        DataSourceName: 'new-datasource',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateFunction).not.toHaveBeenCalled();
});
test('does not call the updateFunction() API when a resource with type that is not AWS::AppSync::FunctionConfiguration but has the same properties is changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            AppSyncFunction: {
                Type: 'AWS::AppSync::NotAFunctionConfiguration',
                Properties: {
                    RequestMappingTemplate: '## original template',
                    Name: 'my-function',
                    DataSourceName: 'my-datasource',
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                AppSyncFunction: {
                    Type: 'AWS::AppSync::NotAFunctionConfiguration',
                    Properties: {
                        RequestMappingTemplate: '## new template',
                        Name: 'my-resolver',
                        DataSourceName: 'my-datasource',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateFunction).not.toHaveBeenCalled();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwc3luYy1tYXBwaW5nLXRlbXBsYXRlcy1ob3Rzd2FwLWRlcGxveW1lbnRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBzeW5jLW1hcHBpbmctdGVtcGxhdGVzLWhvdHN3YXAtZGVwbG95bWVudHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDhDQUE4QztBQUU5QyxJQUFJLHNCQUFvRCxDQUFDO0FBQ3pELElBQUksa0JBQTZGLENBQUM7QUFDbEcsSUFBSSxrQkFBNkYsQ0FBQztBQUVsRyxVQUFVLENBQUMsR0FBRyxFQUFFO0lBQ2Qsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQy9CLGtCQUFrQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUMvQixzQkFBc0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztBQUNqSCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyw2REFBNkQsRUFBRSxLQUFLLElBQUksRUFBRTtJQUM3RSxRQUFRO0lBQ1IsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULGVBQWUsRUFBRTtvQkFDZixJQUFJLEVBQUUsd0JBQXdCO2lCQUMvQjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQzVDLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFD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LENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDMUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDcEQsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBTeW5jIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgKiBhcyBzZXR1cCBmcm9tICcuL2hvdHN3YXAtdGVzdC1zZXR1cCc7XG5cbmxldCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyOiBzZXR1cC5Ib3Rzd2FwTW9ja1Nka1Byb3ZpZGVyO1xubGV0IG1vY2tVcGRhdGVSZXNvbHZlcjogKHBhcmFtczogQXBwU3luYy5VcGRhdGVSZXNvbHZlclJlcXVlc3QpID0+IEFwcFN5bmMuVXBkYXRlUmVzb2x2ZXJSZXNwb25zZTtcbmxldCBtb2NrVXBkYXRlRnVuY3Rpb246IChwYXJhbXM6IEFwcFN5bmMuVXBkYXRlRnVuY3Rpb25SZXF1ZXN0KSA9PiBBcHBTeW5jLlVwZGF0ZUZ1bmN0aW9uUmVzcG9uc2U7XG5cbmJlZm9yZUVhY2goKCkgPT4ge1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwVGVzdHMoKTtcbiAgbW9ja1VwZGF0ZVJlc29sdmVyID0gamVzdC5mbigpO1xuICBtb2NrVXBkYXRlRnVuY3Rpb24gPSBqZXN0LmZuKCk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkFwcFN5bmMoeyB1cGRhdGVSZXNvbHZlcjogbW9ja1VwZGF0ZVJlc29sdmVyLCB1cGRhdGVGdW5jdGlvbjogbW9ja1VwZGF0ZUZ1bmN0aW9uIH0pO1xufSk7XG5cbnRlc3QoJ3JldHVybnMgdW5kZWZpbmVkIHdoZW4gYSBuZXcgUmVzb2x2ZXIgaXMgYWRkZWQgdG8gdGhlIFN0YWNrJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEFwcFN5bmNSZXNvbHZlcjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgdXBkYXRlUmVzb2x2ZXIoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBvbmx5IGEgbWFwcGluZyB0ZW1wbGF0ZSBkaWZmZXJlbmNlIGluIGEgVW5pdCBSZXNvbHZlcicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQXBwU3luY1Jlc29sdmVyOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIEFwaUlkOiAnYXBpSWQnLFxuICAgICAgICAgIEZpZWxkTmFtZTogJ215RmllbGQnLFxuICAgICAgICAgIFR5cGVOYW1lOiAnUXVlcnknLFxuICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgICAgS2luZDogJ1VOSVQnLFxuICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCByZXF1ZXN0IHRlbXBsYXRlJyxcbiAgICAgICAgICBSZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogJyMjIG9yaWdpbmFsIHJlc3BvbnNlIHRlbXBsYXRlJyxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgc2V0dXAucHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoXG4gICAgICAnQXBwU3luY1Jlc29sdmVyJyxcbiAgICAgICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICdhcm46YXdzOmFwcHN5bmM6dXMtZWFzdC0xOjExMTExMTExMTExMTphcGlzL2FwaUlkL3R5cGVzL1F1ZXJ5L3Jlc29sdmVycy9teUZpZWxkJyxcbiAgICApLFxuICApO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEFwcFN5bmNSZXNvbHZlcjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBBcGlJZDogJ2FwaUlkJyxcbiAgICAgICAgICAgIEZpZWxkTmFtZTogJ215RmllbGQnLFxuICAgICAgICAgICAgVHlwZU5hbWU6ICdRdWVyeScsXG4gICAgICAgICAgICBEYXRhU291cmNlTmFtZTogJ215LWRhdGFzb3VyY2UnLFxuICAgICAgICAgICAgS2luZDogJ1VOSVQnLFxuICAgICAgICAgICAgUmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogJyMjIG5ldyByZXF1ZXN0IHRlbXBsYXRlJyxcbiAgICAgICAgICAgIFJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiAnIyMgb3JpZ2luYWwgcmVzcG9uc2UgdGVtcGxhdGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlUmVzb2x2ZXIpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBhcGlJZDogJ2FwaUlkJyxcbiAgICBkYXRhU291cmNlTmFtZTogJ215LWRhdGFzb3VyY2UnLFxuICAgIHR5cGVOYW1lOiAnUXVlcnknLFxuICAgIGZpZWxkTmFtZTogJ215RmllbGQnLFxuICAgIGtpbmQ6ICdVTklUJyxcbiAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgbmV3IHJlcXVlc3QgdGVtcGxhdGUnLFxuICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiAnIyMgb3JpZ2luYWwgcmVzcG9uc2UgdGVtcGxhdGUnLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdkb2VzIG5vdCBjYWxsIHRoZSB1cGRhdGVSZXNvbHZlcigpIEFQSSB3aGVuIGl0IHJlY2VpdmVzIG9ubHkgYSBtYXBwaW5nIHRlbXBsYXRlIGRpZmZlcmVuY2UgaW4gYSBQaXBlbGluZSBSZXNvbHZlcicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQXBwU3luY1Jlc29sdmVyOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIEFwaUlkOiAnYXBpSWQnLFxuICAgICAgICAgIEZpZWxkTmFtZTogJ215RmllbGQnLFxuICAgICAgICAgIFR5cGVOYW1lOiAnUXVlcnknLFxuICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgICAgS2luZDogJ1BJUEVMSU5FJyxcbiAgICAgICAgICBQaXBlbGluZUNvbmZpZzogWydmdW5jdGlvbjEnXSxcbiAgICAgICAgICBSZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgb3JpZ2luYWwgcmVxdWVzdCB0ZW1wbGF0ZScsXG4gICAgICAgICAgUmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCByZXNwb25zZSB0ZW1wbGF0ZScsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQXBwU3luY1Jlc29sdmVyOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6QXBwU3luYzo6UmVzb2x2ZXInLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIEFwaUlkOiAnYXBpSWQnLFxuICAgICAgICAgICAgRmllbGROYW1lOiAnbXlGaWVsZCcsXG4gICAgICAgICAgICBUeXBlTmFtZTogJ1F1ZXJ5JyxcbiAgICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgICAgICBLaW5kOiAnUElQRUxJTkUnLFxuICAgICAgICAgICAgUGlwZWxpbmVDb25maWc6IFsnZnVuY3Rpb24xJ10sXG4gICAgICAgICAgICBSZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgbmV3IHJlcXVlc3QgdGVtcGxhdGUnLFxuICAgICAgICAgICAgUmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCByZXNwb25zZSB0ZW1wbGF0ZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVJlc29sdmVyKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIHVwZGF0ZVJlc29sdmVyKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgYSBjaGFuZ2UgdGhhdCBpcyBub3QgYSBtYXBwaW5nIHRlbXBsYXRlIGRpZmZlcmVuY2UgaW4gYSBSZXNvbHZlcicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQXBwU3luY1Jlc29sdmVyOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCB0ZW1wbGF0ZScsXG4gICAgICAgICAgRmllbGROYW1lOiAnb2xkRmllbGQnLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEFwcFN5bmNSZXNvbHZlcjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6OlJlc29sdmVyJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBSZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgbmV3IHRlbXBsYXRlJyxcbiAgICAgICAgICAgIEZpZWxkTmFtZTogJ25ld0ZpZWxkJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVJlc29sdmVyKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIHVwZGF0ZVJlc29sdmVyKCkgQVBJIHdoZW4gYSByZXNvdXJjZSB3aXRoIHR5cGUgdGhhdCBpcyBub3QgQVdTOjpBcHBTeW5jOjpSZXNvbHZlciBidXQgaGFzIHRoZSBzYW1lIHByb3BlcnRpZXMgaXMgY2hhbmdlZCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQXBwU3luY1Jlc29sdmVyOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6Ok5vdEFSZXNvbHZlcicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBSZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgb3JpZ2luYWwgdGVtcGxhdGUnLFxuICAgICAgICAgIEZpZWxkTmFtZTogJ29sZEZpZWxkJyxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBBcHBTeW5jUmVzb2x2ZXI6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpBcHBTeW5jOjpOb3RBUmVzb2x2ZXInLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBuZXcgdGVtcGxhdGUnLFxuICAgICAgICAgICAgRmllbGROYW1lOiAnbmV3RmllbGQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlUmVzb2x2ZXIpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnY2FsbHMgdGhlIHVwZGF0ZUZ1bmN0aW9uKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhIG1hcHBpbmcgdGVtcGxhdGUgZGlmZmVyZW5jZSBpbiBhIEZ1bmN0aW9uJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBtb2NrTGlzdEZ1bmN0aW9ucyA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoeyBmdW5jdGlvbnM6IFt7IG5hbWU6ICdteS1mdW5jdGlvbicsIGZ1bmN0aW9uSWQ6ICdmdW5jdGlvbklkJyB9XSB9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViQXBwU3luYyh7IGxpc3RGdW5jdGlvbnM6IG1vY2tMaXN0RnVuY3Rpb25zLCB1cGRhdGVGdW5jdGlvbjogbW9ja1VwZGF0ZUZ1bmN0aW9uIH0pO1xuXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEFwcFN5bmNGdW5jdGlvbjoge1xuICAgICAgICBUeXBlOiAnQVdTOjpBcHBTeW5jOjpGdW5jdGlvbkNvbmZpZ3VyYXRpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICBBcGlJZDogJ2FwaUlkJyxcbiAgICAgICAgICBEYXRhU291cmNlTmFtZTogJ215LWRhdGFzb3VyY2UnLFxuICAgICAgICAgIEZ1bmN0aW9uVmVyc2lvbjogJzIwMTgtMDUtMjknLFxuICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCByZXF1ZXN0IHRlbXBsYXRlJyxcbiAgICAgICAgICBSZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogJyMjIG9yaWdpbmFsIHJlc3BvbnNlIHRlbXBsYXRlJyxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBBcHBTeW5jRnVuY3Rpb246IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpBcHBTeW5jOjpGdW5jdGlvbkNvbmZpZ3VyYXRpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIE5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgICBBcGlJZDogJ2FwaUlkJyxcbiAgICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgICAgICBGdW5jdGlvblZlcnNpb246ICcyMDE4LTA1LTI5JyxcbiAgICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCByZXF1ZXN0IHRlbXBsYXRlJyxcbiAgICAgICAgICAgIFJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiAnIyMgbmV3IHJlc3BvbnNlIHRlbXBsYXRlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUZ1bmN0aW9uKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgYXBpSWQ6ICdhcGlJZCcsXG4gICAgZGF0YVNvdXJjZU5hbWU6ICdteS1kYXRhc291cmNlJyxcbiAgICBmdW5jdGlvbklkOiAnZnVuY3Rpb25JZCcsXG4gICAgZnVuY3Rpb25WZXJzaW9uOiAnMjAxOC0wNS0yOScsXG4gICAgbmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgb3JpZ2luYWwgcmVxdWVzdCB0ZW1wbGF0ZScsXG4gICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6ICcjIyBuZXcgcmVzcG9uc2UgdGVtcGxhdGUnLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdkb2VzIG5vdCBjYWxsIHRoZSB1cGRhdGVGdW5jdGlvbigpIEFQSSB3aGVuIGl0IHJlY2VpdmVzIGEgY2hhbmdlIHRoYXQgaXMgbm90IGEgbWFwcGluZyB0ZW1wbGF0ZSBkaWZmZXJlbmNlIGluIGEgRnVuY3Rpb24nLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEFwcFN5bmNGdW5jdGlvbjoge1xuICAgICAgICBUeXBlOiAnQVdTOjpBcHBTeW5jOjpGdW5jdGlvbkNvbmZpZ3VyYXRpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgUmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogJyMjIG9yaWdpbmFsIHRlbXBsYXRlJyxcbiAgICAgICAgICBOYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQXBwU3luY0Z1bmN0aW9uOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6QXBwU3luYzo6RnVuY3Rpb25Db25maWd1cmF0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBSZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiAnIyMgbmV3IHRlbXBsYXRlJyxcbiAgICAgICAgICAgIE5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgICBEYXRhU291cmNlTmFtZTogJ25ldy1kYXRhc291cmNlJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUZ1bmN0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIHVwZGF0ZUZ1bmN0aW9uKCkgQVBJIHdoZW4gYSByZXNvdXJjZSB3aXRoIHR5cGUgdGhhdCBpcyBub3QgQVdTOjpBcHBTeW5jOjpGdW5jdGlvbkNvbmZpZ3VyYXRpb24gYnV0IGhhcyB0aGUgc2FtZSBwcm9wZXJ0aWVzIGlzIGNoYW5nZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEFwcFN5bmNGdW5jdGlvbjoge1xuICAgICAgICBUeXBlOiAnQVdTOjpBcHBTeW5jOjpOb3RBRnVuY3Rpb25Db25maWd1cmF0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBvcmlnaW5hbCB0ZW1wbGF0ZScsXG4gICAgICAgICAgTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICBEYXRhU291cmNlTmFtZTogJ215LWRhdGFzb3VyY2UnLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEFwcFN5bmNGdW5jdGlvbjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkFwcFN5bmM6Ok5vdEFGdW5jdGlvbkNvbmZpZ3VyYXRpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6ICcjIyBuZXcgdGVtcGxhdGUnLFxuICAgICAgICAgICAgTmFtZTogJ215LXJlc29sdmVyJyxcbiAgICAgICAgICAgIERhdGFTb3VyY2VOYW1lOiAnbXktZGF0YXNvdXJjZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVGdW5jdGlvbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuIl19