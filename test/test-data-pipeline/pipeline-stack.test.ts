import { Template } from 'aws-cdk-lib/assertions'
import { App, Stack } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'

import { DataPipelineStack } from '../../lib/stacks/stack-data-pipeline/stack-data-pipeline'

describe('test pipeline stack', () => {
  let template: Template | null
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new App({
      context: {
        "framework": "ghg_protocol"
      }
    })

    // Pipeline stack requires the following props, create a dummy stack
    // to provide suitable inputs:
    //   - dataLineageFunction
    //   - landingBucket
    //   - rawBucket
    //   - transformedBucket
    //   - enrichedBucket
    const dummyInputsStack = new Stack(app, 'DummyInputsStack')

    const dummyFunction = new lambda.Function(dummyInputsStack, 'dummyFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromInline('def lambda_handler(): pass'),
      handler: 'lambda_handler',
    })
    const dummyBucket = new s3.Bucket(dummyInputsStack, 'dummyBucket', {})

    // create the pipeline stack with the required props
    const pipelineStack = new DataPipelineStack(app, 'PipelineStack', {
      dataLineageFunction: dummyFunction,
      //landingBucket: dummyBucket, <--remove because bucket is now created in pipeline stack
      errorBucket: dummyBucket,
      rawBucket: dummyBucket,
      transformedBucket: dummyBucket,
      enrichedBucket: dummyBucket,
      notificationEmailAddress: 'a@b.com',
    })

    // synth a cloudformation template from the stack
    template = Template.fromStack(pipelineStack)
  })

  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */

    // verify nested stack creation. Should be 0 as we use Constructs
    template?.resourceCountIs('AWS::CloudFormation::Stack', 0)

    // verify lambda creation
    template?.resourceCountIs('AWS::Lambda::Function', 11)
    template?.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app.lambda_handler',
      Runtime: lambda.Runtime.PYTHON_3_9.name,
    })

    // verify iam role & policy creation for all lambdas
    template?.resourceCountIs('AWS::IAM::Role', 14)
    template?.resourceCountIs('AWS::IAM::Policy', 12)
  })
})
