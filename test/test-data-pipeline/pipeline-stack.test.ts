import { Match, Template } from 'aws-cdk-lib/assertions'
import { App, Stack } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'

import { CarbonlakeQuickstartPipelineStack } from '../../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack'

describe('test pipeline stack', () => {
  let template: Template | null
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new App()

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
    const pipelineStack = new CarbonlakeQuickstartPipelineStack(app, 'PipelineStack', {
      dataLineageFunction: dummyFunction,
      //landingBucket: dummyBucket, <--remove because bucket is now created in pipeline stack
      errorBucket: dummyBucket,
      rawBucket: dummyBucket,
      transformedBucket: dummyBucket,
      enrichedBucket: dummyBucket,
      notificationEmailAddress: 'a@b.com',
    })

    // synth a cloudformation template from the stack
    const template = Template.fromStack(pipelineStack)
  })

  afterEach(() => {
    template = null
  })
  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */

    // verify nested stack creation
    template?.resourceCountIs('AWS::CloudFormation::Stack', 4)

    // verify lambda creation
    template?.resourceCountIs('AWS::Lambda::Function', 3)
    template?.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app.lambda_handler',
      Runtime: lambda.Runtime.PYTHON_3_9.name,
    })

    // verify iam role & policy creation for all lambdas
    template?.resourceCountIs('AWS::IAM::Role', 3)
    template?.resourceCountIs('AWS::IAM::Policy', 3)
  })
})
