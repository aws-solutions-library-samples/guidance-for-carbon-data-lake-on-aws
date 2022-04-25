"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let mockUpdateLambdaCode;
let mockPublishVersion;
let mockUpdateAlias;
let hotswapMockSdkProvider;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    mockPublishVersion = jest.fn();
    mockUpdateAlias = jest.fn();
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        publishVersion: mockPublishVersion,
        updateAlias: mockUpdateAlias,
        waitFor: jest.fn(),
    });
});
test('hotswaps a Version if it points to a changed Function, even if it itself is unchanged', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
                    },
                    FunctionName: 'my-function',
                },
            },
            Version: {
                Type: 'AWS::Lambda::Version',
                Properties: {
                    FunctionName: { Ref: 'Func' },
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: 'my-function',
                    },
                },
                Version: {
                    Type: 'AWS::Lambda::Version',
                    Properties: {
                        FunctionName: { Ref: 'Func' },
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockPublishVersion).toHaveBeenCalledWith({
        FunctionName: 'my-function',
    });
});
test('hotswaps a Version if it points to a changed Function, even if it itself is replaced', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
                    },
                    FunctionName: 'my-function',
                },
            },
            Version1: {
                Type: 'AWS::Lambda::Version',
                Properties: {
                    FunctionName: { Ref: 'Func' },
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: 'my-function',
                    },
                },
                Version2: {
                    Type: 'AWS::Lambda::Version',
                    Properties: {
                        FunctionName: { Ref: 'Func' },
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockPublishVersion).toHaveBeenCalledWith({
        FunctionName: 'my-function',
    });
});
test('hotswaps a Version and an Alias if the Function they point to changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
                    },
                    FunctionName: 'my-function',
                },
            },
            Version1: {
                Type: 'AWS::Lambda::Version',
                Properties: {
                    FunctionName: { Ref: 'Func' },
                },
            },
            Alias: {
                Type: 'AWS::Lambda::Alias',
                Properties: {
                    FunctionName: { Ref: 'Func' },
                    FunctionVersion: { 'Fn::GetAtt': ['Version1', 'Version'] },
                    Name: 'dev',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: 'my-function',
                    },
                },
                Version2: {
                    Type: 'AWS::Lambda::Version',
                    Properties: {
                        FunctionName: { Ref: 'Func' },
                    },
                },
                Alias: {
                    Type: 'AWS::Lambda::Alias',
                    Properties: {
                        FunctionName: { Ref: 'Func' },
                        FunctionVersion: { 'Fn::GetAtt': ['Version2', 'Version'] },
                        Name: 'dev',
                    },
                },
            },
        },
    });
    mockPublishVersion.mockReturnValue({
        Version: 'v2',
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateAlias).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        FunctionVersion: 'v2',
        Name: 'dev',
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLXZlcnNpb25zLWFsaWFzZXMtaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLXZlcnNpb25zLWFsaWFzZXMtaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOENBQThDO0FBRTlDLElBQUksb0JBQTRHLENBQUM7QUFDakgsSUFBSSxrQkFBMkYsQ0FBQztBQUNoRyxJQUFJLGVBQWlGLENBQUM7QUFDdEYsSUFBSSxzQkFBb0QsQ0FBQztBQUV6RCxVQUFVLENBQUMsR0FBRyxFQUFFO0lBQ2Qsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDL0IsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUM1QixzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLGNBQWMsRUFBRSxrQkFBa0I7UUFDbEMsV0FBVyxFQUFFLGVBQWU7UUFDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsdUZBQXVGLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdkcsUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRTt3QkFDSixRQUFRLEVBQUUsZ0JBQWdCO3dCQUMxQixLQUFLLEVBQUUsYUFBYTtxQkFDckI7b0JBQ0QsWUFBWSxFQUFFLGFBQWE7aUJBQzVCO2FBQ0Y7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsVUFBVSxFQUFFO29CQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7aUJBQzlCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO2lCQUNGO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxJQUFJLEVBQUUsc0JBQXNCO29CQUM1QixVQUFVLEVBQUU7d0JBQ1YsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtxQkFDOUI7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDOUMsWUFBWSxFQUFFLGFBQWE7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsc0ZBQXNGLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdEcsUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRTt3QkFDSixRQUFRLEVBQUUsZ0JBQWdCO3dCQUMxQixLQUFLLEVBQUUsYUFBYTtxQkFDckI7b0JBQ0QsWUFBWSxFQUFFLGFBQWE7aUJBQzVCO2FBQ0Y7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsVUFBVSxFQUFFO29CQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7aUJBQzlCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO2lCQUNGO2dCQUNELFFBQVEsRUFBRTtvQkFDUixJQUFJLEVBQUUsc0JBQXNCO29CQUM1QixVQUFVLEVBQUU7d0JBQ1YsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtxQkFDOUI7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDOUMsWUFBWSxFQUFFLGFBQWE7S0FDNUIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsdUVBQXVFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDdkYsUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRTt3QkFDSixRQUFRLEVBQUUsZ0JBQWdCO3dCQUMxQixLQUFLLEVBQUUsYUFBYTtxQkFDckI7b0JBQ0QsWUFBWSxFQUFFLGFBQWE7aUJBQzVCO2FBQ0Y7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLHNCQUFzQjtnQkFDNUIsVUFBVSxFQUFFO29CQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7aUJBQzlCO2FBQ0Y7WUFDRCxLQUFLLEVBQUU7Z0JBQ0wsSUFBSSxFQUFFLG9CQUFvQjtnQkFDMUIsVUFBVSxFQUFFO29CQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7b0JBQzdCLGVBQWUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRTtvQkFDMUQsSUFBSSxFQUFFLEtBQUs7aUJBQ1o7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxTQUFTO3lCQUNqQjt3QkFDRCxZQUFZLEVBQUUsYUFBYTtxQkFDNUI7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLElBQUksRUFBRSxzQkFBc0I7b0JBQzVCLFVBQVUsRUFBRTt3QkFDVixZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFO3FCQUM5QjtpQkFDRjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLG9CQUFvQjtvQkFDMUIsVUFBVSxFQUFFO3dCQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7d0JBQzdCLGVBQWUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRTt3QkFDMUQsSUFBSSxFQUFFLEtBQUs7cUJBQ1o7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsa0JBQWtCLENBQUMsZUFBZSxDQUFDO1FBQ2pDLE9BQU8sRUFBRSxJQUFJO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQzNDLFlBQVksRUFBRSxhQUFhO1FBQzNCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLElBQUksRUFBRSxLQUFLO0tBQ1osQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYW1iZGEgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCAqIGFzIHNldHVwIGZyb20gJy4vaG90c3dhcC10ZXN0LXNldHVwJztcblxubGV0IG1vY2tVcGRhdGVMYW1iZGFDb2RlOiAocGFyYW1zOiBMYW1iZGEuVHlwZXMuVXBkYXRlRnVuY3Rpb25Db2RlUmVxdWVzdCkgPT4gTGFtYmRhLlR5cGVzLkZ1bmN0aW9uQ29uZmlndXJhdGlvbjtcbmxldCBtb2NrUHVibGlzaFZlcnNpb246IGplc3QuTW9jazxMYW1iZGEuRnVuY3Rpb25Db25maWd1cmF0aW9uLCBMYW1iZGEuUHVibGlzaFZlcnNpb25SZXF1ZXN0W10+O1xubGV0IG1vY2tVcGRhdGVBbGlhczogKHBhcmFtczogTGFtYmRhLlVwZGF0ZUFsaWFzUmVxdWVzdCkgPT4gTGFtYmRhLkFsaWFzQ29uZmlndXJhdGlvbjtcbmxldCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyOiBzZXR1cC5Ib3Rzd2FwTW9ja1Nka1Byb3ZpZGVyO1xuXG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcFRlc3RzKCk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIG1vY2tQdWJsaXNoVmVyc2lvbiA9IGplc3QuZm4oKTtcbiAgbW9ja1VwZGF0ZUFsaWFzID0gamVzdC5mbigpO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gICAgcHVibGlzaFZlcnNpb246IG1vY2tQdWJsaXNoVmVyc2lvbixcbiAgICB1cGRhdGVBbGlhczogbW9ja1VwZGF0ZUFsaWFzLFxuICAgIHdhaXRGb3I6IGplc3QuZm4oKSxcbiAgfSk7XG59KTtcblxudGVzdCgnaG90c3dhcHMgYSBWZXJzaW9uIGlmIGl0IHBvaW50cyB0byBhIGNoYW5nZWQgRnVuY3Rpb24sIGV2ZW4gaWYgaXQgaXRzZWxmIGlzIHVuY2hhbmdlZCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgVmVyc2lvbjoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OlZlcnNpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiB7IFJlZjogJ0Z1bmMnIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ25ldy1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBWZXJzaW9uOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpWZXJzaW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHsgUmVmOiAnRnVuYycgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tQdWJsaXNoVmVyc2lvbikudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgfSk7XG59KTtcblxudGVzdCgnaG90c3dhcHMgYSBWZXJzaW9uIGlmIGl0IHBvaW50cyB0byBhIGNoYW5nZWQgRnVuY3Rpb24sIGV2ZW4gaWYgaXQgaXRzZWxmIGlzIHJlcGxhY2VkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBGdW5jOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBWZXJzaW9uMToge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OlZlcnNpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiB7IFJlZjogJ0Z1bmMnIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ25ldy1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBWZXJzaW9uMjoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6VmVyc2lvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiB7IFJlZjogJ0Z1bmMnIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrUHVibGlzaFZlcnNpb24pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2hvdHN3YXBzIGEgVmVyc2lvbiBhbmQgYW4gQWxpYXMgaWYgdGhlIEZ1bmN0aW9uIHRoZXkgcG9pbnQgdG8gY2hhbmdlZCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgVmVyc2lvbjE6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpWZXJzaW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogeyBSZWY6ICdGdW5jJyB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIEFsaWFzOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6QWxpYXMnLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiB7IFJlZjogJ0Z1bmMnIH0sXG4gICAgICAgICAgRnVuY3Rpb25WZXJzaW9uOiB7ICdGbjo6R2V0QXR0JzogWydWZXJzaW9uMScsICdWZXJzaW9uJ10gfSxcbiAgICAgICAgICBOYW1lOiAnZGV2JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFZlcnNpb24yOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpWZXJzaW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHsgUmVmOiAnRnVuYycgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBBbGlhczoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6QWxpYXMnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogeyBSZWY6ICdGdW5jJyB9LFxuICAgICAgICAgICAgRnVuY3Rpb25WZXJzaW9uOiB7ICdGbjo6R2V0QXR0JzogWydWZXJzaW9uMicsICdWZXJzaW9uJ10gfSxcbiAgICAgICAgICAgIE5hbWU6ICdkZXYnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBtb2NrUHVibGlzaFZlcnNpb24ubW9ja1JldHVyblZhbHVlKHtcbiAgICBWZXJzaW9uOiAndjInLFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVBbGlhcykudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBGdW5jdGlvblZlcnNpb246ICd2MicsXG4gICAgTmFtZTogJ2RldicsXG4gIH0pO1xufSk7XG4iXX0=