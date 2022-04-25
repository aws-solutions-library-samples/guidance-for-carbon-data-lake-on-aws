"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup = require("./hotswap-test-setup");
let mockUpdateLambdaCode;
let mockTagResource;
let mockUntagResource;
let hotswapMockSdkProvider;
beforeEach(() => {
    hotswapMockSdkProvider = setup.setupHotswapTests();
    mockUpdateLambdaCode = jest.fn().mockReturnValue({});
    mockTagResource = jest.fn();
    mockUntagResource = jest.fn();
    hotswapMockSdkProvider.stubLambda({
        updateFunctionCode: mockUpdateLambdaCode,
        tagResource: mockTagResource,
        untagResource: mockUntagResource,
    });
});
test('calls the updateLambdaCode() API when it receives only a code difference in a Lambda function (Inline Node.js code)', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        ZipFile: 'exports.handler = () => {return true}',
                    },
                    Runtime: 'nodejs14.x',
                    FunctionName: 'my-function',
                },
            },
        },
    });
    const newCode = 'exports.handler = () => {return false}';
    const cdkStackArtifact = setup.cdkStackArtifactOf({
        template: {
            Resources: {
                Func: {
                    Type: 'AWS::Lambda::Function',
                    Properties: {
                        Code: {
                            ZipFile: newCode,
                        },
                        Runtime: 'nodejs14.x',
                        FunctionName: 'my-function',
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
        ZipFile: expect.any(Buffer),
    });
});
test('calls the updateLambdaCode() API when it receives only a code difference in a Lambda function (Inline Python code)', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        ZipFile: 'def handler(event, context):\n  return True',
                    },
                    Runtime: 'python3.9',
                    FunctionName: 'my-function',
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
                            ZipFile: 'def handler(event, context):\n  return False',
                        },
                        Runtime: 'python3.9',
                        FunctionName: 'my-function',
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
        ZipFile: expect.any(Buffer),
    });
});
test('throw a CfnEvaluationException when it receives an unsupported function runtime', async () => {
    // GIVEN
    setup.setCurrentCfnStackTemplate({
        Resources: {
            Func: {
                Type: 'AWS::Lambda::Function',
                Properties: {
                    Code: {
                        ZipFile: 'def handler(event:, context:) true end',
                    },
                    Runtime: 'ruby2.7',
                    FunctionName: 'my-function',
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
                            ZipFile: 'def handler(event:, context:) false end',
                        },
                        Runtime: 'ruby2.7',
                        FunctionName: 'my-function',
                    },
                },
            },
        },
    });
    // WHEN
    const tryHotswap = hotswapMockSdkProvider.tryHotswapDeployment(cdkStackArtifact);
    // THEN
    await expect(tryHotswap).rejects.toThrow('runtime ruby2.7 is unsupported, only node.js and python runtimes are currently supported.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLWZ1bmN0aW9ucy1pbmxpbmUtaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLWZ1bmN0aW9ucy1pbmxpbmUtaG90c3dhcC1kZXBsb3ltZW50cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOENBQThDO0FBRTlDLElBQUksb0JBQTRHLENBQUM7QUFDakgsSUFBSSxlQUFnRSxDQUFDO0FBQ3JFLElBQUksaUJBQW9FLENBQUM7QUFDekUsSUFBSSxzQkFBb0QsQ0FBQztBQUV6RCxVQUFVLENBQUMsR0FBRyxFQUFFO0lBQ2Qsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbkQsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQzVCLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUM5QixzQkFBc0IsQ0FBQyxVQUFVLENBQUM7UUFDaEMsa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLFdBQVcsRUFBRSxlQUFlO1FBQzVCLGFBQWEsRUFBRSxpQkFBaUI7S0FDakMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUhBQXFILEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDckksUUFBUTtJQUNSLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUMvQixTQUFTLEVBQUU7WUFDVCxJQUFJLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLHVCQUF1QjtnQkFDN0IsVUFBVSxFQUFFO29CQUNWLElBQUksRUFBRTt3QkFDSixPQUFPLEVBQUUsdUNBQXVDO3FCQUNqRDtvQkFDRCxPQUFPLEVBQUUsWUFBWTtvQkFDckIsWUFBWSxFQUFFLGFBQWE7aUJBQzVCO2FBQ0Y7U0FDRjtLQUNG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QXVCO29CQUM3QixVQUFVLEVBQUU7d0JBQ1YsSUFBSSxFQUFFOzRCQUNKLE9BQU8sRUFBRSx5Q0FBeUM7eUJBQ25EO3dCQUNELE9BQU8sRUFBRSxTQUFTO3dCQUNsQixZQUFZLEVBQUUsYUFBYTtxQkFDNUI7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTztJQUNQLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFakYsT0FBTztJQUNQLE1BQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMkZBQTJGLENBQUMsQ0FBQztBQUN4SSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExhbWJkYSB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0ICogYXMgc2V0dXAgZnJvbSAnLi9ob3Rzd2FwLXRlc3Qtc2V0dXAnO1xuXG5sZXQgbW9ja1VwZGF0ZUxhbWJkYUNvZGU6IChwYXJhbXM6IExhbWJkYS5UeXBlcy5VcGRhdGVGdW5jdGlvbkNvZGVSZXF1ZXN0KSA9PiBMYW1iZGEuVHlwZXMuRnVuY3Rpb25Db25maWd1cmF0aW9uO1xubGV0IG1vY2tUYWdSZXNvdXJjZTogKHBhcmFtczogTGFtYmRhLlR5cGVzLlRhZ1Jlc291cmNlUmVxdWVzdCkgPT4ge307XG5sZXQgbW9ja1VudGFnUmVzb3VyY2U6IChwYXJhbXM6IExhbWJkYS5UeXBlcy5VbnRhZ1Jlc291cmNlUmVxdWVzdCkgPT4ge307XG5sZXQgaG90c3dhcE1vY2tTZGtQcm92aWRlcjogc2V0dXAuSG90c3dhcE1vY2tTZGtQcm92aWRlcjtcblxuYmVmb3JlRWFjaCgoKSA9PiB7XG4gIGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIgPSBzZXR1cC5zZXR1cEhvdHN3YXBUZXN0cygpO1xuICBtb2NrVXBkYXRlTGFtYmRhQ29kZSA9IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUoe30pO1xuICBtb2NrVGFnUmVzb3VyY2UgPSBqZXN0LmZuKCk7XG4gIG1vY2tVbnRhZ1Jlc291cmNlID0gamVzdC5mbigpO1xuICBob3Rzd2FwTW9ja1Nka1Byb3ZpZGVyLnN0dWJMYW1iZGEoe1xuICAgIHVwZGF0ZUZ1bmN0aW9uQ29kZTogbW9ja1VwZGF0ZUxhbWJkYUNvZGUsXG4gICAgdGFnUmVzb3VyY2U6IG1vY2tUYWdSZXNvdXJjZSxcbiAgICB1bnRhZ1Jlc291cmNlOiBtb2NrVW50YWdSZXNvdXJjZSxcbiAgfSk7XG59KTtcblxudGVzdCgnY2FsbHMgdGhlIHVwZGF0ZUxhbWJkYUNvZGUoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBvbmx5IGEgY29kZSBkaWZmZXJlbmNlIGluIGEgTGFtYmRhIGZ1bmN0aW9uIChJbmxpbmUgTm9kZS5qcyBjb2RlKScsIGFzeW5jICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgc2V0dXAuc2V0Q3VycmVudENmblN0YWNrVGVtcGxhdGUoe1xuICAgIFJlc291cmNlczoge1xuICAgICAgRnVuYzoge1xuICAgICAgICBUeXBlOiAnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJyxcbiAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgIFppcEZpbGU6ICdleHBvcnRzLmhhbmRsZXIgPSAoKSA9PiB7cmV0dXJuIHRydWV9JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFJ1bnRpbWU6ICdub2RlanMxNC54JyxcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuICBjb25zdCBuZXdDb2RlID0gJ2V4cG9ydHMuaGFuZGxlciA9ICgpID0+IHtyZXR1cm4gZmFsc2V9JztcbiAgY29uc3QgY2RrU3RhY2tBcnRpZmFjdCA9IHNldHVwLmNka1N0YWNrQXJ0aWZhY3RPZih7XG4gICAgdGVtcGxhdGU6IHtcbiAgICAgIFJlc291cmNlczoge1xuICAgICAgICBGdW5jOiB7XG4gICAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgICAgUHJvcGVydGllczoge1xuICAgICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgICBaaXBGaWxlOiBuZXdDb2RlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFJ1bnRpbWU6ICdub2RlanMxNC54JyxcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICAvLyBXSEVOXG4gIGNvbnN0IGRlcGxveVN0YWNrUmVzdWx0ID0gYXdhaXQgaG90c3dhcE1vY2tTZGtQcm92aWRlci50cnlIb3Rzd2FwRGVwbG95bWVudChjZGtTdGFja0FydGlmYWN0KTtcblxuICAvLyBUSEVOXG4gIGV4cGVjdChkZXBsb3lTdGFja1Jlc3VsdCkubm90LnRvQmVVbmRlZmluZWQoKTtcbiAgZXhwZWN0KG1vY2tVcGRhdGVMYW1iZGFDb2RlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgIFppcEZpbGU6IGV4cGVjdC5hbnkoQnVmZmVyKSxcbiAgfSk7XG59KTtcblxudGVzdCgnY2FsbHMgdGhlIHVwZGF0ZUxhbWJkYUNvZGUoKSBBUEkgd2hlbiBpdCByZWNlaXZlcyBvbmx5IGEgY29kZSBkaWZmZXJlbmNlIGluIGEgTGFtYmRhIGZ1bmN0aW9uIChJbmxpbmUgUHl0aG9uIGNvZGUpJywgYXN5bmMgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBzZXR1cC5zZXRDdXJyZW50Q2ZuU3RhY2tUZW1wbGF0ZSh7XG4gICAgUmVzb3VyY2VzOiB7XG4gICAgICBGdW5jOiB7XG4gICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICBQcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgQ29kZToge1xuICAgICAgICAgICAgWmlwRmlsZTogJ2RlZiBoYW5kbGVyKGV2ZW50LCBjb250ZXh0KTpcXG4gIHJldHVybiBUcnVlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIFJ1bnRpbWU6ICdweXRob24zLjknLFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgWmlwRmlsZTogJ2RlZiBoYW5kbGVyKGV2ZW50LCBjb250ZXh0KTpcXG4gIHJldHVybiBGYWxzZScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUnVudGltZTogJ3B5dGhvbjMuOScsXG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6ICdteS1mdW5jdGlvbicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBkZXBsb3lTdGFja1Jlc3VsdCA9IGF3YWl0IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3QoZGVwbG95U3RhY2tSZXN1bHQpLm5vdC50b0JlVW5kZWZpbmVkKCk7XG4gIGV4cGVjdChtb2NrVXBkYXRlTGFtYmRhQ29kZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICBaaXBGaWxlOiBleHBlY3QuYW55KEJ1ZmZlciksXG4gIH0pO1xufSk7XG5cbnRlc3QoJ3Rocm93IGEgQ2ZuRXZhbHVhdGlvbkV4Y2VwdGlvbiB3aGVuIGl0IHJlY2VpdmVzIGFuIHVuc3VwcG9ydGVkIGZ1bmN0aW9uIHJ1bnRpbWUnLCBhc3luYyAoKSA9PiB7XG4gIC8vIEdJVkVOXG4gIHNldHVwLnNldEN1cnJlbnRDZm5TdGFja1RlbXBsYXRlKHtcbiAgICBSZXNvdXJjZXM6IHtcbiAgICAgIEZ1bmM6IHtcbiAgICAgICAgVHlwZTogJ0FXUzo6TGFtYmRhOjpGdW5jdGlvbicsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICBDb2RlOiB7XG4gICAgICAgICAgICBaaXBGaWxlOiAnZGVmIGhhbmRsZXIoZXZlbnQ6LCBjb250ZXh0OikgdHJ1ZSBlbmQnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgUnVudGltZTogJ3J1YnkyLjcnLFxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogJ215LWZ1bmN0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG4gIGNvbnN0IGNka1N0YWNrQXJ0aWZhY3QgPSBzZXR1cC5jZGtTdGFja0FydGlmYWN0T2Yoe1xuICAgIHRlbXBsYXRlOiB7XG4gICAgICBSZXNvdXJjZXM6IHtcbiAgICAgICAgRnVuYzoge1xuICAgICAgICAgIFR5cGU6ICdBV1M6OkxhbWJkYTo6RnVuY3Rpb24nLFxuICAgICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIENvZGU6IHtcbiAgICAgICAgICAgICAgWmlwRmlsZTogJ2RlZiBoYW5kbGVyKGV2ZW50OiwgY29udGV4dDopIGZhbHNlIGVuZCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUnVudGltZTogJ3J1YnkyLjcnLFxuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiAnbXktZnVuY3Rpb24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgdHJ5SG90c3dhcCA9IGhvdHN3YXBNb2NrU2RrUHJvdmlkZXIudHJ5SG90c3dhcERlcGxveW1lbnQoY2RrU3RhY2tBcnRpZmFjdCk7XG5cbiAgLy8gVEhFTlxuICBhd2FpdCBleHBlY3QodHJ5SG90c3dhcCkucmVqZWN0cy50b1Rocm93KCdydW50aW1lIHJ1YnkyLjcgaXMgdW5zdXBwb3J0ZWQsIG9ubHkgbm9kZS5qcyBhbmQgcHl0aG9uIHJ1bnRpbWVzIGFyZSBjdXJyZW50bHkgc3VwcG9ydGVkLicpO1xufSk7XG4iXX0=