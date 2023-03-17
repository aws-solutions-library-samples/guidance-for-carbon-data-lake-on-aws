import { Stack, StackProps, Duration, Tags, CfnOutput } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_stepfunctions as stepfunctions } from 'aws-cdk-lib'
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'
import { CdlPythonLambda } from '../../constructs/construct-cdl-python-lambda-function/construct-cdl-python-lambda-function'

export interface TestStackProps extends StackProps {
  landingBucket: s3.Bucket
  transformedBucket: s3.Bucket
  enrichedBucket: s3.Bucket
  calculatorFunction: lambda.Function
  pipelineStateMachine: stepfunctions.StateMachine
  calculatorOutputTable: dynamodb.Table
}

export class TestStack extends Stack {
  constructor(scope: Construct, id: string, props: TestStackProps) {
    super(scope, id, props)

    // Calculator tests
    const cdlCalculatorTestFunction = new CdlPythonLambda(this, 'CalculatorTestLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'test_calculator.lambda_handler',
      timeout: Duration.seconds(60),
      environment: {
        INPUT_BUCKET_NAME: props.transformedBucket.bucketName,
        OUTPUT_BUCKET_NAME: props.enrichedBucket.bucketName,
        CALCULATOR_FUNCTION_NAME: props.calculatorFunction.functionName,
      },
    })
    props.transformedBucket.grantReadWrite(cdlCalculatorTestFunction)
    props.enrichedBucket.grantReadWrite(cdlCalculatorTestFunction)
    props.calculatorFunction.grantInvoke(cdlCalculatorTestFunction)

    // Pipeline E2E tests
    const cdlPipelineTestFunction = new CdlPythonLambda(this, 'PipelineTestLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'test_pipeline.lambda_handler',
      timeout: Duration.minutes(10),
      environment: {
        INPUT_BUCKET_NAME: props.landingBucket.bucketName,
        OUTPUT_BUCKET_NAME: props.enrichedBucket.bucketName,
        STATE_MACHINE_ARN: props.pipelineStateMachine.stateMachineArn,
        OUTPUT_DYNAMODB_TABLE_NAME: props.calculatorOutputTable.tableName,
      },
    })
    props.landingBucket.grantReadWrite(cdlPipelineTestFunction)
    props.enrichedBucket.grantReadWrite(cdlPipelineTestFunction)
    props.pipelineStateMachine.grantRead(cdlPipelineTestFunction)
    props.calculatorOutputTable.grantReadWriteData(cdlPipelineTestFunction)

    // Output name of test function
    new CfnOutput(this, 'e2eTestLambdaFunctionName', {
      value: cdlPipelineTestFunction.functionName,
      description: 'Name of cdl lambda test function',
      exportName: 'CDLe2eTestLambdaFunctionName',
    });

    // Output aws console link to test function
    new CfnOutput(this, 'e2eTestLambdaConsoleLink', {
      value: `https://${cdlPipelineTestFunction.env.region}.console.aws.amazon.com/lambda/home?${cdlPipelineTestFunction.env.region}#/functions/${cdlPipelineTestFunction.functionName}?tab=code`,
      description: 'URL to open and invoke calculator test function in the AWS Console',
      exportName: 'CDLe2eTestLambdaConsoleLink',

    });

    Tags.of(this).add("component", "test");
  }
}
