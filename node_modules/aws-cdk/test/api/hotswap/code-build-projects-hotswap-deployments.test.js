"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let hotswapMockSdkProvider;
let mockUpdateProject;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateProject = jest.fn();
    hotswapMockSdkProvider.setUpdateProjectMock(mockUpdateProject);
});
test('returns undefined when a new CodeBuild Project is added to the Stack', async () => {
    // GIVEN
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
});
test('calls the updateProject() API when it receives only a source difference in a CodeBuild project', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    Name: 'my-project',
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
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'new-spec',
                            Type: 'NO_SOURCE',
                        },
                        Name: 'my-project',
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
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'my-project',
        source: {
            type: 'NO_SOURCE',
            buildspec: 'new-spec',
        },
    });
});
test('calls the updateProject() API when it receives only a source version difference in a CodeBuild project', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    Name: 'my-project',
                    SourceVersion: 'v1',
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
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'current-spec',
                            Type: 'NO_SOURCE',
                        },
                        Name: 'my-project',
                        SourceVersion: 'v2',
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
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'my-project',
        sourceVersion: 'v2',
    });
});
test('calls the updateProject() API when it receives only an environment difference in a CodeBuild project', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    Name: 'my-project',
                    Environment: {
                        ComputeType: 'BUILD_GENERAL1_SMALL',
                        EnvironmentVariables: [
                            {
                                Name: 'SUPER_IMPORTANT_ENV_VAR',
                                Type: 'PLAINTEXT',
                                Value: 'super cool value',
                            },
                            {
                                Name: 'SECOND_IMPORTANT_ENV_VAR',
                                Type: 'PLAINTEXT',
                                Value: 'yet another super cool value',
                            },
                        ],
                        Image: 'aws/codebuild/standard:1.0',
                        ImagePullCredentialsType: 'CODEBUILD',
                        PrivilegedMode: false,
                        Type: 'LINUX_CONTAINER',
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
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'current-spec',
                            Type: 'NO_SOURCE',
                        },
                        Name: 'my-project',
                        Environment: {
                            ComputeType: 'BUILD_GENERAL1_SMALL',
                            EnvironmentVariables: [
                                {
                                    Name: 'SUPER_IMPORTANT_ENV_VAR',
                                    Type: 'PLAINTEXT',
                                    Value: 'changed value',
                                },
                                {
                                    Name: 'NEW_IMPORTANT_ENV_VAR',
                                    Type: 'PLAINTEXT',
                                    Value: 'new value',
                                },
                            ],
                            Image: 'aws/codebuild/standard:1.0',
                            ImagePullCredentialsType: 'CODEBUILD',
                            PrivilegedMode: false,
                            Type: 'LINUX_CONTAINER',
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
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'my-project',
        environment: {
            computeType: 'BUILD_GENERAL1_SMALL',
            environmentVariables: [
                {
                    name: 'SUPER_IMPORTANT_ENV_VAR',
                    type: 'PLAINTEXT',
                    value: 'changed value',
                },
                {
                    name: 'NEW_IMPORTANT_ENV_VAR',
                    type: 'PLAINTEXT',
                    value: 'new value',
                },
            ],
            image: 'aws/codebuild/standard:1.0',
            imagePullCredentialsType: 'CODEBUILD',
            privilegedMode: false,
            type: 'LINUX_CONTAINER',
        },
    });
});
test("correctly evaluates the project's name when it references a different resource from the template", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Bucket: {
                Type: 'AWS::S3::Bucket',
            },
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    Name: {
                        'Fn::Join': ['-', [
                                { Ref: 'Bucket' },
                                'project',
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
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'new-spec',
                            Type: 'NO_SOURCE',
                        },
                        Name: {
                            'Fn::Join': ['-', [
                                    { Ref: 'Bucket' },
                                    'project',
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
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'mybucket-project',
        source: {
            type: 'NO_SOURCE',
            buildspec: 'new-spec',
        },
    });
});
test("correctly falls back to taking the project's name from the current stack if it can't evaluate it in the template", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Parameters: {
            Param1: { Type: 'String' },
            AssetBucketParam: { Type: 'String' },
        },
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    Name: { Ref: 'Param1' },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('CodeBuildProject', 'AWS::CodeBuild::Project', 'my-project'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Parameters: {
                Param1: { Type: 'String' },
                AssetBucketParam: { Type: 'String' },
            },
            Resources: {
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'new-spec',
                            Type: 'NO_SOURCE',
                        },
                        Name: { Ref: 'Param1' },
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
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'my-project',
        source: {
            type: 'NO_SOURCE',
            buildspec: 'new-spec',
        },
    });
});
test("will not perform a hotswap deployment if it cannot find a Ref target (outside the project's name)", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Parameters: {
            Param1: { Type: 'String' },
        },
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: { 'Fn::Sub': '${Param1}' },
                        Type: 'NO_SOURCE',
                    },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('CodeBuildProject', 'AWS::CodeBuild::Project', 'my-project'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Parameters: {
                Param1: { Type: 'String' },
            },
            Resources: {
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: { 'Fn::Sub': '${Param1}' },
                            Type: 'CODEPIPELINE',
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
test("will not perform a hotswap deployment if it doesn't know how to handle a specific attribute (outside the project's name)", async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Bucket: {
                Type: 'AWS::S3::Bucket',
            },
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: { 'Fn::GetAtt': ['Bucket', 'UnknownAttribute'] },
                        Type: 'NO_SOURCE',
                    },
                },
                Metadata: {
                    'aws:asset:path': 'old-path',
                },
            },
        },
    });
    setup.pushStackResourceSummaries(setup.stackSummaryOf('CodeBuildProject', 'AWS::CodeBuild::Project', 'my-project'), setup.stackSummaryOf('Bucket', 'AWS::S3::Bucket', 'my-bucket'));
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Bucket: {
                    Type: 'AWS::S3::Bucket',
                },
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: { 'Fn::GetAtt': ['Bucket', 'UnknownAttribute'] },
                            Type: 'S3',
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
test('calls the updateProject() API when it receives a difference in a CodeBuild project with no name', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
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
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'new-spec',
                            Type: 'NO_SOURCE',
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
    setup.pushStackResourceSummaries(setup.stackSummaryOf('CodeBuildProject', 'AWS::CodeBuild::Project', 'mock-project-resource-id'));
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).not.toBeUndefined();
    expect(mockUpdateProject).toHaveBeenCalledWith({
        name: 'mock-project-resource-id',
        source: {
            type: 'NO_SOURCE',
            buildspec: 'new-spec',
        },
    });
});
test('does not call the updateProject() API when it receives a change that is not Source, SourceVersion, or Environment difference in a CodeBuild project', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::CodeBuild::Project',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
                    },
                    ConcurrentBuildLimit: 1,
                },
            },
        },
    });
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                CodeBuildProject: {
                    Type: 'AWS::CodeBuild::Project',
                    Properties: {
                        Source: {
                            BuildSpec: 'current-spec',
                            Type: 'NO_SOURCE',
                        },
                        ConcurrentBuildLimit: 2,
                    },
                },
            },
        },
    });
    // WHEN
    const deployStackResult = await hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    expect(deployStackResult).toBeUndefined();
    expect(mockUpdateProject).not.toHaveBeenCalled();
});
test('does not call the updateProject() API when a resource with type that is not AWS::CodeBuild::Project but has the same properties is changed', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            CodeBuildProject: {
                Type: 'AWS::NotCodeBuild::NotAProject',
                Properties: {
                    Source: {
                        BuildSpec: 'current-spec',
                        Type: 'NO_SOURCE',
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
                CodeBuildProject: {
                    Type: 'AWS::NotCodeBuild::NotAProject',
                    Properties: {
                        Source: {
                            BuildSpec: 'new-spec',
                            Type: 'NO_SOURCE',
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
    expect(mockUpdateProject).not.toHaveBeenCalled();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS1idWlsZC1wcm9qZWN0cy1ob3Rzd2FwLWRlcGxveW1lbnRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb2RlLWJ1aWxkLXByb2plY3RzLWhvdHN3YXAtZGVwbG95bWVudHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDhDQUE4QztBQUU5QyxJQUFJLHNCQUFvRCxDQUFDO0FBQ3pELElBQUksaUJBQTBGLENBQUM7QUFFL0YsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUM5QixzQkFBc0IsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQyxDQUFDO0FBRUgsSUFBSSxDQUFDLHNFQUFzRSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3RGLFFBQVE7SUFDUixNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxRQUFRLEVBQUU7WUFDUixTQUFTLEVBQUU7Z0JBQ1QsZ0JBQWdCLEVBQUU7b0JBQ2hCLElBQUksRUFBRSx5QkFBeUI7aUJBQ2hDO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU87SUFDUCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU5RixPQUFPO0lBQ1AsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDNUMsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsZ0dBQWdHLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDaEgsUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxnQkFBZ0IsRUFBRTtnQkFDaEIsSUFBSSxFQUFF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b20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgc2V0dXAgZnJvbSAnLi9ob3Rzd2FwLXRlc3Qtc2V0dXAnO1xuXG5sZXQgaG90c3dhcE1vY2tTZGtQcm92aWRlcjogc2V0dXAuSG90c3dhcE1vY2tTZGtQcm92aWRlcjtcbmxldCBtb2NrVXBkYXRlUHJvamVjdDogKHBhcmFtczogQ29kZUJ1aWxkLlVwZGF0ZVByb2plY3RJbnB1dCkgPT4gQ29kZUJ1aWxkLlVwZGF0ZVByb2plY3RPdXRwdXQ7XG5cbmJlZm9yZUVhY2goKCkgPT4ge1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwVGVzdHMoKTtcbiAgbW9ja1VwZGF0ZVByb2plY3QgPSBqZXN0LmZuKCk7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuc2V0VXBkYXRlUHJvamVjdE1vY2sobW9ja1VwZGF0ZVByb2plY3QpO1xufSk7XG5cbnRlc3QoJ3JldHVybnMgdW5kZWZpbmVkIHdoZW4gYSBuZXcgQ29kZUJ1aWxkIFByb2plY3QgaXMgYWRkZWQgdG8gdGhlIFN0YWNrJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xufSk7XG5cbnRlc3QoJ2NhbGxzIHRoZSB1cGRhdGVQcm9qZWN0KCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhIHNvdXJjZSBkaWZmZXJlbmNlIGluIGEgQ29kZUJ1aWxkIHByb2plY3QnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiAnY3VycmVudC1zcGVjJyxcbiAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTmFtZTogJ215LXByb2plY3QnLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgICBCdWlsZFNwZWM6ICduZXctc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE5hbWU6ICdteS1wcm9qZWN0JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVByb2plY3QpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBuYW1lOiAnbXktcHJvamVjdCcsXG4gICAgc291cmNlOiB7XG4gICAgICB0eXBlOiAnTk9fU09VUkNFJyxcbiAgICAgIGJ1aWxkc3BlYzogJ25ldy1zcGVjJyxcbiAgICB9LFxuICB9KTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgdXBkYXRlUHJvamVjdCgpIEFQSSB3aGVuIGl0IHJlY2VpdmVzIG9ubHkgYSBzb3VyY2UgdmVyc2lvbiBkaWZmZXJlbmNlIGluIGEgQ29kZUJ1aWxkIHByb2plY3QnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiAnY3VycmVudC1zcGVjJyxcbiAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTmFtZTogJ215LXByb2plY3QnLFxuICAgICAgICAgIFNvdXJjZVZlcnNpb246ICd2MScsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ29kZUJ1aWxkUHJvamVjdDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU291cmNlOiB7XG4gICAgICAgICAgICAgIEJ1aWxkU3BlYzogJ2N1cnJlbnQtc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE5hbWU6ICdteS1wcm9qZWN0JyxcbiAgICAgICAgICAgIFNvdXJjZVZlcnNpb246ICd2MicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVQcm9qZWN0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgbmFtZTogJ215LXByb2plY3QnLFxuICAgIHNvdXJjZVZlcnNpb246ICd2MicsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2NhbGxzIHRoZSB1cGRhdGVQcm9qZWN0KCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhbiBlbnZpcm9ubWVudCBkaWZmZXJlbmNlIGluIGEgQ29kZUJ1aWxkIHByb2plY3QnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiAnY3VycmVudC1zcGVjJyxcbiAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTmFtZTogJ215LXByb2plY3QnLFxuICAgICAgICAgIEVudmlyb25tZW50OiB7XG4gICAgICAgICAgICBDb21wdXRlVHlwZTogJ0JVSUxEX0dFTkVSQUwxX1NNQUxMJyxcbiAgICAgICAgICAgIEVudmlyb25tZW50VmFyaWFibGVzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBOYW1lOiAnU1VQRVJfSU1QT1JUQU5UX0VOVl9WQVInLFxuICAgICAgICAgICAgICAgIFR5cGU6ICdQTEFJTlRFWFQnLFxuICAgICAgICAgICAgICAgIFZhbHVlOiAnc3VwZXIgY29vbCB2YWx1ZScsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBOYW1lOiAnU0VDT05EX0lNUE9SVEFOVF9FTlZfVkFSJyxcbiAgICAgICAgICAgICAgICBUeXBlOiAnUExBSU5URVhUJyxcbiAgICAgICAgICAgICAgICBWYWx1ZTogJ3lldCBhbm90aGVyIHN1cGVyIGNvb2wgdmFsdWUnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIEltYWdlOiAnYXdzL2NvZGVidWlsZC9zdGFuZGFyZDoxLjAnLFxuICAgICAgICAgICAgSW1hZ2VQdWxsQ3JlZGVudGlhbHNUeXBlOiAnQ09ERUJVSUxEJyxcbiAgICAgICAgICAgIFByaXZpbGVnZWRNb2RlOiBmYWxzZSxcbiAgICAgICAgICAgIFR5cGU6ICdMSU5VWF9DT05UQUlORVInLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ29kZUJ1aWxkUHJvamVjdDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU291cmNlOiB7XG4gICAgICAgICAgICAgIEJ1aWxkU3BlYzogJ2N1cnJlbnQtc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE5hbWU6ICdteS1wcm9qZWN0JyxcbiAgICAgICAgICAgIEVudmlyb25tZW50OiB7XG4gICAgICAgICAgICAgIENvbXB1dGVUeXBlOiAnQlVJTERfR0VORVJBTDFfU01BTEwnLFxuICAgICAgICAgICAgICBFbnZpcm9ubWVudFZhcmlhYmxlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIE5hbWU6ICdTVVBFUl9JTVBPUlRBTlRfRU5WX1ZBUicsXG4gICAgICAgICAgICAgICAgICBUeXBlOiAnUExBSU5URVhUJyxcbiAgICAgICAgICAgICAgICAgIFZhbHVlOiAnY2hhbmdlZCB2YWx1ZScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBOYW1lOiAnTkVXX0lNUE9SVEFOVF9FTlZfVkFSJyxcbiAgICAgICAgICAgICAgICAgIFR5cGU6ICdQTEFJTlRFWFQnLFxuICAgICAgICAgICAgICAgICAgVmFsdWU6ICduZXcgdmFsdWUnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIEltYWdlOiAnYXdzL2NvZGVidWlsZC9zdGFuZGFyZDoxLjAnLFxuICAgICAgICAgICAgICBJbWFnZVB1bGxDcmVkZW50aWFsc1R5cGU6ICdDT0RFQlVJTEQnLFxuICAgICAgICAgICAgICBQcml2aWxlZ2VkTW9kZTogZmFsc2UsXG4gICAgICAgICAgICAgIFR5cGU6ICdMSU5VWF9DT05UQUlORVInLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVByb2plY3QpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBuYW1lOiAnbXktcHJvamVjdCcsXG4gICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgIGNvbXB1dGVUeXBlOiAnQlVJTERfR0VORVJBTDFfU01BTEwnLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdTVVBFUl9JTVBPUlRBTlRfRU5WX1ZBUicsXG4gICAgICAgICAgdHlwZTogJ1BMQUlOVEVYVCcsXG4gICAgICAgICAgdmFsdWU6ICdjaGFuZ2VkIHZhbHVlJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdORVdfSU1QT1JUQU5UX0VOVl9WQVInLFxuICAgICAgICAgIHR5cGU6ICdQTEFJTlRFWFQnLFxuICAgICAgICAgIHZhbHVlOiAnbmV3IHZhbHVlJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBpbWFnZTogJ2F3cy9jb2RlYnVpbGQvc3RhbmRhcmQ6MS4wJyxcbiAgICAgIGltYWdlUHVsbENyZWRlbnRpYWxzVHlwZTogJ0NPREVCVUlMRCcsXG4gICAgICBwcml2aWxlZ2VkTW9kZTogZmFsc2UsXG4gICAgICB0eXBlOiAnTElOVVhfQ09OVEFJTkVSJyxcbiAgICB9LFxuICB9KTtcbn0pO1xuXG50ZXN0KFwiY29ycmVjdGx5IGV2YWx1YXRlcyB0aGUgcHJvamVjdCdzIG5hbWUgd2hlbiBpdCByZWZlcmVuY2VzIGEgZGlmZmVyZW50IHJlc291cmNlIGZyb20gdGhlIHRlbXBsYXRlXCIsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQnVja2V0OiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OlMzOjpCdWNrZXQnLFxuICAgICAgfSxcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiAnY3VycmVudC1zcGVjJyxcbiAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTmFtZToge1xuICAgICAgICAgICAgJ0ZuOjpKb2luJzogWyctJywgW1xuICAgICAgICAgICAgICB7IFJlZjogJ0J1Y2tldCcgfSxcbiAgICAgICAgICAgICAgJ3Byb2plY3QnLFxuICAgICAgICAgICAgXV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnb2xkLXBhdGgnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcbiAgc2V0dXAucHVzaFN0YWNrUmVzb3VyY2VTdW1tYXJpZXMoc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ0J1Y2tldCcsICdBV1M6OlMzOjpCdWNrZXQnLCAnbXlidWNrZXQnKSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQnVja2V0OiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6UzM6OkJ1Y2tldCcsXG4gICAgICAgIH0sXG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgICBCdWlsZFNwZWM6ICduZXctc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE5hbWU6IHtcbiAgICAgICAgICAgICAgJ0ZuOjpKb2luJzogWyctJywgW1xuICAgICAgICAgICAgICAgIHsgUmVmOiAnQnVja2V0JyB9LFxuICAgICAgICAgICAgICAgICdwcm9qZWN0JyxcbiAgICAgICAgICAgICAgXV0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgTWV0YWRhdGE6IHtcbiAgICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlUHJvamVjdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIG5hbWU6ICdteWJ1Y2tldC1wcm9qZWN0JyxcbiAgICBzb3VyY2U6IHtcbiAgICAgIHR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgYnVpbGRzcGVjOiAnbmV3LXNwZWMnLFxuICAgIH0sXG4gIH0pO1xufSk7XG5cbnRlc3QoXCJjb3JyZWN0bHkgZmFsbHMgYmFjayB0byB0YWtpbmcgdGhlIHByb2plY3QncyBuYW1lIGZyb20gdGhlIGN1cnJlbnQgc3RhY2sgaWYgaXQgY2FuJ3QgZXZhbHVhdGUgaXQgaW4gdGhlIHRlbXBsYXRlXCIsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgIFBhcmFtMTogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgICAgQXNzZXRCdWNrZXRQYXJhbTogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgIH0sXG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBDb2RlQnVpbGRQcm9qZWN0OiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBTb3VyY2U6IHtcbiAgICAgICAgICAgIEJ1aWxkU3BlYzogJ2N1cnJlbnQtc3BlYycsXG4gICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE5hbWU6IHsgUmVmOiAnUGFyYW0xJyB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBzZXR1cC5wdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzZXR1cC5zdGFja1N1bW1hcnlPZignQ29kZUJ1aWxkUHJvamVjdCcsICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsICdteS1wcm9qZWN0JykpO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUGFyYW1ldGVyczoge1xuICAgICAgICBQYXJhbTE6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgICAgQXNzZXRCdWNrZXRQYXJhbTogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgICAgfSxcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBDb2RlQnVpbGRQcm9qZWN0OiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBTb3VyY2U6IHtcbiAgICAgICAgICAgICAgQnVpbGRTcGVjOiAnbmV3LXNwZWMnLFxuICAgICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBOYW1lOiB7IFJlZjogJ1BhcmFtMScgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QsIHsgQXNzZXRCdWNrZXRQYXJhbTogJ2Fzc2V0LWJ1Y2tldCcgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlUHJvamVjdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIG5hbWU6ICdteS1wcm9qZWN0JyxcbiAgICBzb3VyY2U6IHtcbiAgICAgIHR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgYnVpbGRzcGVjOiAnbmV3LXNwZWMnLFxuICAgIH0sXG4gIH0pO1xufSk7XG5cbnRlc3QoXCJ3aWxsIG5vdCBwZXJmb3JtIGEgaG90c3dhcCBkZXBsb3ltZW50IGlmIGl0IGNhbm5vdCBmaW5kIGEgUmVmIHRhcmdldCAob3V0c2lkZSB0aGUgcHJvamVjdCdzIG5hbWUpXCIsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFBhcmFtZXRlcnM6IHtcbiAgICAgIFBhcmFtMTogeyBUeXBlOiAnU3RyaW5nJyB9LFxuICAgIH0sXG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBDb2RlQnVpbGRQcm9qZWN0OiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBTb3VyY2U6IHtcbiAgICAgICAgICAgIEJ1aWxkU3BlYzogeyAnRm46OlN1Yic6ICcke1BhcmFtMX0nIH0sXG4gICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBzZXR1cC5wdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhzZXR1cC5zdGFja1N1bW1hcnlPZignQ29kZUJ1aWxkUHJvamVjdCcsICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsICdteS1wcm9qZWN0JykpO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUGFyYW1ldGVyczoge1xuICAgICAgICBQYXJhbTE6IHsgVHlwZTogJ1N0cmluZycgfSxcbiAgICAgIH0sXG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ29kZUJ1aWxkUHJvamVjdDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU291cmNlOiB7XG4gICAgICAgICAgICAgIEJ1aWxkU3BlYzogeyAnRm46OlN1Yic6ICcke1BhcmFtMX0nIH0sXG4gICAgICAgICAgICAgIFR5cGU6ICdDT0RFUElQRUxJTkUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgYXdhaXQgZXhwZWN0KCgpID0+XG4gICAgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KSxcbiAgKS5yZWplY3RzLnRvVGhyb3coL1BhcmFtZXRlciBvciByZXNvdXJjZSAnUGFyYW0xJyBjb3VsZCBub3QgYmUgZm91bmQgZm9yIGV2YWx1YXRpb24vKTtcbn0pO1xuXG50ZXN0KFwid2lsbCBub3QgcGVyZm9ybSBhIGhvdHN3YXAgZGVwbG95bWVudCBpZiBpdCBkb2Vzbid0IGtub3cgaG93IHRvIGhhbmRsZSBhIHNwZWNpZmljIGF0dHJpYnV0ZSAob3V0c2lkZSB0aGUgcHJvamVjdCdzIG5hbWUpXCIsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQnVja2V0OiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OlMzOjpCdWNrZXQnLFxuICAgICAgfSxcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiB7ICdGbjo6R2V0QXR0JzogWydCdWNrZXQnLCAnVW5rbm93bkF0dHJpYnV0ZSddIH0sXG4gICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBzZXR1cC5wdXNoU3RhY2tSZXNvdXJjZVN1bW1hcmllcyhcbiAgICBzZXR1cC5zdGFja1N1bW1hcnlPZignQ29kZUJ1aWxkUHJvamVjdCcsICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsICdteS1wcm9qZWN0JyksXG4gICAgc2V0dXAuc3RhY2tTdW1tYXJ5T2YoJ0J1Y2tldCcsICdBV1M6OlMzOjpCdWNrZXQnLCAnbXktYnVja2V0JyksXG4gICk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQnVja2V0OiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6UzM6OkJ1Y2tldCcsXG4gICAgICAgIH0sXG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgICBCdWlsZFNwZWM6IHsgJ0ZuOjpHZXRBdHQnOiBbJ0J1Y2tldCcsICdVbmtub3duQXR0cmlidXRlJ10gfSxcbiAgICAgICAgICAgICAgVHlwZTogJ1MzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBUSEVOXG4gIGF3YWl0IGV4cGVjdCgoKSA9PlxuICAgIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCksXG4gICkucmVqZWN0cy50b1Rocm93KFwiV2UgZG9uJ3Qgc3VwcG9ydCB0aGUgJ1Vua25vd25BdHRyaWJ1dGUnIGF0dHJpYnV0ZSBvZiB0aGUgJ0FXUzo6UzM6OkJ1Y2tldCcgcmVzb3VyY2UuIFRoaXMgaXMgYSBDREsgbGltaXRhdGlvbi4gUGxlYXNlIHJlcG9ydCBpdCBhdCBodHRwczovL2dpdGh1Yi5jb20vYXdzL2F3cy1jZGsvaXNzdWVzL25ldy9jaG9vc2VcIik7XG59KTtcblxudGVzdCgnY2FsbHMgdGhlIHVwZGF0ZVByb2plY3QoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBhIGRpZmZlcmVuY2UgaW4gYSBDb2RlQnVpbGQgcHJvamVjdCB3aXRoIG5vIG5hbWUnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgQnVpbGRTcGVjOiAnY3VycmVudC1zcGVjJyxcbiAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ2N1cnJlbnQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFNvdXJjZToge1xuICAgICAgICAgICAgICBCdWlsZFNwZWM6ICduZXctc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnY3VycmVudC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIHNldHVwLnB1c2hTdGFja1Jlc291cmNlU3VtbWFyaWVzKHNldHVwLnN0YWNrU3VtbWFyeU9mKCdDb2RlQnVpbGRQcm9qZWN0JywgJ0FXUzo6Q29kZUJ1aWxkOjpQcm9qZWN0JywgJ21vY2stcHJvamVjdC1yZXNvdXJjZS1pZCcpKTtcbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVByb2plY3QpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBuYW1lOiAnbW9jay1wcm9qZWN0LXJlc291cmNlLWlkJyxcbiAgICBzb3VyY2U6IHtcbiAgICAgIHR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgYnVpbGRzcGVjOiAnbmV3LXNwZWMnLFxuICAgIH0sXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2RvZXMgbm90IGNhbGwgdGhlIHVwZGF0ZVByb2plY3QoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBhIGNoYW5nZSB0aGF0IGlzIG5vdCBTb3VyY2UsIFNvdXJjZVZlcnNpb24sIG9yIEVudmlyb25tZW50IGRpZmZlcmVuY2UgaW4gYSBDb2RlQnVpbGQgcHJvamVjdCcsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgQ29kZUJ1aWxkUHJvamVjdDoge1xuICAgICAgICBUeXBlOiAnQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QnLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgU291cmNlOiB7XG4gICAgICAgICAgICBCdWlsZFNwZWM6ICdjdXJyZW50LXNwZWMnLFxuICAgICAgICAgICAgVHlwZTogJ05PX1NPVVJDRScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBDb25jdXJyZW50QnVpbGRMaW1pdDogMSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgQ29kZUJ1aWxkUHJvamVjdDoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkNvZGVCdWlsZDo6UHJvamVjdCcsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgU291cmNlOiB7XG4gICAgICAgICAgICAgIEJ1aWxkU3BlYzogJ2N1cnJlbnQtc3BlYycsXG4gICAgICAgICAgICAgIFR5cGU6ICdOT19TT1VSQ0UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIENvbmN1cnJlbnRCdWlsZExpbWl0OiAyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlUHJvamVjdCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKTtcbn0pO1xuXG50ZXN0KCdkb2VzIG5vdCBjYWxsIHRoZSB1cGRhdGVQcm9qZWN0KCkgQVBJIHdoZW4gYSByZXNvdXJjZSB3aXRoIHR5cGUgdGhhdCBpcyBub3QgQVdTOjpDb2RlQnVpbGQ6OlByb2plY3QgYnV0IGhhcyB0aGUgc2FtZSBwcm9wZXJ0aWVzIGlzIGNoYW5nZWQnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6Tm90Q29kZUJ1aWxkOjpOb3RBUHJvamVjdCcsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBTb3VyY2U6IHtcbiAgICAgICAgICAgIEJ1aWxkU3BlYzogJ2N1cnJlbnQtc3BlYycsXG4gICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIENvZGVCdWlsZFByb2plY3Q6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpOb3RDb2RlQnVpbGQ6Ok5vdEFQcm9qZWN0JyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBTb3VyY2U6IHtcbiAgICAgICAgICAgICAgQnVpbGRTcGVjOiAnbmV3LXNwZWMnLFxuICAgICAgICAgICAgICBUeXBlOiAnTk9fU09VUkNFJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZVByb2plY3QpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCk7XG59KTsiXX0=