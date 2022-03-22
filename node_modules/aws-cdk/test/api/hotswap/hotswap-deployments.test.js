"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let hotswapMockSdkProvider;
let mockUpdateLambdaCode;
let mockUpdateMachineDefinition;
let mockGetEndpointSuffix;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    mockUpdateMachineDefinition = jest.fn();
    mockGetEndpointSuffix = jest.fn(() => 'amazonaws.com');
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    hotswapMockSdkProvider.setUpdateStateMachineMock(mockUpdateMachineDefinition);
    hotswapMockSdkProvider.stubGetEndpointSuffix(mockGetEndpointSuffix);
});
test('returns a deployStackResult with noOp=true when it receives an empty set of changes', async () => {
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(setup.cdkStackArtifactOf());
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(deployStackResult === null || deployStackResult === void 0 ? void 0 : deployStackResult.noOp).toBeTruthy();
    expect(deployStackResult === null || deployStackResult === void 0 ? void 0 : deployStackResult.stackArn).toEqual(setup.STACK_ID);
});
test('A change to only a non-hotswappable resource results in a full deployment', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            SomethingElse: {
                Type: 'AWS::CloudFormation::SomethingElse',
                Properties: {
                    Prop: 'old-value',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                SomethingElse: {
                    Type: 'AWS::CloudFormation::SomethingElse',
                    Properties: {
                        Prop: 'new-value',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateMachineDefinition).not.toHaveBeenCalled();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('A change to both a hotswappable resource and a non-hotswappable resource results in a full deployment', async () => {
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
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
            SomethingElse: {
                Type: 'AWS::CloudFormation::SomethingElse',
                Properties: {
                    Prop: 'old-value',
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
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
                SomethingElse: {
                    Type: 'AWS::CloudFormation::SomethingElse',
                    Properties: {
                        Prop: 'new-value',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateMachineDefinition).not.toHaveBeenCalled();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('changes only to CDK::Metadata result in a noOp', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            MetaData: {
                Type: 'AWS::CDK::Metadata',
                Properties: {
                    Prop: 'old-value',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                MetaData: {
                    Type: 'AWS::CDK::Metadata',
                    Properties: {
                        Prop: 'new-value',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(deployStackResult === null || deployStackResult === void 0 ? void 0 : deployStackResult.noOp).toEqual(true);
    expect(mockUpdateMachineDefinition).not.toHaveBeenCalled();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('resource deletions require full deployments', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Machine: {
                Type: 'AWS::StepFunctions::StateMachine',
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf();
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
    expect(mockUpdateMachineDefinition).not.toHaveBeenCalled();
});
test('can correctly reference AWS::Partition in hotswappable changes', async () => {
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
                    FunctionName: {
                        'Fn::Join': [
                            '',
                            [
                                { Ref: 'AWS::Partition' },
                                '-',
                                'my-function',
                            ],
                        ],
                    },
                },
                Metadata: {
                    'aws:asset:path': 'new-path',
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
                        FunctionName: {
                            'Fn::Join': [
                                '',
                                [
                                    { Ref: 'AWS::Partition' },
                                    '-',
                                    'my-function',
                                ],
                            ],
                        },
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
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'aws-my-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('can correctly reference AWS::URLSuffix in hotswappable changes', async () => {
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
                    FunctionName: {
                        'Fn::Join': ['', [
                                'my-function-',
                                { Ref: 'AWS::URLSuffix' },
                                '-',
                                { Ref: 'AWS::URLSuffix' },
                            ]],
                    },
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
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: {
                            'Fn::Join': ['', [
                                    'my-function-',
                                    { Ref: 'AWS::URLSuffix' },
                                    '-',
                                    { Ref: 'AWS::URLSuffix' },
                                ]],
                        },
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
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function-amazonaws.com-amazonaws.com',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
    expect(mockGetEndpointSuffix).toHaveBeenCalledTimes(1);
    // the User-Agent is set correctly
    expect(hotswapMockSdkProvider.mockSdkProvider.sdk.appendCustomUserAgent)
        .toHaveBeenCalledWith('cdk-hotswap/success-lambda-function');
    expect(hotswapMockSdkProvider.mockSdkProvider.sdk.removeCustomUserAgent)
        .toHaveBeenCalledWith('cdk-hotswap/success-lambda-function');
});
test('changing the type of a deployed resource always results in a full deployment', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            SharedLogicalId: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'new-key',
                    },
                    FunctionName: 'my-function',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                SharedLogicalId: {
                    Type: 'AWS::StepFunctions::StateMachine',
                    Properties: {
                        DefinitionString: '{ Prop: "new-value" }',
                        StateMachineName: 'my-machine',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateMachineDefinition).not.toHaveBeenCalled();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOENBQThDO0FBRTlDLElBQUksc0JBQW9ELENBQUM7QUFDekQsSUFBSSxvQkFBNEcsQ0FBQztBQUNqSCxJQUFJLDJCQUFrSSxDQUFDO0FBQ3ZJLElBQUkscUJBQW1DLENBQUM7QUFFeEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ3hDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkQsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtLQUN6QyxDQUFDLENBQUM7SUFDSCxzQkFBc0IsQ0FBQyx5QkFBeUIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQzlFLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDdEUsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUZBQXFGLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDckcsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBRXhHLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLGlCQUFpQixhQUFq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QixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzNELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTGFtYmRhLCBTdGVwRnVuY3Rpb25zIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgKiBhcyBzZXR1cCBmcm9tICcuL2hvdHN3YXAtdGVzdC1zZXR1cCc7XG5cbmxldCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyOiBzZXR1cC5Ib3Rzd2FwTW9ja1Nka1Byb3ZpZGVyO1xubGV0IG1vY2tVcGRhdGVMYW1iZGFDb2RlOiAocGFyYW1zOiBMYW1iZGEuVHlwZXMuVXBkYXRlRnVuY3Rpb25Db2RlUmVxdWVzdCkgPT4gTGFtYmRhLlR5cGVzLkZ1bmN0aW9uQ29uZmlndXJhdGlvbjtcbmxldCBtb2NrVXBkYXRlTWFjaGluZURlZmluaXRpb246IChwYXJhbXM6IFN0ZXBGdW5jdGlvbnMuVHlwZXMuVXBkYXRlU3RhdGVNYWNoaW5lSW5wdXQpID0+IFN0ZXBGdW5jdGlvbnMuVHlwZXMuVXBkYXRlU3RhdGVNYWNoaW5lT3V0cHV0O1xubGV0IG1vY2tHZXRFbmRwb2ludFN1ZmZpeDogKCkgPT4gc3RyaW5nO1xuXG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcFRlc3RzKCk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIG1vY2tVcGRhdGVNYWNoaW5lRGVmaW5pdGlvbiA9IGplc3QuZm4oKTtcbiAgbW9ja0dldEVuZHBvaW50U3VmZml4ID0gamVzdC5mbigoKSA9PiAnYW1hem9uYXdzLmNvbScpO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gIH0pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnNldFVwZGF0ZVN0YXRlTWFjaGluZU1vY2sobW9ja1VwZGF0ZU1hY2hpbmVEZWZpbml0aW9uKTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViR2V0RW5kcG9pbnRTdWZmaXgobW9ja0dldEVuZHBvaW50U3VmZml4KTtcbn0pO1xuXG50ZXN0KCdyZXR1cm5zIGEgZGVwbG95U3RhY2tSZXN1bHQgd2l0aCBub09wPXRydWUgd2hlbiBpdCByZWNlaXZlcyBhbiBlbXB0eSBzZXQgb2YgY2hhbmdlcycsIGFzeW5jICgpID0+IHtcbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKCkpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQ/Lm5vT3ApLnRvQmVUcnV0aHkoKTtcbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0Py5zdGFja0FybikudG9FcXVhbChzZXR1cC5TVEFDS19JRCk7XG59KTtcblxudGVzdCgnQSBjaGFuZ2UgdG8gb25seSBhIG5vbi1ob3Rzd2FwcGFibGUgcmVzb3VyY2UgcmVzdWx0cyBpbiBhIGZ1bGwgZGVwbG95bWVudCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgU29tZXRoaW5nRWxzZToge1xuICAgICAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U29tZXRoaW5nRWxzZScsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBQcm9wOiAnb2xkLXZhbHVlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgU29tZXRoaW5nRWxzZToge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTb21ldGhpbmdFbHNlJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBQcm9wOiAnbmV3LXZhbHVlJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZU1hY2hpbmVEZWZpbml0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnQSBjaGFuZ2UgdG8gYm90aCBhIGhvdHN3YXBwYWJsZSByZXNvdXJjZSBhbmQgYSBub24taG90c3dhcHBhYmxlIHJlc291cmNlIHJlc3VsdHMgaW4gYSBmdWxsIGRlcGxveW1lbnQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgU29tZXRoaW5nRWxzZToge1xuICAgICAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U29tZXRoaW5nRWxzZScsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBQcm9wOiAnb2xkLXZhbHVlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgU29tZXRoaW5nRWxzZToge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTb21ldGhpbmdFbHNlJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBQcm9wOiAnbmV3LXZhbHVlJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZU1hY2hpbmVEZWZpbml0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnY2hhbmdlcyBvbmx5IHRvIENESzo6TWV0YWRhdGEgcmVzdWx0IGluIGEgbm9PcCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgTWV0YURhdGE6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q0RLOjpNZXRhZGF0YScsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBQcm9wOiAnb2xkLXZhbHVlJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgTWV0YURhdGE6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDREs6Ok1ldGFkYXRhJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBQcm9wOiAnbmV3LXZhbHVlJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0Py5ub09wKS50b0VxdWFsKHRydWUpO1xuICBleHBlY3QobW9ja1VwZGF0ZU1hY2hpbmVEZWZpbml0aW9uKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgncmVzb3VyY2UgZGVsZXRpb25zIHJlcXVpcmUgZnVsbCBkZXBsb3ltZW50cycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgTWFjaGluZToge1xuICAgICAgICBUeXBlOiAnQVdTOjpTdGVwRnVuY3Rpb25zOjpTdGF0ZU1hY2hpbmUnLFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZigpO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVNYWNoaW5lRGVmaW5pdGlvbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdjYW4gY29ycmVjdGx5IHJlZmVyZW5jZSBBV1M6OlBhcnRpdGlvbiBpbiBob3Rzd2FwcGFibGUgY2hhbmdlcycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6IHtcbiAgICAgICAgICAgICdGbjo6Sm9pbic6IFtcbiAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICB7IFJlZjogJ0FXUzo6UGFydGl0aW9uJyB9LFxuICAgICAgICAgICAgICAgICctJyxcbiAgICAgICAgICAgICAgICAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ25ldy1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZToge1xuICAgICAgICAgICAgICAnRm46OkpvaW4nOiBbXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgeyBSZWY6ICdBV1M6OlBhcnRpdGlvbicgfSxcbiAgICAgICAgICAgICAgICAgICctJyxcbiAgICAgICAgICAgICAgICAgICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnYXdzLW15LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdjYW4gY29ycmVjdGx5IHJlZmVyZW5jZSBBV1M6OlVSTFN1ZmZpeCBpbiBob3Rzd2FwcGFibGUgY2hhbmdlcycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6IHtcbiAgICAgICAgICAgICdGbjo6Sm9pbic6IFsnJywgW1xuICAgICAgICAgICAgICAnbXktZnVuY3Rpb24tJyxcbiAgICAgICAgICAgICAgeyBSZWY6ICdBV1M6OlVSTFN1ZmZpeCcgfSxcbiAgICAgICAgICAgICAgJy0nLFxuICAgICAgICAgICAgICB7IFJlZjogJ0FXUzo6VVJMU3VmZml4JyB9LFxuICAgICAgICAgICAgXV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHtcbiAgICAgICAgICAgICAgJ0ZuOjpKb2luJzogWycnLCBbXG4gICAgICAgICAgICAgICAgJ215LWZ1bmN0aW9uLScsXG4gICAgICAgICAgICAgICAgeyBSZWY6ICdBV1M6OlVSTFN1ZmZpeCcgfSxcbiAgICAgICAgICAgICAgICAnLScsXG4gICAgICAgICAgICAgICAgeyBSZWY6ICdBV1M6OlVSTFN1ZmZpeCcgfSxcbiAgICAgICAgICAgICAgXV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uLWFtYXpvbmF3cy5jb20tYW1hem9uYXdzLmNvbScsXG4gICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgUzNLZXk6ICduZXcta2V5JyxcbiAgfSk7XG4gIGV4cGVjdChtb2NrR2V0RW5kcG9pbnRTdWZmaXgpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKTtcblxuICAvLyB0aGUgVXNlci1BZ2VudCBpcyBzZXQgY29ycmVjdGx5XG4gIGV4cGVjdChob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLm1vY2tTZGtQcm92aWRlci5zZGsuYXBwZW5kQ3VzdG9tVXNlckFnZW50KVxuICAgIC50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnY2RrLWhvdHN3YXAvc3VjY2Vzcy1sYW1iZGEtZnVuY3Rpb24nKTtcbiAgZXhwZWN0KGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIubW9ja1Nka1Byb3ZpZGVyLnNkay5yZW1vdmVDdXN0b21Vc2VyQWdlbnQpXG4gICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKCdjZGstaG90c3dhcC9zdWNjZXNzLWxhbWJkYS1mdW5jdGlvbicpO1xufSk7XG5cbnRlc3QoJ2NoYW5naW5nIHRoZSB0eXBlIG9mIGEgZGVwbG95ZWQgcmVzb3VyY2UgYWx3YXlzIHJlc3VsdHMgaW4gYSBmdWxsIGRlcGxveW1lbnQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIFNoYXJlZExvZ2ljYWxJZDoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgU2hhcmVkTG9naWNhbElkOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6U3RlcEZ1bmN0aW9uczo6U3RhdGVNYWNoaW5lJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBEZWZpbml0aW9uU3RyaW5nOiAneyBQcm9wOiBcIm5ldy12YWx1ZVwiIH0nLFxuICAgICAgICAgICAgU3RhdGVNYWNoaW5lTmFtZTogJ215LW1hY2hpbmUnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTWFjaGluZURlZmluaXRpb24pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuIl19