# Carbonlake - Integration tests

This stack is in charge of deploying Integration Tests. It deploys 2 test suites:
- CalculatorTest: integration tests of the [Calculator service](../pipeline/calculator/README.md)
- PipelineTest: end-to-end integration tests of the [data pipelime](../pipeline/README.md)

## Trigger tests
Tests are deployed as lambda functions. Each function run a suite of tests.

### Input
Lambda functions must be invoked with empty parameters.
```jsonc
{}
```

### Output
In case of successful execution of the test suite, the lambda function will return 200 "Success".  
In case of error, the lambda function will return an error code and the stack trace of the error. 
