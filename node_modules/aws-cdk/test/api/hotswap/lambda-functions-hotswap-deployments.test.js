"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let mockUpdateLambdaCode;
let mockTagResource;
let mockUntagResource;
let mockMakeRequest;
let hotswapMockSdkProvider;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    mockTagResource = jest.fn();
    mockUntagResource = jest.fn();
    mockMakeRequest = jest.fn().mockReturnValue({
        promise: () => Promise.resolve({}),
        response: {},
        addListeners: () => { },
    });
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        tagResource: mockTagResource,
        untagResource: mockUntagResource,
    }, {
        makeRequest: mockMakeRequest,
    });
});
test('returns undefined when a new Lambda function is added to the Stack', async () => {
    // GIVEN
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
});
test('calls the updateLambdaCode() API when it receives only a code difference in a Lambda function', async () => {
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
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('calls the tagResource() API when it receives only a tag difference in a Lambda function', async () => {
    // GIVEN
    const currentTemplate = {
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
                    },
                    FunctionName: 'my-function',
                    Tags: [
                        {
                            Key: 'to-be-deleted',
                            Value: 'a-value',
                        },
                        {
                            Key: 'to-be-changed',
                            Value: 'current-tag-value',
                        },
                    ],
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    };
    setup.setCurrentCfnStackTemplate(currentTemplate);
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'my-function',
                        Tags: [
                            {
                                Key: 'to-be-changed',
                                Value: 'new-tag-value',
                            },
                            {
                                Key: 'to-be-added',
                                Value: 'added-tag-value',
                            },
                        ],
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUntagResource).toHaveBeenCalledWith({
        Resource: 'arn:aws:lambda:here:123456789012:function:my-function',
        TagKeys: ['to-be-deleted'],
    });
    expect(mockTagResource).toHaveBeenCalledWith({
        Resource: 'arn:aws:lambda:here:123456789012:function:my-function',
        Tags: {
            'to-be-changed': 'new-tag-value',
            'to-be-added': 'added-tag-value',
        },
    });
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test("correctly evaluates the function's name when it references a different resource from the template", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Bucket: {
                Type: 'AWS::S3::Bucket',
            },
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
                    },
                    FunctionName: {
                        'Fn::Join': ['-', [
                                'lambda',
                                { Ref: 'Bucket' },
                                'function',
                            ]],
                    },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('Bucket', 'AWS::S3::Bucket', 'mybucket'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Bucket: {
                    Type: 'AWS::S3::Bucket',
                },
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: {
                            'Fn::Join': ['-', [
                                    'lambda',
                                    { Ref: 'Bucket' },
                                    'function',
                                ]],
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
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
        FunctionName: 'lambda-mybucket-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test("correctly falls back to taking the function's name from the current stack if it can't evaluate it in the template", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Parameters: {
            Param1: { Type: 'String' },
            AssetBucketParam: { Type: 'String' },
        },
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: { Ref: 'AssetBucketParam' },
                        S3Key: 'current-key',
                    },
                    FunctionName: { Ref: 'Param1' },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'my-function'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Parameters: {
                Param1: { Type: 'String' },
                AssetBucketParam: { Type: 'String' },
            },
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: { Ref: 'AssetBucketParam' },
                            S3Key: 'new-key',
                        },
                        FunctionName: { Ref: 'Param1' },
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact, { AssetBucketParam: 'asset-bucket' });
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'asset-bucket',
        S3Key: 'new-key',
    });
});
test("will not perform a hotswap deployment if it cannot find a Ref target (outside the function's name)", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Parameters: {
            Param1: { Type: 'String' },
        },
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: { 'Fn::Sub': '${Param1}' },
                        S3Key: 'current-key',
                    },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'my-func'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Parameters: {
                Param1: { Type: 'String' },
            },
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: { 'Fn::Sub': '${Param1}' },
                            S3Key: 'new-key',
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // THEN
    await expect(() => hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact)).rejects.toThrow(/Parameter or resource 'Param1' could not be found for evaluation/);
});
test("will not perform a hotswap deployment if it doesn't know how to handle a specific attribute (outside the function's name)", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Bucket: {
                Type: 'AWS::S3::Bucket',
            },
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        S3Bucket: { 'Fn::GetAtt': ['Bucket', 'UnknownAttribute'] },
                        S3Key: 'current-key',
                    },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'my-func'), setup.stackSummaryOf('Bucket', 'AWS::S3::Bucket', 'my-bucket'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Bucket: {
                    Type: 'AWS::S3::Bucket',
                },
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: { 'Fn::GetAtt': ['Bucket', 'UnknownAttribute'] },
                            S3Key: 'new-key',
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'new-path',
                    },
                },
            },
        },
    });
    // THEN
    await expect(() => hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact)).rejects.toThrow("We don't support the 'UnknownAttribute' attribute of the 'AWS::S3::Bucket' resource. This is a CDK limitation. Please report it at https://github.com/aws/aws-cdk/issues/new/choose");
});
test('calls the updateLambdaCode() API when it receives a code difference in a Lambda function with no name', async () => {
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
                },
                Metadata: {
                    'aws:asset:path': 'current-path',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'current-path',
                    },
                },
            },
        },
    });
    // WHEN
    setup.pushStackResourceSummaries(setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'mock-function-resource-id'));
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'mock-function-resource-id',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('does not call the updateLambdaCode() API when it receives a change that is not a code difference in a Lambda function', async () => {
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
                    PackageType: 'Zip',
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
                            S3Key: 'current-key',
                        },
                        PackageType: 'Image',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('does not call the updateLambdaCode() API when a resource with type that is not AWS::Lambda::Function but has the same properties is changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::NotLambda::NotAFunction',
                Properties: {
                    Code: {
                        S3Bucket: 'current-bucket',
                        S3Key: 'current-key',
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
                    Type: 'AWS::NotLambda::NotAFunction',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('calls getFunction() after function code is updated with delay 1', async () => {
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
            },
        },
    });
    // WHEN
    await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(mockMakeRequest).toHaveBeenCalledWith('getFunction', { FunctionName: 'my-function' });
    expect(hotswapMockSdkProvider.getLambdaApiWaiters()).toEqual(expect.objectContaining({
        updateFunctionCodeToFinish: expect.objectContaining({
            name: 'UpdateFunctionCodeToFinish',
            delay: 1,
        }),
    }));
});
test('calls getFunction() after function code is updated and VpcId is empty string with delay 1', async () => {
    // GIVEN
    mockUpdateLambdaCode = jest.fn().mockReturnValue({
        VpcConfig: {
            VpcId: '',
        },
    });
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        tagResource: mockTagResource,
        untagResource: mockUntagResource,
    });
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
            },
        },
    });
    // WHEN
    await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(hotswapMockSdkProvider.getLambdaApiWaiters()).toEqual(expect.objectContaining({
        updateFunctionCodeToFinish: expect.objectContaining({
            name: 'UpdateFunctionCodeToFinish',
            delay: 1,
        }),
    }));
});
test('calls getFunction() after function code is updated on a VPC function with delay 5', async () => {
    // GIVEN
    mockUpdateLambdaCode = jest.fn().mockReturnValue({
        VpcConfig: {
            VpcId: 'abc',
        },
    });
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        tagResource: mockTagResource,
        untagResource: mockUntagResource,
    });
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
            },
        },
    });
    // WHEN
    await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(hotswapMockSdkProvider.getLambdaApiWaiters()).toEqual(expect.objectContaining({
        updateFunctionCodeToFinish: expect.objectContaining({
            name: 'UpdateFunctionCodeToFinish',
            delay: 5,
        }),
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLWZ1bmN0aW9ucy1ob3Rzd2FwLWRlcGxveW1lbnRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsYW1iZGEtZnVuY3Rpb25zLWhvdHN3YXAtZGVwbG95bWVudHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDhDQUE4QztBQUU5QyxJQUFJLG9CQUE0RyxDQUFDO0FBQ2pILElBQUksZUFBZ0UsQ0FBQztBQUNyRSxJQUFJLGlCQUFvRSxDQUFDO0FBQ3pFLElBQUksZUFBbUYsQ0FBQztBQUN4RixJQUFJLHNCQUFvRCxDQUFDO0FBRXpELFVBQVUsQ0FBQyxHQUFHLEVBQUU7SUFDZCxzQkFBc0IsR0FBRyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNuRCxvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDNUIsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzlCLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNsQyxRQUFRLEVBQUUsRUFBRTtRQUNaLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDO0tBQ3ZCLENBQUMsQ0FBQztJQUNILHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsV0FBVyxFQUFFLGVBQWU7UUFDNUIsYUFBYSxFQUFFLGlCQUFpQjtLQUNqQyxFQUFFO1FBQ0QsV0FBVyxFQUFFLGVBQWU7S0FDN0IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsb0VBQW9FLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDcEYsUUFBUTtJQUNSLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtpQkFDOUI7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUM1QyxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQywrRkFBK0YsRUFBRSxLQUFLLElBQUksRUFBRTtJQUMvRyxRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxhQUFhO3FCQUNyQjtvQkFDRCxZQUFZLEVBQUUsYUFBYTtpQkFDNUI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM5QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxZQUFZLEVBQUUsYUFBYTtRQUMzQixRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHlGQUF5RixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3pHLFFBQVE7SUFDUixNQUFNLGVBQWUsR0FBRztRQUN0QixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRTt3QkFDSixRQUFRLEVBQUUsZ0JBQWdCO3dCQUMxQixLQUFLLEVBQUUsYUFBYTtxQkFDckI7b0JBQ0QsWUFBWSxFQUFFLGFBQWE7b0JBQzNCLElBQUksRUFBRTt3QkFDSjs0QkFDRSxHQUFHLEVBQUUsZUFBZTs0QkFDcEIsS0FBSyxFQUFFLFNBQVM7eUJBQ2pCO3dCQUNEOzRCQUNFLEdBQUcsRUFBRSxlQUFlOzRCQUNwQixLQUFLLEVBQUUsbUJBQW1CO3lCQUMzQjtxQkFDRjtpQkFDRjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtpQkFDN0I7YUFDRjtTQUNGO0tBQ0YsQ0FBQztJQUVGLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNsRCxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLGFBQWE7eUJBQ3JCO3dCQUNELFlBQVksRUFBRSxhQUFhO3dCQUMzQixJQUFJLEVBQUU7NEJBQ0o7Z0NBQ0UsR0FBRyxFQUFFLGVBQWU7Z0NBQ3BCLEtBQUssRUFBRSxlQUFlOzZCQUN2Qjs0QkFDRDtnQ0FDRSxHQUFHLEVBQUUsYUFBYTtnQ0FDbEIsS0FBSyxFQUFFLGlCQUFpQjs2QkFDekI7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRTlDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQzdDLFFBQVEsRUFBRSx1REFBdUQ7UUFDakUsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDO0tBQzNCLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUMzQyxRQUFRLEVBQUUsdURBQXVEO1FBQ2pFLElBQUksRUFBRTtZQUNKLGVBQWUsRUFBRSxlQUFlO1lBQ2hDLGFBQWEsRUFBRSxpQkFBaUI7U0FDakM7S0FDRixDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtR0FBbUcsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNuSCxRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsaUJBQWlCO2FBQ3hCO1lBQ0QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLGdCQUFnQjt3QkFDMUIsS0FBSyxFQUFFLGFBQWE7cUJBQ3JCO29CQUNELFlBQVksRUFBRTt3QkFDWixVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUU7Z0NBQ2hCLFFBQVE7Z0NBQ1IsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFO2dDQUNqQixVQUFVOzZCQUNYLENBQUM7cUJBQ0g7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxNQUFNLEVBQUU7b0JBQ04sSUFBSSxFQUFFLGlCQUFpQjtpQkFDeEI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLFNBQVM7eUJBQ2pCO3dCQUNELFlBQVksRUFBRTs0QkFDWixVQUFVLEVBQUUsQ0FBQyxHQUFHLEVBQUU7b0NBQ2hCLFFBQVE7b0NBQ1IsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFO29DQUNqQixVQUFVO2lDQUNYLENBQUM7eUJBQ0g7cUJBQ0Y7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ2hELFlBQVksRUFBRSwwQkFBMEI7UUFDeEMsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxtSEFBbUgsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNuSSxRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFVBQVUsRUFBRTtZQUNWLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDMUIsZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1NBQ3JDO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFO3dCQUNyQyxLQUFLLEVBQUUsYUFBYTtxQkFDckI7b0JBQ0QsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRTtpQkFDaEM7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQ3ZHLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFVBQVUsRUFBRTtnQkFDVixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2dCQUMxQixnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7YUFDckM7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFOzRCQUNyQyxLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRTtxQkFDaEM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRXBJLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLGFBQWE7UUFDM0IsUUFBUSxFQUFFLGNBQWM7UUFDeEIsS0FBSyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsb0dBQW9HLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDcEgsUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixVQUFVLEVBQUU7WUFDVixNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1NBQzNCO1FBQ0QsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRTt3QkFDcEMsS0FBSyxFQUFFLGFBQWE7cUJBQ3JCO2lCQUNGO2dCQUNELFFBQVEsRUFBRTtvQkFDUixnQkFBZ0IsRUFBRSxVQUFVO2lCQUM3QjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUNuRyxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxRQUFRLEVBQUU7WUFDUixVQUFVLEVBQUU7Z0JBQ1YsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTthQUMzQjtZQUNELFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFOzRCQUNwQyxLQUFLLEVBQUUsU0FBUzt5QkFDakI7cUJBQ0Y7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDaEIsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FDOUQsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7QUFDeEYsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsMkhBQTJILEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDM0ksUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxNQUFNLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLGlCQUFpQjthQUN4QjtZQUNELElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFO3dCQUMxRCxLQUFLLEVBQUUsYUFBYTtxQkFDckI7aUJBQ0Y7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQywwQkFBMEIsQ0FDOUIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLEVBQ2hFLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUMvRCxDQUFDO0lBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULE1BQU0sRUFBRTtvQkFDTixJQUFJLEVBQUUsaUJBQWlCO2lCQUN4QjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsRUFBRTs0QkFDMUQsS0FBSyxFQUFFLFNBQVM7eUJBQ2pCO3FCQUNGO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ2hCLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQzlELENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxxTEFBcUwsQ0FBQyxDQUFDO0FBQzNNLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHVHQUF1RyxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3ZILFFBQVE7SUFDUixLQUFLLENBQUMsMEJBQTBCLENBQUM7UUFDL0IsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLGdCQUFnQjt3QkFDMUIsS0FBSyxFQUFFLGFBQWE7cUJBQ3JCO2lCQUNGO2dCQUNELFFBQVEsRUFBRTtvQkFDUixnQkFBZ0IsRUFBRSxjQUFjO2lCQUNqQzthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFDSCxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLFNBQVM7eUJBQ2pCO3FCQUNGO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxjQUFjO3FCQUNqQztpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsS0FBSyxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLDJCQUEyQixDQUFDLENBQUMsQ0FBQztJQUNySCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ2hELFlBQVksRUFBRSwyQkFBMkI7UUFDekMsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyx1SEFBdUgsRUFBRSxLQUFLLElBQUksRUFBRTtJQUN2SSxRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxhQUFhO3FCQUNyQjtvQkFDRCxXQUFXLEVBQUUsS0FBSztpQkFDbkI7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxXQUFXLEVBQUUsT0FBTztxQkFDckI7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMxQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyw2SUFBNkksRUFBRSxLQUFLLElBQUksRUFBRTtJQUM3SixRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsOEJBQThCO2dCQUNwQyxVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxhQUFhO3FCQUNyQjtpQkFDRjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtpQkFDN0I7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsOEJBQThCO29CQUNwQyxVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxTQUFTO3lCQUNqQjtxQkFDRjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtxQkFDN0I7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUMxQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUN0RCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxpRUFBaUUsRUFBRSxLQUFLLElBQUksRUFBRTtJQUNqRixRQUFRO0lBQ1IsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxhQUFhO3FCQUNyQjtvQkFDRCxZQUFZLEVBQUUsYUFBYTtpQkFDNUI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXBFLE9BQU87SUFDUCxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsb0JBQW9CLENBQUMsYUFBYSxFQUFFLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDN0YsTUFBTSxDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQ25GLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNsRCxJQUFJLEVBQUUsNEJBQTRCO1lBQ2xDLEtBQUssRUFBRSxDQUFDO1NBQ1QsQ0FBQztLQUNILENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsMkZBQTJGLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDM0csUUFBUTtJQUNSLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDL0MsU0FBUyxFQUFFO1lBQ1QsS0FBSyxFQUFFLEVBQUU7U0FDVjtLQUNGLENBQUMsQ0FBQztJQUNILHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsV0FBVyxFQUFFLGVBQWU7UUFDNUIsYUFBYSxFQUFFLGlCQUFpQjtLQUNqQyxDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQUM7UUFDL0IsU0FBUyxFQUFFO1lBQ1QsSUFBSSxFQUFFO2dCQUNKLElBQUksRUFBRSx1QkFBdUI7Z0JBQzdCLFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUU7d0JBQ0osUUFBUSxFQUFFLGdCQUFnQjt3QkFDMUIsS0FBSyxFQUFFLGFBQWE7cUJBQ3JCO29CQUNELFlBQVksRUFBRSxhQUFhO2lCQUM1QjtnQkFDRCxRQUFRLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtpQkFDN0I7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7UUFDaEQsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxTQUFTO3lCQUNqQjt3QkFDRCxZQUFZLEVBQUUsYUFBYTtxQkFDNUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFcEUsT0FBTztJQUNQLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNuRiwwQkFBMEIsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUM7WUFDbEQsSUFBSSxFQUFFLDRCQUE0QjtZQUNsQyxLQUFLLEVBQUUsQ0FBQztTQUNULENBQUM7S0FDSCxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLG1GQUFtRixFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ25HLFFBQVE7SUFDUixvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQy9DLFNBQVMsRUFBRTtZQUNULEtBQUssRUFBRSxLQUFLO1NBQ2I7S0FDRixDQUFDLENBQUM7SUFDSCxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLFdBQVcsRUFBRSxlQUFlO1FBQzVCLGFBQWEsRUFBRSxpQkFBaUI7S0FDakMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLDBCQUEwQixDQUFDO1FBQy9CLFNBQVMsRUFBRTtZQUNULElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsdUJBQXVCO2dCQUM3QixVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFO3dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7d0JBQzFCLEtBQUssRUFBRSxhQUFhO3FCQUNyQjtvQkFDRCxZQUFZLEVBQUUsYUFBYTtpQkFDNUI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNSLGdCQUFnQixFQUFFLFVBQVU7aUJBQzdCO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUNILE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQ2hELFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXBFLE9BQU87SUFDUCxNQUFNLENBQUMsc0JBQXNCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDbkYsMEJBQTBCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ2xELElBQUksRUFBRSw0QkFBNEI7WUFDbEMsS0FBSyxFQUFFLENBQUM7U0FDVCxDQUFDO0tBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExhbWJkYSB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgc2V0dXAgZnJvbSAnLi9ob3Rzd2FwLXRlc3Qtc2V0dXAnO1xuXG5sZXQgbW9ja1VwZGF0ZUxhbWJkYUNvZGU6IChwYXJhbXM6IExhbWJkYS5UeXBlcy5VcGRhdGVGdW5jdGlvbkNvZGVSZXF1ZXN0KSA9PiBMYW1iZGEuVHlwZXMuRnVuY3Rpb25Db25maWd1cmF0aW9uO1xubGV0IG1vY2tUYWdSZXNvdXJjZTogKHBhcmFtczogTGFtYmRhLlR5cGVzLlRhZ1Jlc291cmNlUmVxdWVzdCkgPT4ge307XG5sZXQgbW9ja1VudGFnUmVzb3VyY2U6IChwYXJhbXM6IExhbWJkYS5UeXBlcy5VbnRhZ1Jlc291cmNlUmVxdWVzdCkgPT4ge307XG5sZXQgbW9ja01ha2VSZXF1ZXN0OiAob3BlcmF0aW9uOiBzdHJpbmcsIHBhcmFtczogYW55KSA9PiBBV1MuUmVxdWVzdDxhbnksIEFXUy5BV1NFcnJvcj47XG5sZXQgaG90c3dhcE1vY2tTZGtQcm92aWRlcjogc2V0dXAuSG90c3dhcE1vY2tTZGtQcm92aWRlcjtcblxuYmVmb3JlRWFjaCgoKSA9PiB7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIgPSBzZXR1cC5zZXR1cEhvdHN3YXBUZXN0cygpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBtb2NrVGFnUmVzb3VyY2UgPSBqZXN0LmZuKCk7XG4gIG1vY2tVbnRhZ1Jlc291cmNlID0gamVzdC5mbigpO1xuICBtb2NrTWFrZVJlcXVlc3QgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHtcbiAgICBwcm9taXNlOiAoKSA9PiBQcm9taXNlLnJlc29sdmUoe30pLFxuICAgIHJlc3BvbnNlOiB7fSxcbiAgICBhZGRMaXN0ZW5lcnM6ICgpID0+IHt9LFxuICB9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViTGFtYmRhKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGU6IG1vY2tVcGRhdGVMYW1iZGFDb2RlLFxuICAgIHRhZ1Jlc291cmNlOiBtb2NrVGFnUmVzb3VyY2UsXG4gICAgdW50YWdSZXNvdXJjZTogbW9ja1VudGFnUmVzb3VyY2UsXG4gIH0sIHtcbiAgICBtYWtlUmVxdWVzdDogbW9ja01ha2VSZXF1ZXN0LFxuICB9KTtcbn0pO1xuXG50ZXN0KCdyZXR1cm5zIHVuZGVmaW5lZCB3aGVuIGEgbmV3IExhbWJkYSBmdW5jdGlvbiBpcyBhZGRlZCB0byB0aGUgU3RhY2snLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xufSk7XG5cbnRlc3QoJ2NhbGxzIHRoZSB1cGRhdGVMYW1iZGFDb2RlKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhIGNvZGUgZGlmZmVyZW5jZSBpbiBhIExhbWJkYSBmdW5jdGlvbicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgdGFnUmVzb3VyY2UoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBvbmx5IGEgdGFnIGRpZmZlcmVuY2UgaW4gYSBMYW1iZGEgZnVuY3Rpb24nLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIGNvbnN0IGN1cnJlbnRUZW1wbGF0ZSA9IHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIFRhZ3M6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgS2V5OiAndG8tYmUtZGVsZXRlZCcsXG4gICAgICAgICAgICAgIFZhbHVlOiAnYS12YWx1ZScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBLZXk6ICd0by1iZS1jaGFuZ2VkJyxcbiAgICAgICAgICAgICAgVmFsdWU6ICdjdXJyZW50LXRhZy12YWx1ZScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZShjdXJyZW50VGVtcGxhdGUpO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgICBUYWdzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBLZXk6ICd0by1iZS1jaGFuZ2VkJyxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ25ldy10YWctdmFsdWUnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgS2V5OiAndG8tYmUtYWRkZWQnLFxuICAgICAgICAgICAgICAgIFZhbHVlOiAnYWRkZWQtdGFnLXZhbHVlJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcblxuICBleHBlY3QobW9ja1VudGFnUmVzb3VyY2UpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBSZXNvdXJjZTogJ2Fybjphd3M6bGFtYmRhOmhlcmU6MTIzNDU2Nzg5MDEyOmZ1bmN0aW9uOm15LWZ1bmN0aW9uJyxcbiAgICBUYWdLZXlzOiBbJ3RvLWJlLWRlbGV0ZWQnXSxcbiAgfSk7XG5cbiAgZXhwZWN0KG1vY2tUYWdSZXNvdXJjZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIFJlc291cmNlOiAnYXJuOmF3czpsYW1iZGE6aGVyZToxMjM0NTY3ODkwMTI6ZnVuY3Rpb246bXktZnVuY3Rpb24nLFxuICAgIFRhZ3M6IHtcbiAgICAgICd0by1iZS1jaGFuZ2VkJzogJ25ldy10YWctdmFsdWUnLFxuICAgICAgJ3RvLWJlLWFkZGVkJzogJ2FkZGVkLXRhZy12YWx1ZScsXG4gICAgfSxcbiAgfSk7XG5cbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoXCJjb3JyZWN0bHkgZXZhbHVhdGVzIHRoZSBmdW5jdGlvbidzIG5hbWUgd2hlbiBpdCByZWZlcmVuY2VzIGEgZGlmZmVyZW50IHJlc291cmNlIGZyb20gdGhlIHRlbXBsYXRlXCIsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQnVja2V0OiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OlMzOjpCdWNrZXQnLFxuICAgICAgfSxcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiB7XG4gICAgICAgICAgICAnRm46OkpvaW4nOiBbJy0nLCBbXG4gICAgICAgICAgICAgICdsYW1iZGEnLFxuICAgICAgICAgICAgICB7IFJlZjogJ0J1Y2tldCcgfSxcbiAgICAgICAgICAgICAgJ2Z1bmN0aW9uJyxcbiAgICAgICAgICAgIF1dLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIHNldHVwLnB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHNldHVwLnN0YWNrU3VtbWFyeU9mKCdCdWNrZXQnLCAnQVdTOjpTMzo6QnVja2V0JywgJ215YnVja2V0JykpO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEJ1Y2tldDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OlMzOjpCdWNrZXQnLFxuICAgICAgICB9LFxuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHtcbiAgICAgICAgICAgICAgJ0ZuOjpKb2luJzogWyctJywgW1xuICAgICAgICAgICAgICAgICdsYW1iZGEnLFxuICAgICAgICAgICAgICAgIHsgUmVmOiAnQnVja2V0JyB9LFxuICAgICAgICAgICAgICAgICdmdW5jdGlvbicsXG4gICAgICAgICAgICAgIF1dLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdsYW1iZGEtbXlidWNrZXQtZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgIFMzS2V5OiAnbmV3LWtleScsXG4gIH0pO1xufSk7XG5cbnRlc3QoXCJjb3JyZWN0bHkgZmFsbHMgYmFjayB0byB0YWtpbmcgdGhlIGZ1bmN0aW9uJ3MgbmFtZSBmcm9tIHRoZSBjdXJyZW50IHN0YWNrIGlmIGl0IGNhbid0IGV2YWx1YXRlIGl0IGluIHRoZSB0ZW1wbGF0ZVwiLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBQYXJhbWV0ZXJzOiB7XG4gICAgICBQYXJhbTE6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgIEFzc2V0QnVja2V0UGFyYW06IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICB9LFxuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiB7IFJlZjogJ0Fzc2V0QnVja2V0UGFyYW0nIH0sXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogeyBSZWY6ICdQYXJhbTEnIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIHNldHVwLnB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHNldHVwLnN0YWNrU3VtbWFyeU9mKCdGdW5jJywgJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsICdteS1mdW5jdGlvbicpKTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgICAgUGFyYW0xOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgICAgIEFzc2V0QnVja2V0UGFyYW06IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6IHsgUmVmOiAnQXNzZXRCdWNrZXRQYXJhbScgfSxcbiAgICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHsgUmVmOiAnUGFyYW0xJyB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCwgeyBBc3NldEJ1Y2tldFBhcmFtOiAnYXNzZXQtYnVja2V0JyB9KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnYXNzZXQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbn0pO1xuXG50ZXN0KFwid2lsbCBub3QgcGVyZm9ybSBhIGhvdHN3YXAgZGVwbG95bWVudCBpZiBpdCBjYW5ub3QgZmluZCBhIFJlZiB0YXJnZXQgKG91dHNpZGUgdGhlIGZ1bmN0aW9uJ3MgbmFtZSlcIiwgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUGFyYW1ldGVyczoge1xuICAgICAgUGFyYW0xOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgfSxcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBTM0J1Y2tldDogeyAnRm46OlN1Yic6ICcke1BhcmFtMX0nIH0sXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBzZXR1cC5wdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzZXR1cC5zdGFja1N1bW1hcnlPZignRnVuYycsICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAnbXktZnVuYycpKTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgICAgUGFyYW0xOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgICB9LFxuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiB7ICdGbjo6U3ViJzogJyR7UGFyYW0xfScgfSxcbiAgICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGF3YWl0IGV4cGVjdCgoKSA9PlxuICAgIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCksXG4gICkucmVqZWN0cy50b1Rocm93KC9QYXJhbWV0ZXIgb3IgcmVzb3VyY2UgJ1BhcmFtMScgY291bGQgbm90IGJlIGZvdW5kIGZvciBldmFsdWF0aW9uLyk7XG59KTtcblxudGVzdChcIndpbGwgbm90IHBlcmZvcm0gYSBob3Rzd2FwIGRlcGxveW1lbnQgaWYgaXQgZG9lc24ndCBrbm93IGhvdyB0byBoYW5kbGUgYSBzcGVjaWZpYyBhdHRyaWJ1dGUgKG91dHNpZGUgdGhlIGZ1bmN0aW9uJ3MgbmFtZSlcIiwgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBCdWNrZXQ6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6UzM6OkJ1Y2tldCcsXG4gICAgICB9LFxuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiB7ICdGbjo6R2V0QXR0JzogWydCdWNrZXQnLCAnVW5rbm93bkF0dHJpYnV0ZSddIH0sXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBzZXR1cC5wdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignRnVuYycsICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAnbXktZnVuYycpLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdCdWNrZXQnLCAnQVdTOjpTMzo6QnVja2V0JywgJ215LWJ1Y2tldCcpLFxuICApO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEJ1Y2tldDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OlMzOjpCdWNrZXQnLFxuICAgICAgICB9LFxuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogeyAnRm46OkdldEF0dCc6IFsnQnVja2V0JywgJ1Vua25vd25BdHRyaWJ1dGUnXSB9LFxuICAgICAgICAgICAgICBTM0tleTogJ25ldy1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgYXdhaXQgZXhwZWN0KCgpID0+XG4gICAgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KSxcbiAgKS5yZWplY3RzLnRvVGhyb3coXCJXZSBkb24ndCBzdXBwb3J0IHRoZSAnVW5rbm93bkF0dHJpYnV0ZScgYXR0cmlidXRlIG9mIHRoZSAnQVdTOjpTMzo6QnVja2V0JyByZXNvdXJjZS4gVGhpcyBpcyBhIENESyBsaW1pdGF0aW9uLiBQbGVhc2UgcmVwb3J0IGl0IGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9hd3MvYXdzLWNkay9pc3N1ZXMvbmV3L2Nob29zZVwiKTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgdXBkYXRlTGFtYmRhQ29kZSgpIEFQSSB3aGVuIGl0IHJlY2VpdmVzIGEgY29kZSBkaWZmZXJlbmNlIGluIGEgTGFtYmRhIGZ1bmN0aW9uIHdpdGggbm8gbmFtZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnY3VycmVudC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdjdXJyZW50LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgc2V0dXAucHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ0Z1bmMnLCAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywgJ21vY2stZnVuY3Rpb24tcmVzb3VyY2UtaWQnKSk7XG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbW9jay1mdW5jdGlvbi1yZXNvdXJjZS1pZCcsXG4gICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgUzNLZXk6ICduZXcta2V5JyxcbiAgfSk7XG59KTtcblxudGVzdCgnZG9lcyBub3QgY2FsbCB0aGUgdXBkYXRlTGFtYmRhQ29kZSgpIEFQSSB3aGVuIGl0IHJlY2VpdmVzIGEgY2hhbmdlIHRoYXQgaXMgbm90IGEgY29kZSBkaWZmZXJlbmNlIGluIGEgTGFtYmRhIGZ1bmN0aW9uJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBGdW5jOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFBhY2thZ2VUeXBlOiAnWmlwJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFBhY2thZ2VUeXBlOiAnSW1hZ2UnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdkb2VzIG5vdCBjYWxsIHRoZSB1cGRhdGVMYW1iZGFDb2RlKCkgQVBJIHdoZW4gYSByZXNvdXJjZSB3aXRoIHR5cGUgdGhhdCBpcyBub3QgQVdTOjpMYW1iZGE6OkZ1bmN0aW9uIGJ1dCBoYXMgdGhlIHNhbWUgcHJvcGVydGllcyBpcyBjaGFuZ2VkJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBGdW5jOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6Ok5vdExhbWJkYTo6Tm90QUZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Tm90TGFtYmRhOjpOb3RBRnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2NhbGxzIGdldEZ1bmN0aW9uKCkgYWZ0ZXIgZnVuY3Rpb24gY29kZSBpcyB1cGRhdGVkIHdpdGggZGVsYXkgMScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICduZXctcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KG1vY2tNYWtlUmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoJ2dldEZ1bmN0aW9uJywgeyBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicgfSk7XG4gIGV4cGVjdChob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLmdldExhbWJkYUFwaVdhaXRlcnMoKSkudG9FcXVhbChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlVG9GaW5pc2g6IGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICAgIG5hbWU6ICdVcGRhdGVGdW5jdGlvbkNvZGVUb0ZpbmlzaCcsXG4gICAgICBkZWxheTogMSxcbiAgICB9KSxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ2NhbGxzIGdldEZ1bmN0aW9uKCkgYWZ0ZXIgZnVuY3Rpb24gY29kZSBpcyB1cGRhdGVkIGFuZCBWcGNJZCBpcyBlbXB0eSBzdHJpbmcgd2l0aCBkZWxheSAxJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe1xuICAgIFZwY0NvbmZpZzoge1xuICAgICAgVnBjSWQ6ICcnLFxuICAgIH0sXG4gIH0pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gICAgdGFnUmVzb3VyY2U6IG1vY2tUYWdSZXNvdXJjZSxcbiAgICB1bnRhZ1Jlc291cmNlOiBtb2NrVW50YWdSZXNvdXJjZSxcbiAgfSk7XG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ25ldy1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLmdldExhbWJkYUFwaVdhaXRlcnMoKSkudG9FcXVhbChleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlVG9GaW5pc2g6IGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICAgIG5hbWU6ICdVcGRhdGVGdW5jdGlvbkNvZGVUb0ZpbmlzaCcsXG4gICAgICBkZWxheTogMSxcbiAgICB9KSxcbiAgfSkpO1xufSk7XG5cbnRlc3QoJ2NhbGxzIGdldEZ1bmN0aW9uKCkgYWZ0ZXIgZnVuY3Rpb24gY29kZSBpcyB1cGRhdGVkIG9uIGEgVlBDIGZ1bmN0aW9uIHdpdGggZGVsYXkgNScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgbW9ja1VwZGF0ZUxhbWJkYUNvZGUgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHtcbiAgICBWcGNDb25maWc6IHtcbiAgICAgIFZwY0lkOiAnYWJjJyxcbiAgICB9LFxuICB9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViTGFtYmRhKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGU6IG1vY2tVcGRhdGVMYW1iZGFDb2RlLFxuICAgIHRhZ1Jlc291cmNlOiBtb2NrVGFnUmVzb3VyY2UsXG4gICAgdW50YWdSZXNvdXJjZTogbW9ja1VudGFnUmVzb3VyY2UsXG4gIH0pO1xuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBGdW5jOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICduZXcta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoaG90c3dhcE1vY2tTZGtQcm92aWRlci5nZXRMYW1iZGFBcGlXYWl0ZXJzKCkpLnRvRXF1YWwoZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZVRvRmluaXNoOiBleHBlY3Qub2JqZWN0Q29udGFpbmluZyh7XG4gICAgICBuYW1lOiAnVXBkYXRlRnVuY3Rpb25Db2RlVG9GaW5pc2gnLFxuICAgICAgZGVsYXk6IDUsXG4gICAgfSksXG4gIH0pKTtcbn0pO1xuIl19