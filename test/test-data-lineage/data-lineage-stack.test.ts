import { Capture, Match, Template } from 'aws-cdk-lib/assertions'
import { App, Stack } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'

import { CarbonlakeQuickstartDataLineageStack } from '../../lib/stacks/stack-data-lineage/carbonlake-data-lineage-stack'

describe('test data lineage stack', () => {
  let template: Template | null

  beforeEach(() => {
    const app = new App()

    // Data lineage stack requires an archive bucket as entry prop created
    // by the shared resources stack
    const sharedResourcesStack = new Stack(app, 'SharedResourcesStack')
    const archiveBucket = new s3.Bucket(sharedResourcesStack, 'ArchiveBucket', {})

    const dataLineageStack = new CarbonlakeQuickstartDataLineageStack(app, 'DataLineageStack', {
      archiveBucket: archiveBucket,
    })

    template = Template.fromStack(dataLineageStack)
  })

  afterEach(() => {
    template = null
  })

  test('synthesises as expected', () => {
    // two queues exist
    template?.resourceCountIs('AWS::SQS::Queue', 2)

    // verify lambda creation
    template?.resourceCountIs('AWS::Lambda::Function', 3)
    template?.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'app.lambda_handler',
      Runtime: lambda.Runtime.PYTHON_3_9.name,
    })

    // verify lambda subscription to aws
    template?.resourceCountIs('AWS::Lambda::EventSourceMapping', 2)

    // verify iam role & policy creation for all lambdas
    template?.resourceCountIs('AWS::IAM::Role', 3)
    template?.resourceCountIs('AWS::IAM::Policy', 3)

    // ddb created with pk=root_id and sk=node_id
    // has a gsi for querying node_id
    // has an lsi for querying action_taken
    // all attributes are projected on indexes
    template?.hasResourceProperties(
      'AWS::DynamoDB::Table',
      Match.objectLike({
        KeySchema: [
          {
            AttributeName: 'root_id',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'node_id',
            KeyType: 'RANGE',
          },
        ],
        GlobalSecondaryIndexes: [
          {
            KeySchema: [
              {
                AttributeName: 'node_id',
                KeyType: 'HASH',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
        LocalSecondaryIndexes: [
          {
            KeySchema: [
              {
                AttributeName: 'root_id',
                KeyType: 'HASH',
              },
              {
                AttributeName: 'action_taken',
                KeyType: 'RANGE',
              },
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
          },
        ],
      })
    )
  })
})
