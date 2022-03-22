"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let mockUpdateLambdaCode;
let mockTagResource;
let mockUntagResource;
let hotswapMockSdkProvider;
let mockMakeRequest;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateLambdaCode = jest.fn().mockReturnValue({
        PackageType: 'Image',
    });
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
test('calls the updateLambdaCode() API when it receives only a code difference in a Lambda function', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        ImageUri: 'current-image',
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
                            ImageUri: 'new-image',
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
        ImageUri: 'new-image',
    });
});
test('calls the getFunction() API with a delay of 5', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        ImageUri: 'current-image',
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
                            ImageUri: 'new-image',
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
            delay: 5,
        }),
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLWZ1bmN0aW9ucy1kb2NrZXItaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLWZ1bmN0aW9ucy1kb2NrZXItaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOENBQThDO0FBRTlDLElBQUksb0JBQTRHLENBQUM7QUFDakgsSUFBSSxlQUFnRSxDQUFDO0FBQ3JFLElBQUksaUJBQW9FLENBQUM7QUFDekUsSUFBSSxzQkFBb0QsQ0FBQztBQUN6RCxJQUFJLGVBQW1GLENBQUM7QUFFeEYsVUFBVSxDQUFDLEdBQUcsRUFBRTtJQUNkLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25ELG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDL0MsV0FBVyxFQUFFLE9BQU87S0FDckIsQ0FBQyxDQUFDO0lBQ0gsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUM1QixpQkFBaUIsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDOUIsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDMUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ2xDLFFBQVEsRUFBRSxFQUFFO1FBQ1osWUFBWSxFQUFFLEdBQUcsRUFBRSxHQUFFLENBQUM7S0FDdkIsQ0FBQyxDQUFDO0lBQ0gsc0JBQXNCLENBQUMsVUFBVSxDQUFDO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtRQUN4QyxXQUFXLEVBQUUsZUFBZTtRQUM1QixhQUFhLEVBQUUsaUJBQWlCO0tBQ2pDLEVBQUU7UUFDRCxXQUFXLEVBQUUsZUFBZTtLQUM3QixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVI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dGVudCI6WyJpbXBvcnQgeyBMYW1iZGEgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCAqIGFzIHNldHVwIGZyb20gJy4vaG90c3dhcC10ZXN0LXNldHVwJztcblxubGV0IG1vY2tVcGRhdGVMYW1iZGFDb2RlOiAocGFyYW1zOiBMYW1iZGEuVHlwZXMuVXBkYXRlRnVuY3Rpb25Db2RlUmVxdWVzdCkgPT4gTGFtYmRhLlR5cGVzLkZ1bmN0aW9uQ29uZmlndXJhdGlvbjtcbmxldCBtb2NrVGFnUmVzb3VyY2U6IChwYXJhbXM6IExhbWJkYS5UeXBlcy5UYWdSZXNvdXJjZVJlcXVlc3QpID0+IHt9O1xubGV0IG1vY2tVbnRhZ1Jlc291cmNlOiAocGFyYW1zOiBMYW1iZGEuVHlwZXMuVW50YWdSZXNvdXJjZVJlcXVlc3QpID0+IHt9O1xubGV0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXI6IHNldHVwLkhvdHN3YXBNb2NrU2RrUHJvdmlkZXI7XG5sZXQgbW9ja01ha2VSZXF1ZXN0OiAob3BlcmF0aW9uOiBzdHJpbmcsIHBhcmFtczogYW55KSA9PiBBV1MuUmVxdWVzdDxhbnksIEFXUy5BV1NFcnJvcj47XG5cbmJlZm9yZUVhY2goKCkgPT4ge1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyID0gc2V0dXAuc2V0dXBIb3Rzd2FwVGVzdHMoKTtcbiAgbW9ja1VwZGF0ZUxhbWJkYUNvZGUgPSBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHtcbiAgICBQYWNrYWdlVHlwZTogJ0ltYWdlJyxcbiAgfSk7XG4gIG1vY2tUYWdSZXNvdXJjZSA9IGplc3QuZm4oKTtcbiAgbW9ja1VudGFnUmVzb3VyY2UgPSBqZXN0LmZuKCk7XG4gIG1vY2tNYWtlUmVxdWVzdCA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe1xuICAgIHByb21pc2U6ICgpID0+IFByb21pc2UucmVzb2x2ZSh7fSksXG4gICAgcmVzcG9uc2U6IHt9LFxuICAgIGFkZExpc3RlbmVyczogKCkgPT4ge30sXG4gIH0pO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gICAgdGFnUmVzb3VyY2U6IG1vY2tUYWdSZXNvdXJjZSxcbiAgICB1bnRhZ1Jlc291cmNlOiBtb2NrVW50YWdSZXNvdXJjZSxcbiAgfSwge1xuICAgIG1ha2VSZXF1ZXN0OiBtb2NrTWFrZVJlcXVlc3QsXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2NhbGxzIHRoZSB1cGRhdGVMYW1iZGFDb2RlKCkgQVBJIHdoZW4gaXQgcmVjZWl2ZXMgb25seSBhIGNvZGUgZGlmZmVyZW5jZSBpbiBhIExhbWJkYSBmdW5jdGlvbicsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIEltYWdlVXJpOiAnY3VycmVudC1pbWFnZScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ29sZC1wYXRoJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgSW1hZ2VVcmk6ICduZXctaW1hZ2UnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIE1ldGFkYXRhOiB7XG4gICAgICAgICAgICAnYXdzOmFzc2V0OnBhdGgnOiAnbmV3LXBhdGgnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgZGVwbG95U3RhY2tSZXN1bHQgPSBhd2FpdCBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnRyeUhvdHN3YXBEZXBsb3ltZW50KGNka1N0YWNrQXJ0aWZhY3QpO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KGRlcGxveVN0YWNrUmVzdWx0KS5ub3QudG9CZVVuZGVmaW5lZCgpO1xuICBleHBlY3QobW9ja1VwZGF0ZUxhbWJkYUNvZGUpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHtcbiAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgSW1hZ2VVcmk6ICduZXctaW1hZ2UnLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdjYWxscyB0aGUgZ2V0RnVuY3Rpb24oKSBBUEkgd2l0aCBhIGRlbGF5IG9mIDUnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBJbWFnZVVyaTogJ2N1cnJlbnQtaW1hZ2UnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICB9LFxuICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICdhd3M6YXNzZXQ6cGF0aCc6ICdvbGQtcGF0aCcsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBjZGtTdGFja0FydGlmYWN0ID0gc2V0dXAuY2RrU3RhY2tBcnRpZmFjdE9mKHtcbiAgICB0ZW1wbGF0ZToge1xuICAgICAgUmVzb3VyY2VzOiB7XG4gICAgICAgIEZ1bmM6IHtcbiAgICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICAgIEltYWdlVXJpOiAnbmV3LWltYWdlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBNZXRhZGF0YToge1xuICAgICAgICAgICAgJ2F3czphc3NldDpwYXRoJzogJ25ldy1wYXRoJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QobW9ja01ha2VSZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aCgnZ2V0RnVuY3Rpb24nLCB7IEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyB9KTtcbiAgZXhwZWN0KGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIuZ2V0TGFtYmRhQXBpV2FpdGVycygpKS50b0VxdWFsKGV4cGVjdC5vYmplY3RDb250YWluaW5nKHtcbiAgICB1cGRhdGVGdW5jdGlvbkNvZGVUb0ZpbmlzaDogZXhwZWN0Lm9iamVjdENvbnRhaW5pbmcoe1xuICAgICAgbmFtZTogJ1VwZGF0ZUZ1bmN0aW9uQ29kZVRvRmluaXNoJyxcbiAgICAgIGRlbGF5OiA1LFxuICAgIH0pLFxuICB9KSk7XG59KTtcbiJdfQ==