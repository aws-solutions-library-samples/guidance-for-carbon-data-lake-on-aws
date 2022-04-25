"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const setup = require("./hotswap-test-setup");
let mockUpdateLambdaCode;
let mockPublishVersion;
let hotswapMockSdkProvider;
test('can hotswap a lambda function in a 1-level nested stack', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('LambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'LambdaRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack.nested.template.json',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('LambdaRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    const cdkStackArtifact = util_1.testStack({ stackName: 'LambdaRoot', template: rootStack.template });
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
test('hotswappable changes do not override hotswappable changes in their ancestors', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('TwoLevelLambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'TwoLevelLambdaRoot',
        template: {
            Resources: {
                ChildStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-one-stack-stack.nested.template.json',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'ChildStack',
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'child-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
                GrandChildStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack.nested.template.json',
                    },
                },
            },
        },
    }));
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'GrandChildStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('TwoLevelLambdaRoot', setup.stackSummaryOf('ChildStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/ChildStack/abcd'));
    setup.pushNestedStackResourceSummaries('ChildStack', setup.stackSummaryOf('GrandChildStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/GrandChildStack/abcd'));
    const cdkStackArtifact = util_1.testStack({ stackName: 'TwoLevelLambdaRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'child-function',
        S3Bucket: 'new-bucket',
        S3Key: 'current-key',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('hotswappable changes in nested stacks do not override hotswappable changes in their parent stack', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('SiblingLambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'SiblingLambdaRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack.nested.template.json',
                    },
                },
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'root-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('SiblingLambdaRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    rootStack.template.Resources.Func.Properties.Code.S3Bucket = 'new-bucket';
    const cdkStackArtifact = util_1.testStack({ stackName: 'SiblingLambdaRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'root-function',
        S3Bucket: 'new-bucket',
        S3Key: 'current-key',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('non-hotswappable changes in nested stacks result in a full deployment, even if their parent contains a hotswappable change', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('NonHotswappableRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'NonHotswappableRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack.nested.template.json',
                    },
                },
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'root-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
                        FunctionName: 'my-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('NonHotswappableRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    rootStack.template.Resources.Func.Properties.Code.S3Bucket = 'new-bucket';
    const cdkStackArtifact = util_1.testStack({ stackName: 'NonHotswappableRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('deleting a nested stack results in a full deployment, even if their parent contains a hotswappable change', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('NestedStackDeletionRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'NestedStackDeletionRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack.nested.template.json',
                    },
                },
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'root-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('NestedStackDeletionRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    rootStack.template.Resources.Func.Properties.Code.S3Bucket = 'new-bucket';
    delete rootStack.template.Resources.NestedStack;
    const cdkStackArtifact = util_1.testStack({ stackName: 'NestedStackDeletionRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('creating a nested stack results in a full deployment, even if their parent contains a hotswappable change', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('NestedStackCreationRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'NestedStackCreationRoot',
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'root-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    rootStack.template.Resources.Func.Properties.Code.S3Bucket = 'new-bucket';
    rootStack.template.Resources.NestedStack = {
        Type: 'AWS::CloudFormation::Stack',
        Properties: {
            TemplateURL: 'https://www.magic-url.com',
        },
        Metadata: {
            'aws:asset:path': 'one-lambda-stack.nested.template.json',
        },
    };
    const cdkStackArtifact = util_1.testStack({ stackName: 'NestedStackCreationRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('attempting to hotswap a newly created nested stack with the same logical ID as a resource with a different type results in a full deployment', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('NestedStackTypeChangeRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'NestedStackTypeChangeRoot',
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'current-key',
                        },
                        FunctionName: 'root-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
                FutureNestedStack: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            S3Bucket: 'current-bucket',
                            S3Key: 'new-key',
                        },
                        FunctionName: 'spooky-function',
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    rootStack.template.Resources.Func.Properties.Code.S3Bucket = 'new-bucket';
    rootStack.template.Resources.FutureNestedStack = {
        Type: 'AWS::CloudFormation::Stack',
        Properties: {
            TemplateURL: 'https://www.magic-url.com',
        },
        Metadata: {
            'aws:asset:path': 'one-lambda-stack.nested.template.json',
        },
    };
    const cdkStackArtifact = util_1.testStack({ stackName: 'NestedStackTypeChangeRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateLambdaCode).not.toHaveBeenCalled();
});
test('multi-sibling + 3-layer nested stack structure is hotswappable', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('MultiLayerRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const lambdaFunctionResource = {
        Type: 'AWS::Lambda::Function',
        Properties: {
            Code: {
                S3Bucket: 'current-bucket',
                S3Key: 'current-key',
            },
        },
        Metadata: {
            'aws:asset:path': 'old-path',
        },
    };
    const rootStack = util_1.testStack({
        stackName: 'MultiLayerRoot',
        template: {
            Resources: {
                ChildStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-unnamed-lambda-two-stacks-stack.nested.template.json',
                    },
                },
                Func: lambdaFunctionResource,
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'ChildStack',
        template: {
            Resources: {
                GrandChildStackA: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-unnamed-lambda-stack.nested.template.json',
                    },
                },
                GrandChildStackB: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-unnamed-lambda-stack.nested.template.json',
                    },
                },
                Func: lambdaFunctionResource,
            },
        },
    }));
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'GrandChildStackA',
        template: {
            Resources: {
                Func: lambdaFunctionResource,
            },
        },
    }));
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'GrandChildStackB',
        template: {
            Resources: {
                Func: lambdaFunctionResource,
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('MultiLayerRoot', setup.stackSummaryOf('ChildStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/ChildStack/abcd'), setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'root-function'));
    setup.pushNestedStackResourceSummaries('ChildStack', setup.stackSummaryOf('GrandChildStackA', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/GrandChildStackA/abcd'), setup.stackSummaryOf('GrandChildStackB', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/GrandChildStackB/abcd'), setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'child-function'));
    setup.pushNestedStackResourceSummaries('GrandChildStackA', setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'grandchild-A-function'));
    setup.pushNestedStackResourceSummaries('GrandChildStackB', setup.stackSummaryOf('Func', 'AWS::Lambda::Function', 'grandchild-B-function'));
    rootStack.template.Resources.Func.Properties.Code.S3Key = 'new-key';
    const cdkStackArtifact = util_1.testStack({ stackName: 'MultiLayerRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'root-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'child-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'grandchild-A-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'grandchild-B-function',
        S3Bucket: 'current-bucket',
        S3Key: 'new-key',
    });
});
test('can hotswap a lambda function in a 1-level nested stack with asset parameters', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('LambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'LambdaRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                        Parameters: {
                            referencetoS3BucketParam: {
                                Ref: 'S3BucketParam',
                            },
                            referencetoS3KeyParam: {
                                Ref: 'S3KeyParam',
                            },
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack-with-asset-parameters.nested.template.json',
                    },
                },
            },
            Parameters: {
                S3BucketParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
                S3KeyParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('LambdaRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    const cdkStackArtifact = util_1.testStack({ stackName: 'LambdaRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact, {
        S3BucketParam: 'bucket-param-value',
        S3KeyParam: 'key-param-value',
    });
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'bucket-param-value',
        S3Key: 'key-param-value',
    });
});
test('can hotswap a lambda function in a 2-level nested stack with asset parameters', async () => {
    // GIVEN
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('LambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
    });
    const rootStack = util_1.testStack({
        stackName: 'LambdaRoot',
        template: {
            Resources: {
                ChildStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                        Parameters: {
                            referencetoGrandChildS3BucketParam: {
                                Ref: 'GrandChildS3BucketParam',
                            },
                            referencetoGrandChildS3KeyParam: {
                                Ref: 'GrandChildS3KeyParam',
                            },
                            referencetoChildS3BucketParam: {
                                Ref: 'ChildS3BucketParam',
                            },
                            referencetoChildS3KeyParam: {
                                Ref: 'ChildS3KeyParam',
                            },
                        },
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-one-stack-stack-with-asset-parameters.nested.template.json',
                    },
                },
            },
            Parameters: {
                GrandChildS3BucketParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
                GrandChildS3KeyParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
                ChildS3BucketParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
                ChildS3KeyParam: {
                    Type: 'String',
                    Description: 'S3 bucket for asset',
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'ChildStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
                GrandChildStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-stack-with-asset-parameters.nested.template.json',
                    },
                },
            },
        },
    }));
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'GrandChildStack',
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
                    },
                    Metadata: {
                        'aws:asset:path': 'old-path',
                    },
                },
            },
        },
    }));
    setup.pushNestedStackResourceSummaries('LambdaRoot', setup.stackSummaryOf('ChildStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/ChildStack/abcd'));
    setup.pushNestedStackResourceSummaries('ChildStack', setup.stackSummaryOf('GrandChildStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/GrandChildStack/abcd'));
    const cdkStackArtifact = util_1.testStack({ stackName: 'LambdaRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact, {
        GrandChildS3BucketParam: 'child-bucket-param-value',
        GrandChildS3KeyParam: 'child-key-param-value',
        ChildS3BucketParam: 'bucket-param-value',
        ChildS3KeyParam: 'key-param-value',
    });
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'bucket-param-value',
        S3Key: 'key-param-value',
    });
    expect(mockUpdateLambdaCode).toHaveBeenCalledWith({
        FunctionName: 'my-function',
        S3Bucket: 'child-bucket-param-value',
        S3Key: 'child-key-param-value',
    });
});
test('looking up objects in nested stacks works', async () => {
    hotswapMockSdkProvider = setup.setupHotswapNestedStackTests('LambdaRoot');
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    mockPublishVersion = jest.fn();
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        publishVersion: mockPublishVersion,
    });
    const rootStack = util_1.testStack({
        stackName: 'LambdaRoot',
        template: {
            Resources: {
                NestedStack: {
                    Type: 'AWS::CloudFormation::Stack',
                    Properties: {
                        TemplateURL: 'https://www.magic-url.com',
                    },
                    Metadata: {
                        'aws:asset:path': 'one-lambda-version-stack.nested.template.json',
                    },
                },
            },
        },
    });
    setup.addTemplateToCloudFormationLookupMock(rootStack);
    setup.addTemplateToCloudFormationLookupMock(util_1.testStack({
        stackName: 'NestedStack',
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
    }));
    setup.pushNestedStackResourceSummaries('LambdaRoot', setup.stackSummaryOf('NestedStack', 'AWS::CloudFormation::Stack', 'arn:aws:cloudformation:bermuda-triangle-1337:123456789012:stack/NestedStack/abcd'));
    const cdkStackArtifact = util_1.testStack({ stackName: 'LambdaRoot', template: rootStack.template });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockPublishVersion).toHaveBeenCalledWith({
        FunctionName: 'my-function',
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkLXN0YWNrcy1ob3Rzd2FwLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuZXN0ZWQtc3RhY2tzLWhvdHN3YXAudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUF1QztBQUN2Qyw4Q0FBOEM7QUFFOUMsSUFBSSxvQkFBNEcsQ0FBQztBQUNqSCxJQUFJLGtCQUEyRixDQUFDO0FBQ2hHLElBQUksc0JBQW9ELENBQUM7QUFFekQsSUFBSSxDQUFDLHlEQUF5RCxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3pFLFFBQVE7SUFDUixzQkFBc0IsR0FBRyxLQUFLLENBQUMsNEJBQTRCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUUsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO0tBQ3pDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUM7UUFDMUIsU0FBUyxFQUFFLFlBQVk7UUFDdkIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULFdBQVcsRUFBRTtvQkFDWCxJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxVQUFVLEVBQUU7d0JBQ1YsV0FBVyxFQUFFLDJCQUEyQjtxQkFDekM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLHVDQUF1QztxQkFDMUQ7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxnQkFBUyxDQUFDO1FBQ3BELFNBQVMsRUFBRSxhQUFhO1FBQ3hCLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsYUFBYTt5QkFDckI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUMsQ0FBQztJQUVKLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLEVBQ2pELEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLDRCQUE0QixFQUM5RCxrRkFBa0YsQ0FDbkYsQ0FDRixDQUFDO0lBRUYsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLGFBQWE7UUFDM0IsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyw4RUFBOEUsRUFBRSxLQUFLLElBQUksRUFBRTtJQUM5RixRQUFRO0lBQ1Isc0JBQXNCLEdBQUcsS0FBSyxDQUFDLDRCQUE0QixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDbEYsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO0tBQ3pDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUM7UUFDMUIsU0FBUyxFQUFFLG9CQUFvQjtRQUMvQixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsMkJBQTJCO3FCQUN6QztvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsaURBQWlEO3FCQUNwRTtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMscUNBQXFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLGdCQUFTLENBQUM7UUFDcEQsU0FBUyxFQUFFLFlBQVk7UUFDdkIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsZ0JBQWdCO3FCQUMvQjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtxQkFDN0I7aUJBQ0Y7Z0JBQ0QsZUFBZSxFQUFFO29CQUNmLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsMkJBQTJCO3FCQUN6QztvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsdUNBQXVDO3FCQUMxRDtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUMsQ0FBQztJQUNKLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxnQkFBUyxDQUFDO1FBQ3BELFNBQVMsRUFBRSxpQkFBaUI7UUFDNUIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsYUFBYTtxQkFDNUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosS0FBSyxDQUFDLGdDQUFnQyxDQUFDLG9CQUFvQixFQUN6RCxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSw0QkFBNEIsRUFDN0QsaUZBQWlGLENBQ2xGLENBQ0YsQ0FBQztJQUNGLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLEVBQ2pELEtBQUssQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsNEJBQTRCLEVBQ2xFLHNGQUFzRixDQUN2RixDQUNGLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFHLGdCQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXRHLE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ2hELFlBQVksRUFBRSxnQkFBZ0I7UUFDOUIsUUFBUSxFQUFFLFlBQVk7UUFDdEIsS0FBSyxFQUFFLGFBQWE7S0FDckIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLGFBQWE7UUFDM0IsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxrR0FBa0csRUFBRSxLQUFLLElBQUksRUFBRTtJQUNsSCxRQUFRO0lBQ1Isc0JBQXNCLEdBQUcsS0FBSyxDQUFDLDRCQUE0QixDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakYsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO0tBQ3pDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUM7UUFDMUIsU0FBUyxFQUFFLG1CQUFtQjtRQUM5QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsV0FBVyxFQUFFO29CQUNYLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsMkJBQTJCO3FCQUN6QztvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsdUNBQXVDO3FCQUMxRDtpQkFDRjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsYUFBYTt5QkFDckI7d0JBQ0QsWUFBWSxFQUFFLGVBQWU7cUJBQzlCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMscUNBQXFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLGdCQUFTLENBQUM7UUFDcEQsU0FBUyxFQUFFLGFBQWE7UUFDeEIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsYUFBYTtxQkFDNUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosS0FBSyxDQUFDLGdDQUFnQyxDQUFDLG1CQUFtQixFQUN4RCxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsRUFDOUQsa0ZBQWtGLENBQ25GLENBQ0YsQ0FBQztJQUVGLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7SUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUVyRyxPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM5QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxZQUFZLEVBQUUsZUFBZTtRQUM3QixRQUFRLEVBQUUsWUFBWTtRQUN0QixLQUFLLEVBQUUsYUFBYTtLQUNyQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxZQUFZLEVBQUUsYUFBYTtRQUMzQixRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDRIQUE0SCxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzVJLFFBQVE7SUFDUixzQkFBc0IsR0FBRyxLQUFLLENBQUMsNEJBQTRCLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNuRixvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7S0FDekMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQztRQUMxQixTQUFTLEVBQUUscUJBQXFCO1FBQ2hDLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxXQUFXLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDRCQUE0QjtvQkFDbEMsVUFBVSxFQUFFO3dCQUNWLFdBQVcsRUFBRSwyQkFBMkI7cUJBQ3pDO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSx1Q0FBdUM7cUJBQzFEO2lCQUNGO2dCQUNELElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsZUFBZTtxQkFDOUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMscUNBQXFDLENBQUMsZ0JBQVMsQ0FBQztRQUNwRCxTQUFTLEVBQUUsYUFBYTtRQUN4QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLGFBQWE7eUJBQ3JCO3dCQUNELFdBQVcsRUFBRSxPQUFPO3dCQUNwQixZQUFZLEVBQUUsYUFBYTtxQkFDNUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosS0FBSyxDQUFDLGdDQUFnQyxDQUFDLHFCQUFxQixFQUMxRCxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsRUFDOUQsa0ZBQWtGLENBQ25GLENBQ0YsQ0FBQztJQUVGLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7SUFDMUUsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUV2RyxPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDJHQUEyRyxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzNILFFBQVE7SUFDUixzQkFBc0IsR0FBRyxLQUFLLENBQUMsNEJBQTRCLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN2RixvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7S0FDekMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQztRQUMxQixTQUFTLEVBQUUseUJBQXlCO1FBQ3BDLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxXQUFXLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDRCQUE0QjtvQkFDbEMsVUFBVSxFQUFFO3dCQUNWLFdBQVcsRUFBRSwyQkFBMkI7cUJBQ3pDO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSx1Q0FBdUM7cUJBQzFEO2lCQUNGO2dCQUNELElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsZUFBZTtxQkFDOUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMscUNBQXFDLENBQUMsZ0JBQVMsQ0FBQztRQUNwRCxTQUFTLEVBQUUsYUFBYTtRQUN4QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLGFBQWE7eUJBQ3JCO3dCQUNELFlBQVksRUFBRSxhQUFhO3FCQUM1QjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtxQkFDN0I7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSixLQUFLLENBQUMsZ0NBQWdDLENBQUMseUJBQXlCLEVBQzlELEtBQUssQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLDRCQUE0QixFQUM5RCxrRkFBa0YsQ0FDbkYsQ0FDRixDQUFDO0lBRUYsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQztJQUMxRSxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUNoRCxNQUFNLGdCQUFnQixHQUFHLGdCQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRTNHLE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDMUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsMkdBQTJHLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDM0gsUUFBUTtJQUNSLHNCQUFzQixHQUFHLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3ZGLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtLQUN6QyxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxnQkFBUyxDQUFDO1FBQzFCLFNBQVMsRUFBRSx5QkFBeUI7UUFDcEMsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsZUFBZTtxQkFDOUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2RCxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0lBQzFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztRQUN6QyxJQUFJLEVBQUUsNEJBQTRCO1FBQ2xDLFVBQVUsRUFBRTtZQUNWLFdBQVcsRUFBRSwyQkFBMkI7U0FDekM7UUFDRCxRQUFRLEVBQUU7WUFDUixnQkFBZ0IsRUFBRSx1Q0FBdUM7U0FDMUQ7S0FDRixDQUFDO0lBQ0YsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLHlCQUF5QixFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUUzRyxPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3RELENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLDhJQUE4SSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQzlKLFFBQVE7SUFDUixzQkFBc0IsR0FBRyxLQUFLLENBQUMsNEJBQTRCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN6RixvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7S0FDekMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQztRQUMxQixTQUFTLEVBQUUsMkJBQTJCO1FBQ3RDLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsYUFBYTt5QkFDckI7d0JBQ0QsWUFBWSxFQUFFLGVBQWU7cUJBQzlCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjtnQkFDRCxpQkFBaUIsRUFBRTtvQkFDakIsSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsU0FBUzt5QkFDakI7d0JBQ0QsWUFBWSxFQUFFLGlCQUFpQjtxQkFDaEM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV2RCxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO0lBQzFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHO1FBQy9DLElBQUksRUFBRSw0QkFBNEI7UUFDbEMsVUFBVSxFQUFFO1lBQ1YsV0FBVyxFQUFFLDJCQUEyQjtTQUN6QztRQUNELFFBQVEsRUFBRTtZQUNSLGdCQUFnQixFQUFFLHVDQUF1QztTQUMxRDtLQUNGLENBQUM7SUFDRixNQUFNLGdCQUFnQixHQUFHLGdCQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsMkJBQTJCLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRTdHLE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDMUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDdEQsQ0FBQyxDQUFDLENBQUM7QUFHSCxJQUFJLENBQUMsZ0VBQWdFLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDaEYsUUFBUTtJQUNSLHNCQUFzQixHQUFHLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlFLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtLQUN6QyxDQUFDLENBQUM7SUFFSCxNQUFNLHNCQUFzQixHQUFHO1FBQzdCLElBQUksRUFBRSx1QkFBdUI7UUFDN0IsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFO2dCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLEtBQUssRUFBRSxhQUFhO2FBQ3JCO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUixnQkFBZ0IsRUFBRSxVQUFVO1NBQzdCO0tBQ0YsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUM7UUFDMUIsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsMkJBQTJCO3FCQUN6QztvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsMERBQTBEO3FCQUM3RTtpQkFDRjtnQkFDRCxJQUFJLEVBQUUsc0JBQXNCO2FBQzdCO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMscUNBQXFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLGdCQUFTLENBQUM7UUFDcEQsU0FBUyxFQUFFLFlBQVk7UUFDdkIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULGdCQUFnQixFQUFFO29CQUNoQixJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxVQUFVLEVBQUU7d0JBQ1YsV0FBVyxFQUFFLDJCQUEyQjtxQkFDekM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLCtDQUErQztxQkFDbEU7aUJBQ0Y7Z0JBQ0QsZ0JBQWdCLEVBQUU7b0JBQ2hCLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLFVBQVUsRUFBRTt3QkFDVixXQUFXLEVBQUUsMkJBQTJCO3FCQUN6QztvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsK0NBQStDO3FCQUNsRTtpQkFDRjtnQkFDRCxJQUFJLEVBQUUsc0JBQXNCO2FBQzdCO1NBQ0Y7S0FDRixDQUFDLENBQUMsQ0FBQztJQUNKLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxnQkFBUyxDQUFDO1FBQ3BELFNBQVMsRUFBRSxrQkFBa0I7UUFDN0IsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRSxzQkFBc0I7YUFDN0I7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osS0FBSyxDQUFDLHFDQUFxQyxDQUFDLGdCQUFTLENBQUM7UUFDcEQsU0FBUyxFQUFFLGtCQUFrQjtRQUM3QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLHNCQUFzQjthQUM3QjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSixLQUFLLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLEVBQ3JELEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLDRCQUE0QixFQUM3RCxpRkFBaUYsQ0FDbEYsRUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSx1QkFBdUIsRUFBRSxlQUFlLENBQUMsQ0FDdkUsQ0FBQztJQUNGLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLEVBQ2pELEtBQUssQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsNEJBQTRCLEVBQ25FLHVGQUF1RixDQUN4RixFQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsNEJBQTRCLEVBQ25FLHVGQUF1RixDQUN4RixFQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLGdCQUFnQixDQUFDLENBQ3hFLENBQUM7SUFDRixLQUFLLENBQUMsZ0NBQWdDLENBQUMsa0JBQWtCLEVBQ3ZELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixDQUFDLENBQy9FLENBQUM7SUFDRixLQUFLLENBQUMsZ0NBQWdDLENBQUMsa0JBQWtCLEVBQ3ZELEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixDQUFDLENBQy9FLENBQUM7SUFFRixTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0lBQ3BFLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFbEcsT0FBTztJQUNQLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLGVBQWU7UUFDN0IsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxZQUFZLEVBQUUsZ0JBQWdCO1FBQzlCLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsS0FBSyxFQUFFLFNBQVM7S0FDakIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLHVCQUF1QjtRQUNyQyxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ2hELFlBQVksRUFBRSx1QkFBdUI7UUFDckMsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNqQixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQywrRUFBK0UsRUFBRSxLQUFLLElBQUksRUFBRTtJQUMvRixRQUFRO0lBQ1Isc0JBQXNCLEdBQUcsS0FBSyxDQUFDLDRCQUE0QixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFFLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtLQUN6QyxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxnQkFBUyxDQUFDO1FBQzFCLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxXQUFXLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDRCQUE0QjtvQkFDbEMsVUFBVSxFQUFFO3dCQUNWLFdBQVcsRUFBRSwyQkFBMkI7d0JBQ3hDLFVBQVUsRUFBRTs0QkFDVix3QkFBd0IsRUFBRTtnQ0FDeEIsR0FBRyxFQUFFLGVBQWU7NkJBQ3JCOzRCQUNELHFCQUFxQixFQUFFO2dDQUNyQixHQUFHLEVBQUUsWUFBWTs2QkFDbEI7eUJBQ0Y7cUJBQ0Y7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLDZEQUE2RDtxQkFDaEY7aUJBQ0Y7YUFDRjtZQUNELFVBQVUsRUFBRTtnQkFDVixhQUFhLEVBQUU7b0JBQ2IsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLHFCQUFxQjtpQkFDbkM7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxxQkFBcUI7aUJBQ25DO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMscUNBQXFDLENBQUMsZ0JBQVMsQ0FBQztRQUNwRCxTQUFTLEVBQUUsYUFBYTtRQUN4QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLGFBQWE7eUJBQ3JCO3dCQUNELFlBQVksRUFBRSxhQUFhO3FCQUM1QjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsVUFBVTtxQkFDN0I7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSixLQUFLLENBQUMsZ0NBQWdDLENBQUMsWUFBWSxFQUNqRCxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSw0QkFBNEIsRUFDOUQsa0ZBQWtGLENBQ25GLENBQ0YsQ0FBQztJQUVGLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUU7UUFDNUYsYUFBYSxFQUFFLG9CQUFvQjtRQUNuQyxVQUFVLEVBQUUsaUJBQWlCO0tBQzlCLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDOUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsb0JBQW9CLENBQUM7UUFDaEQsWUFBWSxFQUFFLGFBQWE7UUFDM0IsUUFBUSxFQUFFLG9CQUFvQjtRQUM5QixLQUFLLEVBQUUsaUJBQWlCO0tBQ3pCLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLCtFQUErRSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQy9GLFFBQVE7SUFDUixzQkFBc0IsR0FBRyxLQUFLLENBQUMsNEJBQTRCLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUUsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO0tBQ3pDLENBQUMsQ0FBQztJQUVILE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUM7UUFDMUIsU0FBUyxFQUFFLFlBQVk7UUFDdkIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULFVBQVUsRUFBRTtvQkFDVixJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxVQUFVLEVBQUU7d0JBQ1YsV0FBVyxFQUFFLDJCQUEyQjt3QkFDeEMsVUFBVSxFQUFFOzRCQUNWLGtDQUFrQyxFQUFFO2dDQUNsQyxHQUFHLEVBQUUseUJBQXlCOzZCQUMvQjs0QkFDRCwrQkFBK0IsRUFBRTtnQ0FDL0IsR0FBRyxFQUFFLHNCQUFzQjs2QkFDNUI7NEJBQ0QsNkJBQTZCLEVBQUU7Z0NBQzdCLEdBQUcsRUFBRSxvQkFBb0I7NkJBQzFCOzRCQUNELDBCQUEwQixFQUFFO2dDQUMxQixHQUFHLEVBQUUsaUJBQWlCOzZCQUN2Qjt5QkFDRjtxQkFDRjtvQkFDRCxRQUFRLEVBQUU7d0JBQ1IsZ0JBQWdCLEVBQUUsdUVBQXVFO3FCQUMxRjtpQkFDRjthQUNGO1lBQ0QsVUFBVSxFQUFFO2dCQUNWLHVCQUF1QixFQUFFO29CQUN2QixJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUscUJBQXFCO2lCQUNuQztnQkFDRCxvQkFBb0IsRUFBRTtvQkFDcEIsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLHFCQUFxQjtpQkFDbkM7Z0JBQ0Qsa0JBQWtCLEVBQUU7b0JBQ2xCLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxxQkFBcUI7aUJBQ25DO2dCQUNELGVBQWUsRUFBRTtvQkFDZixJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUscUJBQXFCO2lCQUNuQzthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUM7SUFFSCxLQUFLLENBQUMscUNBQXFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLGdCQUFTLENBQUM7UUFDcEQsU0FBUyxFQUFFLFlBQVk7UUFDdkIsUUFBUSxFQUFFO1lBQ1IsU0FBUyxFQUFFO2dCQUNULElBQUksRUFBRTtvQkFDSixJQUFJLEVBQUUsdUJBQXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLFFBQVEsRUFBRSxnQkFBZ0I7NEJBQzFCLEtBQUssRUFBRSxhQUFhO3lCQUNyQjt3QkFDRCxZQUFZLEVBQUUsYUFBYTtxQkFDNUI7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLFVBQVU7cUJBQzdCO2lCQUNGO2dCQUNELGVBQWUsRUFBRTtvQkFDZixJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxVQUFVLEVBQUU7d0JBQ1YsV0FBVyxFQUFFLDJCQUEyQjtxQkFDekM7b0JBQ0QsUUFBUSxFQUFFO3dCQUNSLGdCQUFnQixFQUFFLDZEQUE2RDtxQkFDaEY7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixLQUFLLENBQUMscUNBQXFDLENBQUMsZ0JBQVMsQ0FBQztRQUNwRCxTQUFTLEVBQUUsaUJBQWlCO1FBQzVCLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxJQUFJLEVBQUU7b0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtvQkFDN0IsVUFBVSxFQUFFO3dCQUNWLElBQUksRUFBRTs0QkFDSixRQUFRLEVBQUUsZ0JBQWdCOzRCQUMxQixLQUFLLEVBQUUsYUFBYTt5QkFDckI7d0JBQ0QsWUFBWSxFQUFFLGFBQWE7cUJBQzVCO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSxVQUFVO3FCQUM3QjtpQkFDRjthQUNGO1NBQ0Y7S0FDRixDQUFDLENBQUMsQ0FBQztJQUdKLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLEVBQ2pELEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLDRCQUE0QixFQUM3RCxpRkFBaUYsQ0FDbEYsQ0FDRixDQUFDO0lBRUYsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLFlBQVksRUFDakQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSw0QkFBNEIsRUFDbEUsc0ZBQXNGLENBQ3ZGLENBQ0YsQ0FBQztJQUNGLE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRTlGLE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUU7UUFDNUYsdUJBQXVCLEVBQUUsMEJBQTBCO1FBQ25ELG9CQUFvQixFQUFFLHVCQUF1QjtRQUM3QyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsZUFBZSxFQUFFLGlCQUFpQjtLQUNuQyxDQUFDLENBQUM7SUFFSCxPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO1FBQ2hELFlBQVksRUFBRSxhQUFhO1FBQzNCLFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsS0FBSyxFQUFFLGlCQUFpQjtLQUN6QixDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNoRCxZQUFZLEVBQUUsYUFBYTtRQUMzQixRQUFRLEVBQUUsMEJBQTBCO1FBQ3BDLEtBQUssRUFBRSx1QkFBdUI7S0FDL0IsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDM0Qsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLDRCQUE0QixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFFLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQy9CLHNCQUFzQixDQUFDLFVBQVUsQ0FBQztRQUNoQyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsY0FBYyxFQUFFLGtCQUFrQjtLQUNuQyxDQUFDLENBQUM7SUFFSCxNQUFNLFNBQVMsR0FBRyxnQkFBUyxDQUFDO1FBQzFCLFNBQVMsRUFBRSxZQUFZO1FBQ3ZCLFFBQVEsRUFBRTtZQUNSLFNBQVMsRUFBRTtnQkFDVCxXQUFXLEVBQUU7b0JBQ1gsSUFBSSxFQUFFLDRCQUE0QjtvQkFDbEMsVUFBVSxFQUFFO3dCQUNWLFdBQVcsRUFBRSwyQkFBMkI7cUJBQ3pDO29CQUNELFFBQVEsRUFBRTt3QkFDUixnQkFBZ0IsRUFBRSwrQ0FBK0M7cUJBQ2xFO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxLQUFLLENBQUMscUNBQXFDLENBQUMsZ0JBQVMsQ0FBQztRQUNwRCxTQUFTLEVBQUUsYUFBYTtRQUN4QixRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSx1QkFBdUI7b0JBQzdCLFVBQVUsRUFBRTt3QkFDVixJQUFJLEVBQUU7NEJBQ0osUUFBUSxFQUFFLGdCQUFnQjs0QkFDMUIsS0FBSyxFQUFFLGFBQWE7eUJBQ3JCO3dCQUNELFlBQVksRUFBRSxhQUFhO3FCQUM1QjtpQkFDRjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsSUFBSSxFQUFFLHNCQUFzQjtvQkFDNUIsVUFBVSxFQUFFO3dCQUNWLFlBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7cUJBQzlCO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUosS0FBSyxDQUFDLGdDQUFnQyxDQUFDLFlBQVksRUFDakQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsNEJBQTRCLEVBQzlELGtGQUFrRixDQUNuRixDQUNGLENBQUM7SUFFRixNQUFNLGdCQUFnQixHQUFHLGdCQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM5QyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUM5QyxZQUFZLEVBQUUsYUFBYTtLQUM1QixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExhbWJkYSB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgdGVzdFN0YWNrIH0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQgKiBhcyBzZXR1cCBmcm9tICcuL2hvdHN3YXAtdGVzdC1zZXR1cCc7XG5cbmxldCBtb2NrVXBkYXRlTGFtYmRhQ29kZTogKHBhcmFtczogTGFtYmRhLlR5cGVzLlVwZGF0ZUZ1bmN0aW9uQ29kZVJlcXVlc3QpID0+IExhbWJkYS5UeXBlcy5GdW5jdGlvbkNvbmZpZ3VyYXRpb247XG5sZXQgbW9ja1B1Ymxpc2hWZXJzaW9uOiBqZXN0Lk1vY2s8TGFtYmRhLkZ1bmN0aW9uQ29uZmlndXJhdGlvbiwgTGFtYmRhLlB1Ymxpc2hWZXJzaW9uUmVxdWVzdFtdPjtcbmxldCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyOiBzZXR1cC5Ib3Rzd2FwTW9ja1Nka1Byb3ZpZGVyO1xuXG50ZXN0KCdjYW4gaG90c3dhcCBhIGxhbWJkYSBmdW5jdGlvbiBpbiBhIDEtbGV2ZWwgbmVzdGVkIHN0YWNrJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnTGFtYmRhUm9vdCcpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gIH0pO1xuXG4gIGNvbnN0IHJvb3RTdGFjayA9IHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTGFtYmRhUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBOZXN0ZWRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTmVzdGVkU3RhY2snLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pKTtcblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnTGFtYmRhUm9vdCcsXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ05lc3RlZFN0YWNrJywgJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICdhcm46YXdzOmNsb3VkZm9ybWF0aW9uOmJlcm11ZGEtdHJpYW5nbGUtMTMzNzoxMjM0NTY3ODkwMTI6c3RhY2svTmVzdGVkU3RhY2svYWJjZCcsXG4gICAgKSxcbiAgKTtcblxuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gdGVzdFN0YWNrKHsgc3RhY2tOYW1lOiAnTGFtYmRhUm9vdCcsIHRlbXBsYXRlOiByb290U3RhY2sudGVtcGxhdGUgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdob3Rzd2FwcGFibGUgY2hhbmdlcyBkbyBub3Qgb3ZlcnJpZGUgaG90c3dhcHBhYmxlIGNoYW5nZXMgaW4gdGhlaXIgYW5jZXN0b3JzJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnVHdvTGV2ZWxMYW1iZGFSb290Jyk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkxhbWJkYSh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlOiBtb2NrVXBkYXRlTGFtYmRhQ29kZSxcbiAgfSk7XG5cbiAgY29uc3Qgcm9vdFN0YWNrID0gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdUd29MZXZlbExhbWJkYVJvb3QnLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ2hpbGRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1vbmUtc3RhY2stc3RhY2submVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHNldHVwLmFkZFRlbXBsYXRlVG9DbG91ZEZvcm1hdGlvbkxvb2t1cE1vY2socm9vdFN0YWNrKTtcbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayh0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ0NoaWxkU3RhY2snLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ2NoaWxkLWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEdyYW5kQ2hpbGRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSkpO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnR3JhbmRDaGlsZFN0YWNrJyxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KSk7XG5cbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ1R3b0xldmVsTGFtYmRhUm9vdCcsXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ0NoaWxkU3RhY2snLCAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgJ2Fybjphd3M6Y2xvdWRmb3JtYXRpb246YmVybXVkYS10cmlhbmdsZS0xMzM3OjEyMzQ1Njc4OTAxMjpzdGFjay9DaGlsZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG4gIHNldHVwLnB1c2hOZXN0ZWRTdGFja1Jlc291cmNlU3VtbWFyaWVzKCdDaGlsZFN0YWNrJyxcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignR3JhbmRDaGlsZFN0YWNrJywgJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICdhcm46YXdzOmNsb3VkZm9ybWF0aW9uOmJlcm11ZGEtdHJpYW5nbGUtMTMzNzoxMjM0NTY3ODkwMTI6c3RhY2svR3JhbmRDaGlsZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ1R3b0xldmVsTGFtYmRhUm9vdCcsIHRlbXBsYXRlOiByb290U3RhY2sudGVtcGxhdGUgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ2NoaWxkLWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ25ldy1idWNrZXQnLFxuICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICB9KTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgIFMzS2V5OiAnbmV3LWtleScsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2hvdHN3YXBwYWJsZSBjaGFuZ2VzIGluIG5lc3RlZCBzdGFja3MgZG8gbm90IG92ZXJyaWRlIGhvdHN3YXBwYWJsZSBjaGFuZ2VzIGluIHRoZWlyIHBhcmVudCBzdGFjaycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcE5lc3RlZFN0YWNrVGVzdHMoJ1NpYmxpbmdMYW1iZGFSb290Jyk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkxhbWJkYSh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlOiBtb2NrVXBkYXRlTGFtYmRhQ29kZSxcbiAgfSk7XG5cbiAgY29uc3Qgcm9vdFN0YWNrID0gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdTaWJsaW5nTGFtYmRhUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBOZXN0ZWRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ3Jvb3QtZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTmVzdGVkU3RhY2snLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pKTtcblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnU2libGluZ0xhbWJkYVJvb3QnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdOZXN0ZWRTdGFjaycsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL05lc3RlZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgcm9vdFN0YWNrLnRlbXBsYXRlLlJlc291cmNlcy5GdW5jLlByb3BlcnRpZXMuQ29kZS5TM0J1Y2tldCA9ICduZXctYnVja2V0JztcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ1NpYmxpbmdMYW1iZGFSb290JywgdGVtcGxhdGU6IHJvb3RTdGFjay50ZW1wbGF0ZSB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAncm9vdC1mdW5jdGlvbicsXG4gICAgUzNCdWNrZXQ6ICduZXctYnVja2V0JyxcbiAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgfSk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdub24taG90c3dhcHBhYmxlIGNoYW5nZXMgaW4gbmVzdGVkIHN0YWNrcyByZXN1bHQgaW4gYSBmdWxsIGRlcGxveW1lbnQsIGV2ZW4gaWYgdGhlaXIgcGFyZW50IGNvbnRhaW5zIGEgaG90c3dhcHBhYmxlIGNoYW5nZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcE5lc3RlZFN0YWNrVGVzdHMoJ05vbkhvdHN3YXBwYWJsZVJvb3QnKTtcbiAgbW9ja1VwZGF0ZUxhbWJkYUNvZGUgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViTGFtYmRhKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGU6IG1vY2tVcGRhdGVMYW1iZGFDb2RlLFxuICB9KTtcblxuICBjb25zdCByb290U3RhY2sgPSB0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ05vbkhvdHN3YXBwYWJsZVJvb3QnLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgTmVzdGVkU3RhY2s6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFRlbXBsYXRlVVJMOiAnaHR0cHM6Ly93d3cubWFnaWMtdXJsLmNvbScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29uZS1sYW1iZGEtc3RhY2submVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdyb290LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHNldHVwLmFkZFRlbXBsYXRlVG9DbG91ZEZvcm1hdGlvbkxvb2t1cE1vY2socm9vdFN0YWNrKTtcbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayh0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ05lc3RlZFN0YWNrJyxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBQYWNrYWdlVHlwZTogJ0ltYWdlJyxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pKTtcblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnTm9uSG90c3dhcHBhYmxlUm9vdCcsXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ05lc3RlZFN0YWNrJywgJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICdhcm46YXdzOmNsb3VkZm9ybWF0aW9uOmJlcm11ZGEtdHJpYW5nbGUtMTMzNzoxMjM0NTY3ODkwMTI6c3RhY2svTmVzdGVkU3RhY2svYWJjZCcsXG4gICAgKSxcbiAgKTtcblxuICByb290U3RhY2sudGVtcGxhdGUuUmVzb3VyY2VzLkZ1bmMuUHJvcGVydGllcy5Db2RlLlMzQnVja2V0ID0gJ25ldy1idWNrZXQnO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gdGVzdFN0YWNrKHsgc3RhY2tOYW1lOiAnTm9uSG90c3dhcHBhYmxlUm9vdCcsIHRlbXBsYXRlOiByb290U3RhY2sudGVtcGxhdGUgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2RlbGV0aW5nIGEgbmVzdGVkIHN0YWNrIHJlc3VsdHMgaW4gYSBmdWxsIGRlcGxveW1lbnQsIGV2ZW4gaWYgdGhlaXIgcGFyZW50IGNvbnRhaW5zIGEgaG90c3dhcHBhYmxlIGNoYW5nZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcE5lc3RlZFN0YWNrVGVzdHMoJ05lc3RlZFN0YWNrRGVsZXRpb25Sb290Jyk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkxhbWJkYSh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlOiBtb2NrVXBkYXRlTGFtYmRhQ29kZSxcbiAgfSk7XG5cbiAgY29uc3Qgcm9vdFN0YWNrID0gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdOZXN0ZWRTdGFja0RlbGV0aW9uUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBOZXN0ZWRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ3Jvb3QtZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTmVzdGVkU3RhY2snLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pKTtcblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnTmVzdGVkU3RhY2tEZWxldGlvblJvb3QnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdOZXN0ZWRTdGFjaycsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL05lc3RlZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgcm9vdFN0YWNrLnRlbXBsYXRlLlJlc291cmNlcy5GdW5jLlByb3BlcnRpZXMuQ29kZS5TM0J1Y2tldCA9ICduZXctYnVja2V0JztcbiAgZGVsZXRlIHJvb3RTdGFjay50ZW1wbGF0ZS5SZXNvdXJjZXMuTmVzdGVkU3RhY2s7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSB0ZXN0U3RhY2soeyBzdGFja05hbWU6ICdOZXN0ZWRTdGFja0RlbGV0aW9uUm9vdCcsIHRlbXBsYXRlOiByb290U3RhY2sudGVtcGxhdGUgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2NyZWF0aW5nIGEgbmVzdGVkIHN0YWNrIHJlc3VsdHMgaW4gYSBmdWxsIGRlcGxveW1lbnQsIGV2ZW4gaWYgdGhlaXIgcGFyZW50IGNvbnRhaW5zIGEgaG90c3dhcHBhYmxlIGNoYW5nZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcE5lc3RlZFN0YWNrVGVzdHMoJ05lc3RlZFN0YWNrQ3JlYXRpb25Sb290Jyk7XG4gIG1vY2tVcGRhdGVMYW1iZGFDb2RlID0gamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7fSk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkxhbWJkYSh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlOiBtb2NrVXBkYXRlTGFtYmRhQ29kZSxcbiAgfSk7XG5cbiAgY29uc3Qgcm9vdFN0YWNrID0gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdOZXN0ZWRTdGFja0NyZWF0aW9uUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAncm9vdC1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHJvb3RTdGFjayk7XG5cbiAgcm9vdFN0YWNrLnRlbXBsYXRlLlJlc291cmNlcy5GdW5jLlByb3BlcnRpZXMuQ29kZS5TM0J1Y2tldCA9ICduZXctYnVja2V0JztcbiAgcm9vdFN0YWNrLnRlbXBsYXRlLlJlc291cmNlcy5OZXN0ZWRTdGFjayA9IHtcbiAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgIFByb3BlcnRpZXM6IHtcbiAgICAgIFRlbXBsYXRlVVJMOiAnaHR0cHM6Ly93d3cubWFnaWMtdXJsLmNvbScsXG4gICAgfSxcbiAgICBNZXRhZGF0YToge1xuICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29uZS1sYW1iZGEtc3RhY2submVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgIH0sXG4gIH07XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSB0ZXN0U3RhY2soeyBzdGFja05hbWU6ICdOZXN0ZWRTdGFja0NyZWF0aW9uUm9vdCcsIHRlbXBsYXRlOiByb290U3RhY2sudGVtcGxhdGUgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xufSk7XG5cbnRlc3QoJ2F0dGVtcHRpbmcgdG8gaG90c3dhcCBhIG5ld2x5IGNyZWF0ZWQgbmVzdGVkIHN0YWNrIHdpdGggdGhlIHNhbWUgbG9naWNhbCBJRCBhcyBhIHJlc291cmNlIHdpdGggYSBkaWZmZXJlbnQgdHlwZSByZXN1bHRzIGluIGEgZnVsbCBkZXBsb3ltZW50JywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnTmVzdGVkU3RhY2tUeXBlQ2hhbmdlUm9vdCcpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gIH0pO1xuXG4gIGNvbnN0IHJvb3RTdGFjayA9IHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTmVzdGVkU3RhY2tUeXBlQ2hhbmdlUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAncm9vdC1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBGdXR1cmVOZXN0ZWRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnbmV3LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnc3Bvb2t5LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHNldHVwLmFkZFRlbXBsYXRlVG9DbG91ZEZvcm1hdGlvbkxvb2t1cE1vY2socm9vdFN0YWNrKTtcblxuICByb290U3RhY2sudGVtcGxhdGUuUmVzb3VyY2VzLkZ1bmMuUHJvcGVydGllcy5Db2RlLlMzQnVja2V0ID0gJ25ldy1idWNrZXQnO1xuICByb290U3RhY2sudGVtcGxhdGUuUmVzb3VyY2VzLkZ1dHVyZU5lc3RlZFN0YWNrID0ge1xuICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgUHJvcGVydGllczoge1xuICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICB9LFxuICAgIE1ldGFkYXRhOiB7XG4gICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgfSxcbiAgfTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ05lc3RlZFN0YWNrVHlwZUNoYW5nZVJvb3QnLCB0ZW1wbGF0ZTogcm9vdFN0YWNrLnRlbXBsYXRlIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG5cbnRlc3QoJ211bHRpLXNpYmxpbmcgKyAzLWxheWVyIG5lc3RlZCBzdGFjayBzdHJ1Y3R1cmUgaXMgaG90c3dhcHBhYmxlJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnTXVsdGlMYXllclJvb3QnKTtcbiAgbW9ja1VwZGF0ZUxhbWJkYUNvZGUgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViTGFtYmRhKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGU6IG1vY2tVcGRhdGVMYW1iZGFDb2RlLFxuICB9KTtcblxuICBjb25zdCBsYW1iZGFGdW5jdGlvblJlc291cmNlID0ge1xuICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgIFByb3BlcnRpZXM6IHtcbiAgICAgIENvZGU6IHtcbiAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgfSxcbiAgICB9LFxuICAgIE1ldGFkYXRhOiB7XG4gICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgIH0sXG4gIH07XG5cbiAgY29uc3Qgcm9vdFN0YWNrID0gdGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdNdWx0aUxheWVyUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBDaGlsZFN0YWNrOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBUZW1wbGF0ZVVSTDogJ2h0dHBzOi8vd3d3Lm1hZ2ljLXVybC5jb20nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbmUtdW5uYW1lZC1sYW1iZGEtdHdvLXN0YWNrcy1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRnVuYzogbGFtYmRhRnVuY3Rpb25SZXNvdXJjZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnQ2hpbGRTdGFjaycsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBHcmFuZENoaWxkU3RhY2tBOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBUZW1wbGF0ZVVSTDogJ2h0dHBzOi8vd3d3Lm1hZ2ljLXVybC5jb20nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbmUtdW5uYW1lZC1sYW1iZGEtc3RhY2submVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIEdyYW5kQ2hpbGRTdGFja0I6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFRlbXBsYXRlVVJMOiAnaHR0cHM6Ly93d3cubWFnaWMtdXJsLmNvbScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29uZS11bm5hbWVkLWxhbWJkYS1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgRnVuYzogbGFtYmRhRnVuY3Rpb25SZXNvdXJjZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSkpO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnR3JhbmRDaGlsZFN0YWNrQScsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiBsYW1iZGFGdW5jdGlvblJlc291cmNlLFxuICAgICAgfSxcbiAgICB9LFxuICB9KSk7XG4gIHNldHVwLmFkZFRlbXBsYXRlVG9DbG91ZEZvcm1hdGlvbkxvb2t1cE1vY2sodGVzdFN0YWNrKHtcbiAgICBzdGFja05hbWU6ICdHcmFuZENoaWxkU3RhY2tCJyxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IGxhbWJkYUZ1bmN0aW9uUmVzb3VyY2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH0pKTtcblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnTXVsdGlMYXllclJvb3QnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdDaGlsZFN0YWNrJywgJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICdhcm46YXdzOmNsb3VkZm9ybWF0aW9uOmJlcm11ZGEtdHJpYW5nbGUtMTMzNzoxMjM0NTY3ODkwMTI6c3RhY2svQ2hpbGRTdGFjay9hYmNkJyxcbiAgICApLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdGdW5jJywgJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsICdyb290LWZ1bmN0aW9uJyksXG4gICk7XG4gIHNldHVwLnB1c2hOZXN0ZWRTdGFja1Jlc291cmNlU3VtbWFyaWVzKCdDaGlsZFN0YWNrJyxcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignR3JhbmRDaGlsZFN0YWNrQScsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL0dyYW5kQ2hpbGRTdGFja0EvYWJjZCcsXG4gICAgKSxcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignR3JhbmRDaGlsZFN0YWNrQicsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL0dyYW5kQ2hpbGRTdGFja0IvYWJjZCcsXG4gICAgKSxcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignRnVuYycsICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAnY2hpbGQtZnVuY3Rpb24nKSxcbiAgKTtcbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ0dyYW5kQ2hpbGRTdGFja0EnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdGdW5jJywgJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsICdncmFuZGNoaWxkLUEtZnVuY3Rpb24nKSxcbiAgKTtcbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ0dyYW5kQ2hpbGRTdGFja0InLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdGdW5jJywgJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsICdncmFuZGNoaWxkLUItZnVuY3Rpb24nKSxcbiAgKTtcblxuICByb290U3RhY2sudGVtcGxhdGUuUmVzb3VyY2VzLkZ1bmMuUHJvcGVydGllcy5Db2RlLlMzS2V5ID0gJ25ldy1rZXknO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gdGVzdFN0YWNrKHsgc3RhY2tOYW1lOiAnTXVsdGlMYXllclJvb3QnLCB0ZW1wbGF0ZTogcm9vdFN0YWNrLnRlbXBsYXRlIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdyb290LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICBTM0tleTogJ25ldy1rZXknLFxuICB9KTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnY2hpbGQtZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgIFMzS2V5OiAnbmV3LWtleScsXG4gIH0pO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdncmFuZGNoaWxkLUEtZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgIFMzS2V5OiAnbmV3LWtleScsXG4gIH0pO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdncmFuZGNoaWxkLUItZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgIFMzS2V5OiAnbmV3LWtleScsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2NhbiBob3Rzd2FwIGEgbGFtYmRhIGZ1bmN0aW9uIGluIGEgMS1sZXZlbCBuZXN0ZWQgc3RhY2sgd2l0aCBhc3NldCBwYXJhbWV0ZXJzJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnTGFtYmRhUm9vdCcpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gIH0pO1xuXG4gIGNvbnN0IHJvb3RTdGFjayA9IHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTGFtYmRhUm9vdCcsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBOZXN0ZWRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgcmVmZXJlbmNldG9TM0J1Y2tldFBhcmFtOiB7XG4gICAgICAgICAgICAgICAgUmVmOiAnUzNCdWNrZXRQYXJhbScsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlZmVyZW5jZXRvUzNLZXlQYXJhbToge1xuICAgICAgICAgICAgICAgIFJlZjogJ1MzS2V5UGFyYW0nLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb25lLWxhbWJkYS1zdGFjay13aXRoLWFzc2V0LXBhcmFtZXRlcnMubmVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgUGFyYW1ldGVyczoge1xuICAgICAgICBTM0J1Y2tldFBhcmFtOiB7XG4gICAgICAgICAgVHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgRGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGFzc2V0JyxcbiAgICAgICAgfSxcbiAgICAgICAgUzNLZXlQYXJhbToge1xuICAgICAgICAgIFR5cGU6ICdTdHJpbmcnLFxuICAgICAgICAgIERlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciBhc3NldCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIHNldHVwLmFkZFRlbXBsYXRlVG9DbG91ZEZvcm1hdGlvbkxvb2t1cE1vY2socm9vdFN0YWNrKTtcbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayh0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ05lc3RlZFN0YWNrJyxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KSk7XG5cbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ0xhbWJkYVJvb3QnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdOZXN0ZWRTdGFjaycsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL05lc3RlZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ0xhbWJkYVJvb3QnLCB0ZW1wbGF0ZTogcm9vdFN0YWNrLnRlbXBsYXRlIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QsIHtcbiAgICBTM0J1Y2tldFBhcmFtOiAnYnVja2V0LXBhcmFtLXZhbHVlJyxcbiAgICBTM0tleVBhcmFtOiAna2V5LXBhcmFtLXZhbHVlJyxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2J1Y2tldC1wYXJhbS12YWx1ZScsXG4gICAgUzNLZXk6ICdrZXktcGFyYW0tdmFsdWUnLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdjYW4gaG90c3dhcCBhIGxhbWJkYSBmdW5jdGlvbiBpbiBhIDItbGV2ZWwgbmVzdGVkIHN0YWNrIHdpdGggYXNzZXQgcGFyYW1ldGVycycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcE5lc3RlZFN0YWNrVGVzdHMoJ0xhbWJkYVJvb3QnKTtcbiAgbW9ja1VwZGF0ZUxhbWJkYUNvZGUgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KTtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlci5zdHViTGFtYmRhKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGU6IG1vY2tVcGRhdGVMYW1iZGFDb2RlLFxuICB9KTtcblxuICBjb25zdCByb290U3RhY2sgPSB0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ0xhbWJkYVJvb3QnLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ2hpbGRTdGFjazoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgVGVtcGxhdGVVUkw6ICdodHRwczovL3d3dy5tYWdpYy11cmwuY29tJyxcbiAgICAgICAgICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgcmVmZXJlbmNldG9HcmFuZENoaWxkUzNCdWNrZXRQYXJhbToge1xuICAgICAgICAgICAgICAgIFJlZjogJ0dyYW5kQ2hpbGRTM0J1Y2tldFBhcmFtJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVmZXJlbmNldG9HcmFuZENoaWxkUzNLZXlQYXJhbToge1xuICAgICAgICAgICAgICAgIFJlZjogJ0dyYW5kQ2hpbGRTM0tleVBhcmFtJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVmZXJlbmNldG9DaGlsZFMzQnVja2V0UGFyYW06IHtcbiAgICAgICAgICAgICAgICBSZWY6ICdDaGlsZFMzQnVja2V0UGFyYW0nLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZWZlcmVuY2V0b0NoaWxkUzNLZXlQYXJhbToge1xuICAgICAgICAgICAgICAgIFJlZjogJ0NoaWxkUzNLZXlQYXJhbScsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbmUtbGFtYmRhLW9uZS1zdGFjay1zdGFjay13aXRoLWFzc2V0LXBhcmFtZXRlcnMubmVzdGVkLnRlbXBsYXRlLmpzb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgUGFyYW1ldGVyczoge1xuICAgICAgICBHcmFuZENoaWxkUzNCdWNrZXRQYXJhbToge1xuICAgICAgICAgIFR5cGU6ICdTdHJpbmcnLFxuICAgICAgICAgIERlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciBhc3NldCcsXG4gICAgICAgIH0sXG4gICAgICAgIEdyYW5kQ2hpbGRTM0tleVBhcmFtOiB7XG4gICAgICAgICAgVHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgRGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGFzc2V0JyxcbiAgICAgICAgfSxcbiAgICAgICAgQ2hpbGRTM0J1Y2tldFBhcmFtOiB7XG4gICAgICAgICAgVHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgRGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGFzc2V0JyxcbiAgICAgICAgfSxcbiAgICAgICAgQ2hpbGRTM0tleVBhcmFtOiB7XG4gICAgICAgICAgVHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgRGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGFzc2V0JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnQ2hpbGRTdGFjaycsXG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBTM0J1Y2tldDogJ2N1cnJlbnQtYnVja2V0JyxcbiAgICAgICAgICAgICAgUzNLZXk6ICdjdXJyZW50LWtleScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgR3JhbmRDaGlsZFN0YWNrOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Q2xvdWRGb3JtYXRpb246OlN0YWNrJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBUZW1wbGF0ZVVSTDogJ2h0dHBzOi8vd3d3Lm1hZ2ljLXVybC5jb20nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbmUtbGFtYmRhLXN0YWNrLXdpdGgtYXNzZXQtcGFyYW1ldGVycy5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSkpO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnR3JhbmRDaGlsZFN0YWNrJyxcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIFMzQnVja2V0OiAnY3VycmVudC1idWNrZXQnLFxuICAgICAgICAgICAgICBTM0tleTogJ2N1cnJlbnQta2V5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KSk7XG5cblxuICBzZXR1cC5wdXNoTmVzdGVkU3RhY2tSZXNvdXJjZVN1bW1hcmllcygnTGFtYmRhUm9vdCcsXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ0NoaWxkU3RhY2snLCAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgJ2Fybjphd3M6Y2xvdWRmb3JtYXRpb246YmVybXVkYS10cmlhbmdsZS0xMzM3OjEyMzQ1Njc4OTAxMjpzdGFjay9DaGlsZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ0NoaWxkU3RhY2snLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdHcmFuZENoaWxkU3RhY2snLCAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgJ2Fybjphd3M6Y2xvdWRmb3JtYXRpb246YmVybXVkYS10cmlhbmdsZS0xMzM3OjEyMzQ1Njc4OTAxMjpzdGFjay9HcmFuZENoaWxkU3RhY2svYWJjZCcsXG4gICAgKSxcbiAgKTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ0xhbWJkYVJvb3QnLCB0ZW1wbGF0ZTogcm9vdFN0YWNrLnRlbXBsYXRlIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QsIHtcbiAgICBHcmFuZENoaWxkUzNCdWNrZXRQYXJhbTogJ2NoaWxkLWJ1Y2tldC1wYXJhbS12YWx1ZScsXG4gICAgR3JhbmRDaGlsZFMzS2V5UGFyYW06ICdjaGlsZC1rZXktcGFyYW0tdmFsdWUnLFxuICAgIENoaWxkUzNCdWNrZXRQYXJhbTogJ2J1Y2tldC1wYXJhbS12YWx1ZScsXG4gICAgQ2hpbGRTM0tleVBhcmFtOiAna2V5LXBhcmFtLXZhbHVlJyxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBTM0J1Y2tldDogJ2J1Y2tldC1wYXJhbS12YWx1ZScsXG4gICAgUzNLZXk6ICdrZXktcGFyYW0tdmFsdWUnLFxuICB9KTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgIFMzQnVja2V0OiAnY2hpbGQtYnVja2V0LXBhcmFtLXZhbHVlJyxcbiAgICBTM0tleTogJ2NoaWxkLWtleS1wYXJhbS12YWx1ZScsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2xvb2tpbmcgdXAgb2JqZWN0cyBpbiBuZXN0ZWQgc3RhY2tzIHdvcmtzJywgYXN5bmMgKCkgPT4ge1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwTmVzdGVkU3RhY2tUZXN0cygnTGFtYmRhUm9vdCcpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBtb2NrUHVibGlzaFZlcnNpb24gPSBqZXN0LmZuKCk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc3R1YkxhbWJkYSh7XG4gICAgdXBkYXRlRnVuY3Rpb25Db2RlOiBtb2NrVXBkYXRlTGFtYmRhQ29kZSxcbiAgICBwdWJsaXNoVmVyc2lvbjogbW9ja1B1Ymxpc2hWZXJzaW9uLFxuICB9KTtcblxuICBjb25zdCByb290U3RhY2sgPSB0ZXN0U3RhY2soe1xuICAgIHN0YWNrTmFtZTogJ0xhbWJkYVJvb3QnLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgTmVzdGVkU3RhY2s6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFRlbXBsYXRlVVJMOiAnaHR0cHM6Ly93d3cubWFnaWMtdXJsLmNvbScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29uZS1sYW1iZGEtdmVyc2lvbi1zdGFjay5uZXN0ZWQudGVtcGxhdGUuanNvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgc2V0dXAuYWRkVGVtcGxhdGVUb0Nsb3VkRm9ybWF0aW9uTG9va3VwTW9jayhyb290U3RhY2spO1xuICBzZXR1cC5hZGRUZW1wbGF0ZVRvQ2xvdWRGb3JtYXRpb25Mb29rdXBNb2NrKHRlc3RTdGFjayh7XG4gICAgc3RhY2tOYW1lOiAnTmVzdGVkU3RhY2snLFxuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgUzNCdWNrZXQ6ICdjdXJyZW50LWJ1Y2tldCcsXG4gICAgICAgICAgICAgIFMzS2V5OiAnY3VycmVudC1rZXknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBWZXJzaW9uOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpWZXJzaW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHsgUmVmOiAnRnVuYycgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KSk7XG5cbiAgc2V0dXAucHVzaE5lc3RlZFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoJ0xhbWJkYVJvb3QnLFxuICAgIHNldHVwLnN0YWNrU3VtbWFyeU9mKCdOZXN0ZWRTdGFjaycsICdBV1M6OkNsb3VkRm9ybWF0aW9uOjpTdGFjaycsXG4gICAgICAnYXJuOmF3czpjbG91ZGZvcm1hdGlvbjpiZXJtdWRhLXRyaWFuZ2xlLTEzMzc6MTIzNDU2Nzg5MDEyOnN0YWNrL05lc3RlZFN0YWNrL2FiY2QnLFxuICAgICksXG4gICk7XG5cbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHRlc3RTdGFjayh7IHN0YWNrTmFtZTogJ0xhbWJkYVJvb3QnLCB0ZW1wbGF0ZTogcm9vdFN0YWNrLnRlbXBsYXRlIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1B1Ymxpc2hWZXJzaW9uKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICB9KTtcbn0pO1xuIl19