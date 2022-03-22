"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3_bucket_deployments_1 = require("../../../lib/api/hotswap/s3-bucket-deployments");
const setup = require("./hotswap-test-setup");
let mockLambdaInvoke;
let hotswapMockSdkProvider;
const payloadWithoutCustomResProps = {
    RequestType: 'Update',
    ResponseURL: s3_bucket_deployments_1.REQUIRED_BY_CFN,
    PhysicalResourceId: s3_bucket_deployments_1.REQUIRED_BY_CFN,
    StackId: s3_bucket_deployments_1.REQUIRED_BY_CFN,
    RequestId: s3_bucket_deployments_1.REQUIRED_BY_CFN,
    LogicalResourceId: s3_bucket_deployments_1.REQUIRED_BY_CFN,
};
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockLambdaInvoke = jest.fn();
    hotswapMockSdkProvider.setInvokeLambdaMock(mockLambdaInvoke);
});
test('calls the lambdaInvoke() API when it receives only an asset difference in an S3 bucket deployment and evaluates CFN expressions in S3 Deployment Properties', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            S3Deployment: {
                Type: 'Custom::CDKBucketDeployment',
                Properties: {
                    ServiceToken: 'a-lambda-arn',
                    SourceBucketNames: ['src-bucket'],
                    SourceObjectKeys: ['src-key-old'],
                    DestinationBucketName: 'dest-bucket',
                    DestinationBucketKeyPrefix: 'my-key/some-old-prefix',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                S3Deployment: {
                    Type: 'Custom::CDKBucketDeployment',
                    Properties: {
                        ServiceToken: 'a-lambda-arn',
                        SourceBucketNames: ['src-bucket'],
                        SourceObjectKeys: {
                            'Fn::Split': [
                                '-',
                                'key1-key2-key3',
                            ],
                        },
                        DestinationBucketName: 'dest-bucket',
                        DestinationBucketKeyPrefix: 'my-key/some-new-prefix',
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockLambdaInvoke).toHaveBeenCalledWith({
        FunctionName: 'a-lambda-arn',
        Payload: JSON.stringify({
            ...payloadWithoutCustomResProps,
            ResourceProperties: {
                SourceBucketNames: ['src-bucket'],
                SourceObjectKeys: ['key1', 'key2', 'key3'],
                DestinationBucketName: 'dest-bucket',
                DestinationBucketKeyPrefix: 'my-key/some-new-prefix',
            },
        }),
    });
});
test('does not call the invoke() API when a resource with type that is not Custom::CDKBucketDeployment but has the same properties is changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            S3Deployment: {
                Type: 'Custom::NotCDKBucketDeployment',
                Properties: {
                    SourceObjectKeys: ['src-key-old'],
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                S3Deployment: {
                    Type: 'Custom::NotCDKBucketDeployment',
                    Properties: {
                        SourceObjectKeys: ['src-key-new'],
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockLambdaInvoke).not.toHaveBeenCalled();
});
test('does not call the invokeLambda() api if the updated Policy has no Roles', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Parameters: {
            WebsiteBucketParamOld: { Type: 'String' },
            WebsiteBucketParamNew: { Type: 'String' },
        },
        Resources: {
            S3Deployment: {
                Type: 'Custom::CDKBucketDeployment',
                Properties: {
                    ServiceToken: 'a-lambda-arn',
                    SourceObjectKeys: ['src-key-old'],
                },
            },
            Policy: {
                Type: 'AWS::IAM::Policy',
                Properties: {
                    PolicyName: 'my-policy',
                    PolicyDocument: {
                        Statement: [
                            {
                                Action: ['s3:GetObject*'],
                                Effect: 'Allow',
                                Resource: {
                                    Ref: 'WebsiteBucketParamOld',
                                },
                            },
                        ],
                    },
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Parameters: {
                WebsiteBucketParamOld: { Type: 'String' },
                WebsiteBucketParamNew: { Type: 'String' },
            },
            Resources: {
                S3Deployment: {
                    Type: 'Custom::CDKBucketDeployment',
                    Properties: {
                        ServiceToken: 'a-lambda-arn',
                        SourceObjectKeys: ['src-key-new'],
                    },
                },
                Policy: {
                    Type: 'AWS::IAM::Policy',
                    Properties: {
                        PolicyName: 'my-policy',
                        PolicyDocument: {
                            Statement: [
                                {
                                    Action: ['s3:GetObject*'],
                                    Effect: 'Allow',
                                    Resource: {
                                        Ref: 'WebsiteBucketParamNew',
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockLambdaInvoke).not.toHaveBeenCalled();
});
test('throws an error when the serviceToken fails evaluation in the template', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            S3Deployment: {
                Type: 'Custom::CDKBucketDeployment',
                Properties: {
                    ServiceToken: {
                        Ref: 'BadLamba',
                    },
                    SourceBucketNames: ['src-bucket'],
                    SourceObjectKeys: ['src-key-old'],
                    DestinationBucketName: 'dest-bucket',
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                S3Deployment: {
                    Type: 'Custom::CDKBucketDeployment',
                    Properties: {
                        ServiceToken: {
                            Ref: 'BadLamba',
                        },
                        SourceBucketNames: ['src-bucket'],
                        SourceObjectKeys: ['src-key-new'],
                        DestinationBucketName: 'dest-bucket',
                    },
                },
            },
        },
    });
    // WHEN
    await expect(() => hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact)).rejects.toThrow(/Parameter or resource 'BadLamba' could not be found for evaluation/);
    expect(mockLambdaInvoke).not.toHaveBeenCalled();
});
describe('old-style synthesis', () => {
    const parameters = {
        WebsiteBucketParamOld: { Type: 'String' },
        WebsiteBucketParamNew: { Type: 'String' },
        DifferentBucketParamNew: { Type: 'String' },
    };
    const serviceRole = {
        Type: 'AWS::IAM::Role',
        Properties: {
            AssumeRolePolicyDocument: {
                Statement: [
                    {
                        Action: 'sts:AssumeRole',
                        Effect: 'Allow',
                        Principal: {
                            Service: 'lambda.amazonaws.com',
                        },
                    },
                ],
                Version: '2012-10-17',
            },
        },
    };
    const policyOld = {
        Type: 'AWS::IAM::Policy',
        Properties: {
            PolicyName: 'my-policy-old',
            Roles: [
                { Ref: 'ServiceRole' },
            ],
            PolicyDocument: {
                Statement: [
                    {
                        Action: ['s3:GetObject*'],
                        Effect: 'Allow',
                        Resource: {
                            Ref: 'WebsiteBucketParamOld',
                        },
                    },
                ],
            },
        },
    };
    const policyNew = {
        Type: 'AWS::IAM::Policy',
        Properties: {
            PolicyName: 'my-policy-new',
            Roles: [
                { Ref: 'ServiceRole' },
            ],
            PolicyDocument: {
                Statement: [
                    {
                        Action: ['s3:GetObject*'],
                        Effect: 'Allow',
                        Resource: {
                            Ref: 'WebsiteBucketParamNew',
                        },
                    },
                ],
            },
        },
    };
    const policy2Old = {
        Type: 'AWS::IAM::Policy',
        Properties: {
            PolicyName: 'my-policy-old-2',
            Roles: [
                { Ref: 'ServiceRole' },
            ],
            PolicyDocument: {
                Statement: [
                    {
                        Action: ['s3:GetObject*'],
                        Effect: 'Allow',
                        Resource: {
                            Ref: 'WebsiteBucketParamOld',
                        },
                    },
                ],
            },
        },
    };
    const policy2New = {
        Type: 'AWS::IAM::Policy',
        Properties: {
            PolicyName: 'my-policy-new-2',
            Roles: [
                { Ref: 'ServiceRole2' },
            ],
            PolicyDocument: {
                Statement: [
                    {
                        Action: ['s3:GetObject*'],
                        Effect: 'Allow',
                        Resource: {
                            Ref: 'DifferentBucketParamOld',
                        },
                    },
                ],
            },
        },
    };
    const deploymentLambda = {
        Type: 'AWS::Lambda::Function',
        Role: {
            'Fn::GetAtt': [
                'ServiceRole',
                'Arn',
            ],
        },
    };
    const s3DeploymentOld = {
        Type: 'Custom::CDKBucketDeployment',
        Properties: {
            ServiceToken: {
                'Fn::GetAtt': [
                    'S3DeploymentLambda',
                    'Arn',
                ],
            },
            SourceBucketNames: ['src-bucket-old'],
            SourceObjectKeys: ['src-key-old'],
            DestinationBucketName: 'WebsiteBucketOld',
        },
    };
    const s3DeploymentNew = {
        Type: 'Custom::CDKBucketDeployment',
        Properties: {
            ServiceToken: {
                'Fn::GetAtt': [
                    'S3DeploymentLambda',
                    'Arn',
                ],
            },
            SourceBucketNames: ['src-bucket-new'],
            SourceObjectKeys: ['src-key-new'],
            DestinationBucketName: 'WebsiteBucketNew',
        },
    };
    beforeEach(() => {
        setup.pushStackResourceSummaries(setup.stackSummaryOf('S3DeploymentLambda', 'AWS::Lambda::Function', 'my-deployment-lambda'), setup.stackSummaryOf('ServiceRole', 'AWS::IAM::Role', 'my-service-role'));
    });
    test('calls the lambdaInvoke() API when it receives an asset difference in an S3 bucket deployment and an IAM Policy difference using old-style synthesis', async () => {
        // GIVEN
        setup.setCurrentCfnStackTemplate({
            Resources: {
                Parameters: parameters,
                ServiceRole: serviceRole,
                Policy: policyOld,
                S3DeploymentLambda: deploymentLambda,
                S3Deployment: s3DeploymentOld,
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    Parameters: parameters,
                    ServiceRole: serviceRole,
                    Policy: policyNew,
                    S3DeploymentLambda: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                },
            },
        });
        // WHEN
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact, { WebsiteBucketParamOld: 'WebsiteBucketOld', WebsiteBucketParamNew: 'WebsiteBucketNew' });
        // THEN
        expect(deployStackResult).not.toBeUndefined();
        expect(mockLambdaInvoke).toHaveBeenCalledWith({
            FunctionName: 'arn:aws:lambda:here:123456789012:function:my-deployment-lambda',
            Payload: JSON.stringify({
                ...payloadWithoutCustomResProps,
                ResourceProperties: {
                    SourceBucketNames: ['src-bucket-new'],
                    SourceObjectKeys: ['src-key-new'],
                    DestinationBucketName: 'WebsiteBucketNew',
                },
            }),
        });
    });
    test('does not call the lambdaInvoke() API when the difference in the S3 deployment is referred to in one IAM policy change but not another', async () => {
        // GIVEN
        setup.setCurrentCfnStackTemplate({
            Resources: {
                ServiceRole: serviceRole,
                Policy1: policyOld,
                Policy2: policy2Old,
                S3DeploymentLambda: deploymentLambda,
                S3Deployment: s3DeploymentOld,
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    ServiceRole: serviceRole,
                    Policy1: policyNew,
                    Policy2: {
                        Properties: {
                            Roles: [
                                { Ref: 'ServiceRole' },
                                'different-role',
                            ],
                            PolicyDocument: {
                                Statement: [
                                    {
                                        Action: ['s3:GetObject*'],
                                        Effect: 'Allow',
                                        Resource: {
                                            'Fn::GetAtt': [
                                                'DifferentBucketNew',
                                                'Arn',
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    S3DeploymentLambda: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                },
            },
        });
        // WHEN
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
        // THEN
        expect(deployStackResult).toBeUndefined();
        expect(mockLambdaInvoke).not.toHaveBeenCalled();
    });
    test('does not call the lambdaInvoke() API when the lambda that references the role is referred to by something other than an S3 deployment', async () => {
        // GIVEN
        setup.setCurrentCfnStackTemplate({
            Resources: {
                ServiceRole: serviceRole,
                Policy: policyOld,
                S3DeploymentLambda: deploymentLambda,
                S3Deployment: s3DeploymentOld,
                Endpoint: {
                    Type: 'AWS::Lambda::Permission',
                    Properties: {
                        Action: 'lambda:InvokeFunction',
                        FunctionName: {
                            'Fn::GetAtt': [
                                'S3DeploymentLambda',
                                'Arn',
                            ],
                        },
                        Principal: 'apigateway.amazonaws.com',
                    },
                },
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    ServiceRole: serviceRole,
                    Policy: policyNew,
                    S3DeploymentLambda: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                    Endpoint: {
                        Type: 'AWS::Lambda::Permission',
                        Properties: {
                            Action: 'lambda:InvokeFunction',
                            FunctionName: {
                                'Fn::GetAtt': [
                                    'S3DeploymentLambda',
                                    'Arn',
                                ],
                            },
                            Principal: 'apigateway.amazonaws.com',
                        },
                    },
                },
            },
        });
        // WHEN
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
        // THEN
        expect(deployStackResult).toBeUndefined();
        expect(mockLambdaInvoke).not.toHaveBeenCalled();
    });
    test('calls the lambdaInvoke() API when it receives an asset difference in two S3 bucket deployments and IAM Policy differences using old-style synthesis', async () => {
        // GIVEN
        const s3Deployment2Old = {
            Type: 'Custom::CDKBucketDeployment',
            Properties: {
                ServiceToken: {
                    'Fn::GetAtt': [
                        'S3DeploymentLambda2',
                        'Arn',
                    ],
                },
                SourceBucketNames: ['src-bucket-old'],
                SourceObjectKeys: ['src-key-old'],
                DestinationBucketName: 'DifferentBucketOld',
            },
        };
        const s3Deployment2New = {
            Type: 'Custom::CDKBucketDeployment',
            Properties: {
                ServiceToken: {
                    'Fn::GetAtt': [
                        'S3DeploymentLambda2',
                        'Arn',
                    ],
                },
                SourceBucketNames: ['src-bucket-new'],
                SourceObjectKeys: ['src-key-new'],
                DestinationBucketName: 'DifferentBucketNew',
            },
        };
        setup.setCurrentCfnStackTemplate({
            Resources: {
                ServiceRole: serviceRole,
                ServiceRole2: serviceRole,
                Policy1: policyOld,
                Policy2: policy2Old,
                S3DeploymentLambda: deploymentLambda,
                S3DeploymentLambda2: deploymentLambda,
                S3Deployment: s3DeploymentOld,
                S3Deployment2: s3Deployment2Old,
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    Parameters: parameters,
                    ServiceRole: serviceRole,
                    ServiceRole2: serviceRole,
                    Policy1: policyNew,
                    Policy2: policy2New,
                    S3DeploymentLambda: deploymentLambda,
                    S3DeploymentLambda2: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                    S3Deployment2: s3Deployment2New,
                },
            },
        });
        // WHEN
        setup.pushStackResourceSummaries(setup.stackSummaryOf('S3DeploymentLambda2', 'AWS::Lambda::Function', 'my-deployment-lambda-2'), setup.stackSummaryOf('ServiceRole2', 'AWS::IAM::Role', 'my-service-role-2'));
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact, {
            WebsiteBucketParamOld: 'WebsiteBucketOld',
            WebsiteBucketParamNew: 'WebsiteBucketNew',
            DifferentBucketParamNew: 'WebsiteBucketNew',
        });
        // THEN
        expect(deployStackResult).not.toBeUndefined();
        expect(mockLambdaInvoke).toHaveBeenCalledWith({
            FunctionName: 'arn:aws:lambda:here:123456789012:function:my-deployment-lambda',
            Payload: JSON.stringify({
                ...payloadWithoutCustomResProps,
                ResourceProperties: {
                    SourceBucketNames: ['src-bucket-new'],
                    SourceObjectKeys: ['src-key-new'],
                    DestinationBucketName: 'WebsiteBucketNew',
                },
            }),
        });
        expect(mockLambdaInvoke).toHaveBeenCalledWith({
            FunctionName: 'arn:aws:lambda:here:123456789012:function:my-deployment-lambda-2',
            Payload: JSON.stringify({
                ...payloadWithoutCustomResProps,
                ResourceProperties: {
                    SourceBucketNames: ['src-bucket-new'],
                    SourceObjectKeys: ['src-key-new'],
                    DestinationBucketName: 'DifferentBucketNew',
                },
            }),
        });
    });
    test('does not call the lambdaInvoke() API when it receives an asset difference in an S3 bucket deployment that references two different policies', async () => {
        // GIVEN
        setup.setCurrentCfnStackTemplate({
            Resources: {
                ServiceRole: serviceRole,
                Policy1: policyOld,
                Policy2: policy2Old,
                S3DeploymentLambda: deploymentLambda,
                S3Deployment: s3DeploymentOld,
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    ServiceRole: serviceRole,
                    Policy1: policyNew,
                    Policy2: {
                        Properties: {
                            Roles: [
                                { Ref: 'ServiceRole' },
                            ],
                            PolicyDocument: {
                                Statement: [
                                    {
                                        Action: ['s3:GetObject*'],
                                        Effect: 'Allow',
                                        Resource: {
                                            'Fn::GetAtt': [
                                                'DifferentBucketNew',
                                                'Arn',
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    S3DeploymentLambda: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                },
            },
        });
        // WHEN
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
        // THEN
        expect(deployStackResult).toBeUndefined();
        expect(mockLambdaInvoke).not.toHaveBeenCalled();
    });
    test('does not call the lambdaInvoke() API when a policy is referenced by a resource that is not an S3 deployment', async () => {
        // GIVEN
        setup.setCurrentCfnStackTemplate({
            Resources: {
                ServiceRole: serviceRole,
                Policy1: policyOld,
                S3DeploymentLambda: deploymentLambda,
                S3Deployment: s3DeploymentOld,
                NotADeployment: {
                    Type: 'AWS::Not::S3Deployment',
                    Properties: {
                        Prop: {
                            Ref: 'ServiceRole',
                        },
                    },
                },
            },
        });
        const cdkStackArtifact = setup.cdkStackArtifactOf({
            template: {
                Resources: {
                    ServiceRole: serviceRole,
                    Policy1: policyNew,
                    S3DeploymentLambda: deploymentLambda,
                    S3Deployment: s3DeploymentNew,
                    NotADeployment: {
                        Type: 'AWS::Not::S3Deployment',
                        Properties: {
                            Prop: {
                                Ref: 'ServiceRole',
                            },
                        },
                    },
                },
            },
        });
        // WHEN
        const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
        // THEN
        expect(deployStackResult).toBeUndefined();
        expect(mockLambdaInvoke).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtYnVja2V0LWhvdHN3YXAtZGVwbG95bWVudHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInMzLWJ1Y2tldC1ob3Rzd2FwLWRlcGxveW1lbnRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwwRkFBaUY7QUFDakYsOENBQThDO0FBRTlDLElBQUksZ0JBQTZGLENBQUM7QUFDbEcsSUFBSSxzQkFBb0QsQ0FBQztBQUV6RCxNQUFNLDRCQUE0QixHQUFHO0lBQ25DLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLFdBQVcsRUFBRSx1Q0FBZTtJQUM1QixrQkFBa0IsRUFBRSx1Q0FBZTtJQUNuQyxPQUFPLEVBQUUsdUNBQWU7SUFDeEIsU0FBUyxFQUFFLHVDQUFlO0lBQzFCLGlCQUFpQixFQUFFLHVDQUFlO0NBQ25DLENBQUM7QUFFRixVQUFVLENBQUMsR0FBRyxFQUFFO0lBQ2Qsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzdCLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDL0QsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsNkpBQTZKLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDN0ssUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLDZCQUE2QjtnQkFDbkMsVUFBVSxFQUFFO29CQUNWLFlBQVksRUFBRSxjQUFjO29CQUM1QixpQkFBaUIsRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFDakMsZ0JBQWdCLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ2pDLHFCQUFxQixFQUFFLGFBQWE7b0JBQ3BDLDBCQUEwQixFQUFFLHdCQUF3QjtpQkFDckQ7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBQ0gs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QUFnQixDQUFDLENBQUM7UUFFOUYsT0FBTztRQUNQLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMYW1iZGEgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IFJFUVVJUkVEX0JZX0NGTiB9IGZyb20gJy4uLy4uLy4uL2xpYi9hcGkvaG90c3dhcC9zMy1idWNrZXQtZGVwbG95bWVudHMnO1xuaW1wb3J0ICogYXMgc2V0dXAgZnJvbSAnLi9ob3Rzd2FwLXRlc3Qtc2V0dXAnO1xuXG5sZXQgbW9ja0xhbWJkYUludm9rZTogKHBhcmFtczogTGFtYmRhLlR5cGVzLkludm9jYXRpb25SZXF1ZXN0KSA9PiBMYW1iZGEuVHlwZXMuSW52b2NhdGlvblJlc3BvbnNlO1xubGV0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXI6IHNldHVwLkhvdHN3YXBNb2NrU2RrUHJvdmlkZXI7XG5cbmNvbnN0IHBheWxvYWRXaXRob3V0Q3VzdG9tUmVzUHJvcHMgPSB7XG4gIFJlcXVlc3RUeXBlOiAnVXBkYXRlJyxcbiAgUmVzcG9uc2VVUkw6IFJFUVVJUkVEX0JZX0NGTixcbiAgUGh5c2ljYWxSZXNvdXJjZUlkOiBSRVFVSVJFRF9CWV9DRk4sXG4gIFN0YWNrSWQ6IFJFUVVJUkVEX0JZX0NGTixcbiAgUmVxdWVzdElkOiBSRVFVSVJFRF9CWV9DRk4sXG4gIExvZ2ljYWxSZXNvdXJjZUlkOiBSRVFVSVJFRF9CWV9DRk4sXG59O1xuXG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgaG90c3dhcE1vY2tTZGtQcm92aWRlciA9IHNldHVwLnNldHVwSG90c3dhcFRlc3RzKCk7XG4gIG1vY2tMYW1iZGFJbnZva2UgPSBqZXN0LmZuKCk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc2V0SW52b2tlTGFtYmRhTW9jayhtb2NrTGFtYmRhSW52b2tlKTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgbGFtYmRhSW52b2tlKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhbiBhc3NldCBkaWZmZXJlbmNlIGluIGFuIFMzIGJ1Y2tldCBkZXBsb3ltZW50IGFuZCBldmFsdWF0ZXMgQ0ZOIGV4cHJlc3Npb25zIGluIFMzIERlcGxveW1lbnQgUHJvcGVydGllcycsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgUzNEZXBsb3ltZW50OiB7XG4gICAgICAgIFR5cGU6ICdDdXN0b206OkNES0J1Y2tldERlcGxveW1lbnQnLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgU2VydmljZVRva2VuOiAnYS1sYW1iZGEtYXJuJyxcbiAgICAgICAgICBTb3VyY2VCdWNrZXROYW1lczogWydzcmMtYnVja2V0J10sXG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW9sZCddLFxuICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ2Rlc3QtYnVja2V0JyxcbiAgICAgICAgICBEZXN0aW5hdGlvbkJ1Y2tldEtleVByZWZpeDogJ215LWtleS9zb21lLW9sZC1wcmVmaXgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBTM0RlcGxveW1lbnQ6IHtcbiAgICAgICAgICBUeXBlOiAnQ3VzdG9tOjpDREtCdWNrZXREZXBsb3ltZW50JyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBTZXJ2aWNlVG9rZW46ICdhLWxhbWJkYS1hcm4nLFxuICAgICAgICAgICAgU291cmNlQnVja2V0TmFtZXM6IFsnc3JjLWJ1Y2tldCddLFxuICAgICAgICAgICAgU291cmNlT2JqZWN0S2V5czoge1xuICAgICAgICAgICAgICAnRm46OlNwbGl0JzogW1xuICAgICAgICAgICAgICAgICctJyxcbiAgICAgICAgICAgICAgICAna2V5MS1rZXkyLWtleTMnLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ2Rlc3QtYnVja2V0JyxcbiAgICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0S2V5UHJlZml4OiAnbXkta2V5L3NvbWUtbmV3LXByZWZpeCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG5cbiAgZXhwZWN0KG1vY2tMYW1iZGFJbnZva2UpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdhLWxhbWJkYS1hcm4nLFxuICAgIFBheWxvYWQ6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIC4uLnBheWxvYWRXaXRob3V0Q3VzdG9tUmVzUHJvcHMsXG4gICAgICBSZXNvdXJjZVByb3BlcnRpZXM6IHtcbiAgICAgICAgU291cmNlQnVja2V0TmFtZXM6IFsnc3JjLWJ1Y2tldCddLFxuICAgICAgICBTb3VyY2VPYmplY3RLZXlzOiBbJ2tleTEnLCAna2V5MicsICdrZXkzJ10sXG4gICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ2Rlc3QtYnVja2V0JyxcbiAgICAgICAgRGVzdGluYXRpb25CdWNrZXRLZXlQcmVmaXg6ICdteS1rZXkvc29tZS1uZXctcHJlZml4JyxcbiAgICAgIH0sXG4gICAgfSksXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIGludm9rZSgpIEFQSSB3aGVuIGEgcmVzb3VyY2Ugd2l0aCB0eXBlIHRoYXQgaXMgbm90IEN1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCBidXQgaGFzIHRoZSBzYW1lIHByb3BlcnRpZXMgaXMgY2hhbmdlZCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgUzNEZXBsb3ltZW50OiB7XG4gICAgICAgIFR5cGU6ICdDdXN0b206Ok5vdENES0J1Y2tldERlcGxveW1lbnQnLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW9sZCddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBTM0RlcGxveW1lbnQ6IHtcbiAgICAgICAgICBUeXBlOiAnQ3VzdG9tOjpOb3RDREtCdWNrZXREZXBsb3ltZW50JyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBTb3VyY2VPYmplY3RLZXlzOiBbJ3NyYy1rZXktbmV3J10sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tMYW1iZGFJbnZva2UpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgnZG9lcyBub3QgY2FsbCB0aGUgaW52b2tlTGFtYmRhKCkgYXBpIGlmIHRoZSB1cGRhdGVkIFBvbGljeSBoYXMgbm8gUm9sZXMnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBQYXJhbWV0ZXJzOiB7XG4gICAgICBXZWJzaXRlQnVja2V0UGFyYW1PbGQ6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgIFdlYnNpdGVCdWNrZXRQYXJhbU5ldzogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgIH0sXG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBTM0RlcGxveW1lbnQ6IHtcbiAgICAgICAgVHlwZTogJ0N1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCcsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBTZXJ2aWNlVG9rZW46ICdhLWxhbWJkYS1hcm4nLFxuICAgICAgICAgIFNvdXJjZU9iamVjdEtleXM6IFsnc3JjLWtleS1vbGQnXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBQb2xpY3k6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6SUFNOjpQb2xpY3knLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgUG9saWN5TmFtZTogJ215LXBvbGljeScsXG4gICAgICAgICAgUG9saWN5RG9jdW1lbnQ6IHtcbiAgICAgICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgQWN0aW9uOiBbJ3MzOkdldE9iamVjdConXSxcbiAgICAgICAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXG4gICAgICAgICAgICAgICAgUmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgIFJlZjogJ1dlYnNpdGVCdWNrZXRQYXJhbU9sZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBQYXJhbWV0ZXJzOiB7XG4gICAgICAgIFdlYnNpdGVCdWNrZXRQYXJhbU9sZDogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgICAgICBXZWJzaXRlQnVja2V0UGFyYW1OZXc6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgUzNEZXBsb3ltZW50OiB7XG4gICAgICAgICAgVHlwZTogJ0N1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU2VydmljZVRva2VuOiAnYS1sYW1iZGEtYXJuJyxcbiAgICAgICAgICAgIFNvdXJjZU9iamVjdEtleXM6IFsnc3JjLWtleS1uZXcnXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBQb2xpY3k6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpJQU06OlBvbGljeScsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgUG9saWN5TmFtZTogJ215LXBvbGljeScsXG4gICAgICAgICAgICBQb2xpY3lEb2N1bWVudDoge1xuICAgICAgICAgICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBBY3Rpb246IFsnczM6R2V0T2JqZWN0KiddLFxuICAgICAgICAgICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxuICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgUmVmOiAnV2Vic2l0ZUJ1Y2tldFBhcmFtTmV3JyxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tMYW1iZGFJbnZva2UpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxudGVzdCgndGhyb3dzIGFuIGVycm9yIHdoZW4gdGhlIHNlcnZpY2VUb2tlbiBmYWlscyBldmFsdWF0aW9uIGluIHRoZSB0ZW1wbGF0ZScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgUzNEZXBsb3ltZW50OiB7XG4gICAgICAgIFR5cGU6ICdDdXN0b206OkNES0J1Y2tldERlcGxveW1lbnQnLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgU2VydmljZVRva2VuOiB7XG4gICAgICAgICAgICBSZWY6ICdCYWRMYW1iYScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBTb3VyY2VCdWNrZXROYW1lczogWydzcmMtYnVja2V0J10sXG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW9sZCddLFxuICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ2Rlc3QtYnVja2V0JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgUzNEZXBsb3ltZW50OiB7XG4gICAgICAgICAgVHlwZTogJ0N1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU2VydmljZVRva2VuOiB7XG4gICAgICAgICAgICAgIFJlZjogJ0JhZExhbWJhJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTb3VyY2VCdWNrZXROYW1lczogWydzcmMtYnVja2V0J10sXG4gICAgICAgICAgICBTb3VyY2VPYmplY3RLZXlzOiBbJ3NyYy1rZXktbmV3J10sXG4gICAgICAgICAgICBEZXN0aW5hdGlvbkJ1Y2tldE5hbWU6ICdkZXN0LWJ1Y2tldCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBhd2FpdCBleHBlY3QoKCkgPT5cbiAgICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpLFxuICApLnJlamVjdHMudG9UaHJvdygvUGFyYW1ldGVyIG9yIHJlc291cmNlICdCYWRMYW1iYScgY291bGQgbm90IGJlIGZvdW5kIGZvciBldmFsdWF0aW9uLyk7XG5cbiAgZXhwZWN0KG1vY2tMYW1iZGFJbnZva2UpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTtcblxuZGVzY3JpYmUoJ29sZC1zdHlsZSBzeW50aGVzaXMnLCAoKSA9PiB7XG4gIGNvbnN0IHBhcmFtZXRlcnMgPSB7XG4gICAgV2Vic2l0ZUJ1Y2tldFBhcmFtT2xkOiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgV2Vic2l0ZUJ1Y2tldFBhcmFtTmV3OiB7IFR5cGU6ICdTdHJpbmcnIH0sXG4gICAgRGlmZmVyZW50QnVja2V0UGFyYW1OZXc6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgfTtcblxuICBjb25zdCBzZXJ2aWNlUm9sZSA9IHtcbiAgICBUeXBlOiAnQVdTOjpJQU06OlJvbGUnLFxuICAgIFByb3BlcnRpZXM6IHtcbiAgICAgIEFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudDoge1xuICAgICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBY3Rpb246ICdzdHM6QXNzdW1lUm9sZScsXG4gICAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXG4gICAgICAgICAgICBQcmluY2lwYWw6IHtcbiAgICAgICAgICAgICAgU2VydmljZTogJ2xhbWJkYS5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgVmVyc2lvbjogJzIwMTItMTAtMTcnLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0IHBvbGljeU9sZCA9IHtcbiAgICBUeXBlOiAnQVdTOjpJQU06OlBvbGljeScsXG4gICAgUHJvcGVydGllczoge1xuICAgICAgUG9saWN5TmFtZTogJ215LXBvbGljeS1vbGQnLFxuICAgICAgUm9sZXM6IFtcbiAgICAgICAgeyBSZWY6ICdTZXJ2aWNlUm9sZScgfSxcbiAgICAgIF0sXG4gICAgICBQb2xpY3lEb2N1bWVudDoge1xuICAgICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBBY3Rpb246IFsnczM6R2V0T2JqZWN0KiddLFxuICAgICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxuICAgICAgICAgICAgUmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgUmVmOiAnV2Vic2l0ZUJ1Y2tldFBhcmFtT2xkJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBjb25zdCBwb2xpY3lOZXcgPSB7XG4gICAgVHlwZTogJ0FXUzo6SUFNOjpQb2xpY3knLFxuICAgIFByb3BlcnRpZXM6IHtcbiAgICAgIFBvbGljeU5hbWU6ICdteS1wb2xpY3ktbmV3JyxcbiAgICAgIFJvbGVzOiBbXG4gICAgICAgIHsgUmVmOiAnU2VydmljZVJvbGUnIH0sXG4gICAgICBdLFxuICAgICAgUG9saWN5RG9jdW1lbnQ6IHtcbiAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgQWN0aW9uOiBbJ3MzOkdldE9iamVjdConXSxcbiAgICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcbiAgICAgICAgICAgIFJlc291cmNlOiB7XG4gICAgICAgICAgICAgIFJlZjogJ1dlYnNpdGVCdWNrZXRQYXJhbU5ldycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG5cbiAgY29uc3QgcG9saWN5Mk9sZCA9IHtcbiAgICBUeXBlOiAnQVdTOjpJQU06OlBvbGljeScsXG4gICAgUHJvcGVydGllczoge1xuICAgICAgUG9saWN5TmFtZTogJ215LXBvbGljeS1vbGQtMicsXG4gICAgICBSb2xlczogW1xuICAgICAgICB7IFJlZjogJ1NlcnZpY2VSb2xlJyB9LFxuICAgICAgXSxcbiAgICAgIFBvbGljeURvY3VtZW50OiB7XG4gICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIEFjdGlvbjogWydzMzpHZXRPYmplY3QqJ10sXG4gICAgICAgICAgICBFZmZlY3Q6ICdBbGxvdycsXG4gICAgICAgICAgICBSZXNvdXJjZToge1xuICAgICAgICAgICAgICBSZWY6ICdXZWJzaXRlQnVja2V0UGFyYW1PbGQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0IHBvbGljeTJOZXcgPSB7XG4gICAgVHlwZTogJ0FXUzo6SUFNOjpQb2xpY3knLFxuICAgIFByb3BlcnRpZXM6IHtcbiAgICAgIFBvbGljeU5hbWU6ICdteS1wb2xpY3ktbmV3LTInLFxuICAgICAgUm9sZXM6IFtcbiAgICAgICAgeyBSZWY6ICdTZXJ2aWNlUm9sZTInIH0sXG4gICAgICBdLFxuICAgICAgUG9saWN5RG9jdW1lbnQ6IHtcbiAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgQWN0aW9uOiBbJ3MzOkdldE9iamVjdConXSxcbiAgICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcbiAgICAgICAgICAgIFJlc291cmNlOiB7XG4gICAgICAgICAgICAgIFJlZjogJ0RpZmZlcmVudEJ1Y2tldFBhcmFtT2xkJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICBjb25zdCBkZXBsb3ltZW50TGFtYmRhID0ge1xuICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgIFJvbGU6IHtcbiAgICAgICdGbjo6R2V0QXR0JzogW1xuICAgICAgICAnU2VydmljZVJvbGUnLFxuICAgICAgICAnQXJuJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgfTtcblxuICBjb25zdCBzM0RlcGxveW1lbnRPbGQgPSB7XG4gICAgVHlwZTogJ0N1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCcsXG4gICAgUHJvcGVydGllczoge1xuICAgICAgU2VydmljZVRva2VuOiB7XG4gICAgICAgICdGbjo6R2V0QXR0JzogW1xuICAgICAgICAgICdTM0RlcGxveW1lbnRMYW1iZGEnLFxuICAgICAgICAgICdBcm4nLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIFNvdXJjZUJ1Y2tldE5hbWVzOiBbJ3NyYy1idWNrZXQtb2xkJ10sXG4gICAgICBTb3VyY2VPYmplY3RLZXlzOiBbJ3NyYy1rZXktb2xkJ10sXG4gICAgICBEZXN0aW5hdGlvbkJ1Y2tldE5hbWU6ICdXZWJzaXRlQnVja2V0T2xkJyxcbiAgICB9LFxuICB9O1xuXG4gIGNvbnN0IHMzRGVwbG95bWVudE5ldyA9IHtcbiAgICBUeXBlOiAnQ3VzdG9tOjpDREtCdWNrZXREZXBsb3ltZW50JyxcbiAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICBTZXJ2aWNlVG9rZW46IHtcbiAgICAgICAgJ0ZuOjpHZXRBdHQnOiBbXG4gICAgICAgICAgJ1MzRGVwbG95bWVudExhbWJkYScsXG4gICAgICAgICAgJ0FybicsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgU291cmNlQnVja2V0TmFtZXM6IFsnc3JjLWJ1Y2tldC1uZXcnXSxcbiAgICAgIFNvdXJjZU9iamVjdEtleXM6IFsnc3JjLWtleS1uZXcnXSxcbiAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ1dlYnNpdGVCdWNrZXROZXcnLFxuICAgIH0sXG4gIH07XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgc2V0dXAucHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoXG4gICAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignUzNEZXBsb3ltZW50TGFtYmRhJywgJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsICdteS1kZXBsb3ltZW50LWxhbWJkYScpLFxuICAgICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ1NlcnZpY2VSb2xlJywgJ0FXUzo6SUFNOjpSb2xlJywgJ215LXNlcnZpY2Utcm9sZScpLFxuICAgICk7XG4gIH0pO1xuXG4gIHRlc3QoJ2NhbGxzIHRoZSBsYW1iZGFJbnZva2UoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBhbiBhc3NldCBkaWZmZXJlbmNlIGluIGFuIFMzIGJ1Y2tldCBkZXBsb3ltZW50IGFuZCBhbiBJQU0gUG9saWN5IGRpZmZlcmVuY2UgdXNpbmcgb2xkLXN0eWxlIHN5bnRoZXNpcycsIGFzeW5jICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBQYXJhbWV0ZXJzOiBwYXJhbWV0ZXJzLFxuICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgIFBvbGljeTogcG9saWN5T2xkLFxuICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGE6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgIFMzRGVwbG95bWVudDogczNEZXBsb3ltZW50T2xkLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgICAgUGFyYW1ldGVyczogcGFyYW1ldGVycyxcbiAgICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgICAgUG9saWN5OiBwb2xpY3lOZXcsXG4gICAgICAgICAgUzNEZXBsb3ltZW50TGFtYmRhOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICAgIFMzRGVwbG95bWVudDogczNEZXBsb3ltZW50TmV3LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFdIRU5cbiAgICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCwgeyBXZWJzaXRlQnVja2V0UGFyYW1PbGQ6ICdXZWJzaXRlQnVja2V0T2xkJywgV2Vic2l0ZUJ1Y2tldFBhcmFtTmV3OiAnV2Vic2l0ZUJ1Y2tldE5ldycgfSk7XG5cbiAgICAvLyBUSEVOXG4gICAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICAgIGV4cGVjdChtb2NrTGFtYmRhSW52b2tlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgICBGdW5jdGlvbk5hbWU6ICdhcm46YXdzOmxhbWJkYTpoZXJlOjEyMzQ1Njc4OTAxMjpmdW5jdGlvbjpteS1kZXBsb3ltZW50LWxhbWJkYScsXG4gICAgICBQYXlsb2FkOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIC4uLnBheWxvYWRXaXRob3V0Q3VzdG9tUmVzUHJvcHMsXG4gICAgICAgIFJlc291cmNlUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZUJ1Y2tldE5hbWVzOiBbJ3NyYy1idWNrZXQtbmV3J10sXG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW5ldyddLFxuICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ1dlYnNpdGVCdWNrZXROZXcnLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIGxhbWJkYUludm9rZSgpIEFQSSB3aGVuIHRoZSBkaWZmZXJlbmNlIGluIHRoZSBTMyBkZXBsb3ltZW50IGlzIHJlZmVycmVkIHRvIGluIG9uZSBJQU0gcG9saWN5IGNoYW5nZSBidXQgbm90IGFub3RoZXInLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgU2VydmljZVJvbGU6IHNlcnZpY2VSb2xlLFxuICAgICAgICBQb2xpY3kxOiBwb2xpY3lPbGQsXG4gICAgICAgIFBvbGljeTI6IHBvbGljeTJPbGQsXG4gICAgICAgIFMzRGVwbG95bWVudExhbWJkYTogZGVwbG95bWVudExhbWJkYSxcbiAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnRPbGQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgICB0ZW1wbGF0ZToge1xuICAgICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgICAgUG9saWN5MTogcG9saWN5TmV3LFxuICAgICAgICAgIFBvbGljeTI6IHtcbiAgICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgUm9sZXM6IFtcbiAgICAgICAgICAgICAgICB7IFJlZjogJ1NlcnZpY2VSb2xlJyB9LFxuICAgICAgICAgICAgICAgICdkaWZmZXJlbnQtcm9sZScsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIFBvbGljeURvY3VtZW50OiB7XG4gICAgICAgICAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIEFjdGlvbjogWydzMzpHZXRPYmplY3QqJ10sXG4gICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAnRm46OkdldEF0dCc6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaWZmZXJlbnRCdWNrZXROZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FybicsXG4gICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGE6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnROZXcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gV0hFTlxuICAgIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICBleHBlY3QobW9ja0xhbWJkYUludm9rZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgfSk7XG5cbiAgdGVzdCgnZG9lcyBub3QgY2FsbCB0aGUgbGFtYmRhSW52b2tlKCkgQVBJIHdoZW4gdGhlIGxhbWJkYSB0aGF0IHJlZmVyZW5jZXMgdGhlIHJvbGUgaXMgcmVmZXJyZWQgdG8gYnkgc29tZXRoaW5nIG90aGVyIHRoYW4gYW4gUzMgZGVwbG95bWVudCcsIGFzeW5jICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgIFBvbGljeTogcG9saWN5T2xkLFxuICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGE6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgIFMzRGVwbG95bWVudDogczNEZXBsb3ltZW50T2xkLFxuICAgICAgICBFbmRwb2ludDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6UGVybWlzc2lvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQWN0aW9uOiAnbGFtYmRhOkludm9rZUZ1bmN0aW9uJyxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZToge1xuICAgICAgICAgICAgICAnRm46OkdldEF0dCc6IFtcbiAgICAgICAgICAgICAgICAnUzNEZXBsb3ltZW50TGFtYmRhJyxcbiAgICAgICAgICAgICAgICAnQXJuJyxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBQcmluY2lwYWw6ICdhcGlnYXRld2F5LmFtYXpvbmF3cy5jb20nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgICB0ZW1wbGF0ZToge1xuICAgICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgICAgUG9saWN5OiBwb2xpY3lOZXcsXG4gICAgICAgICAgUzNEZXBsb3ltZW50TGFtYmRhOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICAgIFMzRGVwbG95bWVudDogczNEZXBsb3ltZW50TmV3LFxuICAgICAgICAgIEVuZHBvaW50OiB7XG4gICAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OlBlcm1pc3Npb24nLFxuICAgICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgICBBY3Rpb246ICdsYW1iZGE6SW52b2tlRnVuY3Rpb24nLFxuICAgICAgICAgICAgICBGdW5jdGlvbk5hbWU6IHtcbiAgICAgICAgICAgICAgICAnRm46OkdldEF0dCc6IFtcbiAgICAgICAgICAgICAgICAgICdTM0RlcGxveW1lbnRMYW1iZGEnLFxuICAgICAgICAgICAgICAgICAgJ0FybicsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgUHJpbmNpcGFsOiAnYXBpZ2F0ZXdheS5hbWF6b25hd3MuY29tJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgIGV4cGVjdChtb2NrTGFtYmRhSW52b2tlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICB9KTtcblxuICB0ZXN0KCdjYWxscyB0aGUgbGFtYmRhSW52b2tlKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgYW4gYXNzZXQgZGlmZmVyZW5jZSBpbiB0d28gUzMgYnVja2V0IGRlcGxveW1lbnRzIGFuZCBJQU0gUG9saWN5IGRpZmZlcmVuY2VzIHVzaW5nIG9sZC1zdHlsZSBzeW50aGVzaXMnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBzM0RlcGxveW1lbnQyT2xkID0ge1xuICAgICAgVHlwZTogJ0N1c3RvbTo6Q0RLQnVja2V0RGVwbG95bWVudCcsXG4gICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgIFNlcnZpY2VUb2tlbjoge1xuICAgICAgICAgICdGbjo6R2V0QXR0JzogW1xuICAgICAgICAgICAgJ1MzRGVwbG95bWVudExhbWJkYTInLFxuICAgICAgICAgICAgJ0FybicsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgU291cmNlQnVja2V0TmFtZXM6IFsnc3JjLWJ1Y2tldC1vbGQnXSxcbiAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW9sZCddLFxuICAgICAgICBEZXN0aW5hdGlvbkJ1Y2tldE5hbWU6ICdEaWZmZXJlbnRCdWNrZXRPbGQnLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgY29uc3QgczNEZXBsb3ltZW50Mk5ldyA9IHtcbiAgICAgIFR5cGU6ICdDdXN0b206OkNES0J1Y2tldERlcGxveW1lbnQnLFxuICAgICAgUHJvcGVydGllczoge1xuICAgICAgICBTZXJ2aWNlVG9rZW46IHtcbiAgICAgICAgICAnRm46OkdldEF0dCc6IFtcbiAgICAgICAgICAgICdTM0RlcGxveW1lbnRMYW1iZGEyJyxcbiAgICAgICAgICAgICdBcm4nLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIFNvdXJjZUJ1Y2tldE5hbWVzOiBbJ3NyYy1idWNrZXQtbmV3J10sXG4gICAgICAgIFNvdXJjZU9iamVjdEtleXM6IFsnc3JjLWtleS1uZXcnXSxcbiAgICAgICAgRGVzdGluYXRpb25CdWNrZXROYW1lOiAnRGlmZmVyZW50QnVja2V0TmV3JyxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgIFNlcnZpY2VSb2xlMjogc2VydmljZVJvbGUsXG4gICAgICAgIFBvbGljeTE6IHBvbGljeU9sZCxcbiAgICAgICAgUG9saWN5MjogcG9saWN5Mk9sZCxcbiAgICAgICAgUzNEZXBsb3ltZW50TGFtYmRhOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGEyOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICBTM0RlcGxveW1lbnQ6IHMzRGVwbG95bWVudE9sZCxcbiAgICAgICAgUzNEZXBsb3ltZW50MjogczNEZXBsb3ltZW50Mk9sZCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIFJlc291cmNlczoge1xuICAgICAgICAgIFBhcmFtZXRlcnM6IHBhcmFtZXRlcnMsXG4gICAgICAgICAgU2VydmljZVJvbGU6IHNlcnZpY2VSb2xlLFxuICAgICAgICAgIFNlcnZpY2VSb2xlMjogc2VydmljZVJvbGUsXG4gICAgICAgICAgUG9saWN5MTogcG9saWN5TmV3LFxuICAgICAgICAgIFBvbGljeTI6IHBvbGljeTJOZXcsXG4gICAgICAgICAgUzNEZXBsb3ltZW50TGFtYmRhOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICAgIFMzRGVwbG95bWVudExhbWJkYTI6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnROZXcsXG4gICAgICAgICAgUzNEZXBsb3ltZW50MjogczNEZXBsb3ltZW50Mk5ldyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgc2V0dXAucHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoXG4gICAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignUzNEZXBsb3ltZW50TGFtYmRhMicsICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLCAnbXktZGVwbG95bWVudC1sYW1iZGEtMicpLFxuICAgICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ1NlcnZpY2VSb2xlMicsICdBV1M6OklBTTo6Um9sZScsICdteS1zZXJ2aWNlLXJvbGUtMicpLFxuICAgICk7XG5cbiAgICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCwge1xuICAgICAgV2Vic2l0ZUJ1Y2tldFBhcmFtT2xkOiAnV2Vic2l0ZUJ1Y2tldE9sZCcsXG4gICAgICBXZWJzaXRlQnVja2V0UGFyYW1OZXc6ICdXZWJzaXRlQnVja2V0TmV3JyxcbiAgICAgIERpZmZlcmVudEJ1Y2tldFBhcmFtTmV3OiAnV2Vic2l0ZUJ1Y2tldE5ldycsXG4gICAgfSk7XG5cbiAgICAvLyBUSEVOXG4gICAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICAgIGV4cGVjdChtb2NrTGFtYmRhSW52b2tlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgICBGdW5jdGlvbk5hbWU6ICdhcm46YXdzOmxhbWJkYTpoZXJlOjEyMzQ1Njc4OTAxMjpmdW5jdGlvbjpteS1kZXBsb3ltZW50LWxhbWJkYScsXG4gICAgICBQYXlsb2FkOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIC4uLnBheWxvYWRXaXRob3V0Q3VzdG9tUmVzUHJvcHMsXG4gICAgICAgIFJlc291cmNlUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZUJ1Y2tldE5hbWVzOiBbJ3NyYy1idWNrZXQtbmV3J10sXG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW5ldyddLFxuICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ1dlYnNpdGVCdWNrZXROZXcnLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgfSk7XG5cbiAgICBleHBlY3QobW9ja0xhbWJkYUludm9rZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgICAgRnVuY3Rpb25OYW1lOiAnYXJuOmF3czpsYW1iZGE6aGVyZToxMjM0NTY3ODkwMTI6ZnVuY3Rpb246bXktZGVwbG95bWVudC1sYW1iZGEtMicsXG4gICAgICBQYXlsb2FkOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIC4uLnBheWxvYWRXaXRob3V0Q3VzdG9tUmVzUHJvcHMsXG4gICAgICAgIFJlc291cmNlUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZUJ1Y2tldE5hbWVzOiBbJ3NyYy1idWNrZXQtbmV3J10sXG4gICAgICAgICAgU291cmNlT2JqZWN0S2V5czogWydzcmMta2V5LW5ldyddLFxuICAgICAgICAgIERlc3RpbmF0aW9uQnVja2V0TmFtZTogJ0RpZmZlcmVudEJ1Y2tldE5ldycsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgdGVzdCgnZG9lcyBub3QgY2FsbCB0aGUgbGFtYmRhSW52b2tlKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgYW4gYXNzZXQgZGlmZmVyZW5jZSBpbiBhbiBTMyBidWNrZXQgZGVwbG95bWVudCB0aGF0IHJlZmVyZW5jZXMgdHdvIGRpZmZlcmVudCBwb2xpY2llcycsIGFzeW5jICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBTZXJ2aWNlUm9sZTogc2VydmljZVJvbGUsXG4gICAgICAgIFBvbGljeTE6IHBvbGljeU9sZCxcbiAgICAgICAgUG9saWN5MjogcG9saWN5Mk9sZCxcbiAgICAgICAgUzNEZXBsb3ltZW50TGFtYmRhOiBkZXBsb3ltZW50TGFtYmRhLFxuICAgICAgICBTM0RlcGxveW1lbnQ6IHMzRGVwbG95bWVudE9sZCxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIFJlc291cmNlczoge1xuICAgICAgICAgIFNlcnZpY2VSb2xlOiBzZXJ2aWNlUm9sZSxcbiAgICAgICAgICBQb2xpY3kxOiBwb2xpY3lOZXcsXG4gICAgICAgICAgUG9saWN5Mjoge1xuICAgICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgICBSb2xlczogW1xuICAgICAgICAgICAgICAgIHsgUmVmOiAnU2VydmljZVJvbGUnIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIFBvbGljeURvY3VtZW50OiB7XG4gICAgICAgICAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIEFjdGlvbjogWydzMzpHZXRPYmplY3QqJ10sXG4gICAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IHtcbiAgICAgICAgICAgICAgICAgICAgICAnRm46OkdldEF0dCc6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaWZmZXJlbnRCdWNrZXROZXcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FybicsXG4gICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGE6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnROZXcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gV0hFTlxuICAgIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLnRvQmVVbmRlZmluZWQoKTtcbiAgICBleHBlY3QobW9ja0xhbWJkYUludm9rZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgfSk7XG5cbiAgdGVzdCgnZG9lcyBub3QgY2FsbCB0aGUgbGFtYmRhSW52b2tlKCkgQVBJIHdoZW4gYSBwb2xpY3kgaXMgcmVmZXJlbmNlZCBieSBhIHJlc291cmNlIHRoYXQgaXMgbm90IGFuIFMzIGRlcGxveW1lbnQnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgU2VydmljZVJvbGU6IHNlcnZpY2VSb2xlLFxuICAgICAgICBQb2xpY3kxOiBwb2xpY3lPbGQsXG4gICAgICAgIFMzRGVwbG95bWVudExhbWJkYTogZGVwbG95bWVudExhbWJkYSxcbiAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnRPbGQsXG4gICAgICAgIE5vdEFEZXBsb3ltZW50OiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Tm90OjpTM0RlcGxveW1lbnQnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFByb3A6IHtcbiAgICAgICAgICAgICAgUmVmOiAnU2VydmljZVJvbGUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgICAgU2VydmljZVJvbGU6IHNlcnZpY2VSb2xlLFxuICAgICAgICAgIFBvbGljeTE6IHBvbGljeU5ldyxcbiAgICAgICAgICBTM0RlcGxveW1lbnRMYW1iZGE6IGRlcGxveW1lbnRMYW1iZGEsXG4gICAgICAgICAgUzNEZXBsb3ltZW50OiBzM0RlcGxveW1lbnROZXcsXG4gICAgICAgICAgTm90QURlcGxveW1lbnQ6IHtcbiAgICAgICAgICAgIFR5cGU6ICdBV1M6Ok5vdDo6UzNEZXBsb3ltZW50JyxcbiAgICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgUHJvcDoge1xuICAgICAgICAgICAgICAgIFJlZjogJ1NlcnZpY2VSb2xlJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBXSEVOXG4gICAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICAgIGV4cGVjdChtb2NrTGFtYmRhSW52b2tlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpO1xuICB9KTtcbn0pOyJdfQ==