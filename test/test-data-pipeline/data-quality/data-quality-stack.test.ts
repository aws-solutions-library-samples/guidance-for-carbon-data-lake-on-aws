import { Template } from 'aws-cdk-lib/assertions'
import { App, Stack } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'

import { DataQuality } from '../../../lib/stacks/stack-data-pipeline/construct-data-quality/construct-data-quality'

describe('test pipeline stack', () => {
  let template: Template | null
  beforeEach(() => {
    /* ====== SETUP ====== */
    const app = new App()

    // DQ stack requires the following props, create a dummy stack
    // to provide suitable inputs:
    //   - inputBucket
    //   - outputBucket
    //   - errorBucket
    const dummyInputsStack = new Stack(app, 'DummyInputsStack')
    const dummyBucket = new s3.Bucket(dummyInputsStack, 'dummyBucket', {})

    // DQ stack is nested, create a parent stack as placeholder
    const parentStack = new Stack(app, 'DQParentStack', {})

    // create the pipeline stack with the required props
    new DataQuality(parentStack, 'DQStack', {
      inputBucket: dummyBucket,
      outputBucket: dummyBucket,
      errorBucket: dummyBucket,
    })

    // synth a cloudformation template from the stack
    template = Template.fromStack(parentStack)
  })

  afterEach(() => {
    template = null
  })

  test('synthesises as expected', () => {
    /* ====== ASSERTIONS ====== */

    // creates the results bucket
    template?.resourceCountIs('AWS::S3::Bucket', 1)

    // verify lambda creation
    template?.resourceCountIs('AWS::Lambda::Function', 2)
    template?.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app.lambda_handler',
      Runtime: lambda.Runtime.PYTHON_3_9.name,
    })

    // verify iam role & policy creation for all lambdas and dq job
    template?.resourceCountIs('AWS::IAM::Role', 3)
    template?.resourceCountIs('AWS::IAM::Policy', 3)
  })
})
