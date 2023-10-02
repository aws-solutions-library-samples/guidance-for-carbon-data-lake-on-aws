#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Aspects } from 'aws-cdk-lib'
import { TestStack } from '../lib/stacks/stack-tests/stack-tests'
import { QuicksightStack } from '../lib/stacks/stack-quicksight/stack-quicksight'
import { SharedResourcesStack } from '../lib/stacks/stack-shared-resources/stack-shared-resources'
import { DataLineageStack } from '../lib/stacks/stack-data-lineage/stack-data-lineage'
import { DataCompactionStack } from '../lib/stacks/stack-data-compaction/stack-data-compaction'
import { DataPipelineStack } from '../lib/stacks/stack-data-pipeline/stack-data-pipeline'
import { ApiStack } from '../lib/stacks/stack-api/stack-api'
import { SageMakerNotebookStack } from '../lib/stacks/stack-sagemaker-notebook/stack-sagemaker-notebook'
import { WebStack } from '../lib/stacks/stack-web/stack-web'
import {
  checkAdminEmailSetup,
  checkQuicksightSetup,
  checkContextFilePresent,
  checkServerAccessLogsUseBucketPolicy,
} from '../resources/setup-checks/setupCheck'
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag'

/**
 * Instantiate a new CDK app object
 */

const app = new cdk.App()

/**
 * Define description with AWS Solutions Guidance Sample Code identifier
 */

const desc = 'Guidance for the Carbon Data Lake on AWS (SO9180)'

/**
 * Create the cdk app environment to be used in all stacks
 * Get region from the app context or from environmental variables
 * Get account from local environmental variables defined with AWS CLI
 */

const appEnv = {
  region: app.node.tryGetContext('awsRegion') ? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
}

/**
 * Check if cdk context is defined either by context file or command line flags
 * If the context file is missing return an error message
 */

checkContextFilePresent(app)

/**
 * Check if the server access logs bucket policy is true
 * This needs to be set as "true" in cdk.context
 * Or deployment will not function properly.
 */

checkServerAccessLogsUseBucketPolicy(app)

// Generate needed artifacts based on the specific framework configuration
const adminEmail = app.node.tryGetContext('adminEmail')

checkAdminEmailSetup(adminEmail)

checkQuicksightSetup(app)

// CDL-SHARED-RESOURCES --> Create the cdl shared resource stack
const sharedResources = new SharedResourcesStack(app, 'SharedResources', {
  env: appEnv,
  description: desc,
}) // desc variable adds solution identifier string to the shared resources stack

const enrichedBucket = sharedResources.cdlEnrichedBucket
const transformedBucket = sharedResources.cdlTransformedBucket

// CDL-DATA-LINEAGE --> Create the cdl data lineage stack
const dataLineage = new DataLineageStack(app, 'LineageStack', {
  archiveBucket: sharedResources.cdlDataLineageBucket,
  env: appEnv,
  description: desc,
})

NagSuppressions.addStackSuppressions(dataLineage, [
  {
    id: 'AwsSolutions-IAM4',
    reason:
      'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason:
      'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-SQS3',
    reason:
      'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
  },
  {
    id: 'AwsSolutions-GL1',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
  {
    id: 'AwsSolutions-GL3',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
])

// CDL-DATA-PIPELINE --> Create the cdl data pipeline stack
// cdl orchestration pipeline stack - Amazon Step Functions
const dataPipeline = new DataPipelineStack(app, 'DataPipelineStack', {
  dataLineageFunction: dataLineage.inputFunction,
  errorBucket: sharedResources.cdlErrorBucket,
  rawBucket: sharedResources.cdlRawBucket,
  transformedBucket: sharedResources.cdlTransformedBucket,
  enrichedBucket: sharedResources.cdlEnrichedBucket,
  notificationEmailAddress: adminEmail,
  env: appEnv,
  description: desc,
})

const landingBucket = dataPipeline.cdlLandingBucket
const calculatorFunction = dataPipeline.calculatorFunction
const pipelineStateMachine = dataPipeline.pipelineStateMachine
const calculatorOutputTable = dataPipeline.calculatorOutputTable

NagSuppressions.addStackSuppressions(dataPipeline, [
  {
    id: 'AwsSolutions-IAM4',
    reason:
      'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason:
      'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-SQS3',
    reason:
      'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
  },
  {
    id: 'AwsSolutions-L1',
    reason: 'Only suppress AwsSolutions-L1 resource handler runtime on L1 construct.',
  },
  {
    id: 'AwsSolutions-GL1',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
  {
    id: 'AwsSolutions-GL3',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
])

// CDL-DATA-COMPACTION --> Create the cdl data compaction pipeline stack
const dataCompactionStack = new DataCompactionStack(app, 'DataCompactionStack', {
  enrichedBucket: sharedResources.cdlEnrichedBucket,
  enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
  dataLineageTraceQueue: dataLineage.traceQueue,
  env: appEnv,
  description: desc,
}) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

NagSuppressions.addStackSuppressions(dataCompactionStack, [
  {
    id: 'AwsSolutions-IAM4',
    reason:
      'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-L1',
    reason: 'Stack requires lambda for external dependency.',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason:
      'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-SQS3',
    reason:
      'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
  },
  {
    id: 'AwsSolutions-GL1',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
  {
    id: 'AwsSolutions-GL3',
    reason:
      'Reducing complexity for development purposes and integration. Recommend uncommenting glue crawler and glue job security configurations in production.',
  },
])

// CDL-API-STACK --> Create the cdl api stack
const apiStack = new ApiStack(app, 'ApiStack', {
  adminEmail: adminEmail,
  calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
  env: appEnv,
  description: desc,
})

NagSuppressions.addStackSuppressions(apiStack, [
  {
    id: 'AwsSolutions-IAM4',
    reason:
      'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason:
      'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-SQS3',
    reason:
      'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
  },
])

// CDL-QUICKSIGHT-STACK --> Create the cdl quicksight stack
const quicksightOption = app.node.tryGetContext('deployQuicksightStack')
console.log(`Quicksight deployment option is set to: ${quicksightOption}`)
if (quicksightOption === true) {
  const quicksightUsername = app.node.tryGetContext('quicksightUserName')

  new QuicksightStack(app, 'QuicksightStack', {
    enrichedBucket: sharedResources.cdlEnrichedBucket,
    quicksightUsername: quicksightUsername,
    enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
    env: appEnv,
    description: desc,
  })
}

// CDL-FORECAST-STACK --> Create the cdl forecast stack
const sagemakerOption = app.node.tryGetContext('deploySagemakerStack')
console.log(`Sagemaker deployment option is set to: ${sagemakerOption}`)
if (sagemakerOption === true) {
  const sageMakerStack = new SageMakerNotebookStack(app, 'SageMakerNotebookStack', {
    env: appEnv,
    enrichedDataBucket: sharedResources.cdlEnrichedBucket,
  })
  NagSuppressions.addStackSuppressions(sageMakerStack, [
    {
      id: 'AwsSolutions-IAM4',
      reason:
        'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
    },
    {
      id: 'AwsSolutions-IAM5',
      reason:
        'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
    },
    {
      id: 'AwsSolutions-SQS3',
      reason:
        'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
    },
  ])
}

// CDL-WEB-STACK --> Create the cdl web stack
const webOption = app.node.tryGetContext('deployWebStack')
console.log(`Web deployment option is set to: ${webOption}`)
if (webOption === true) {
  new WebStack(app, 'WebStack', {
    env: appEnv,
    apiId: apiStack.apiId,
    graphqlUrl: apiStack.graphqlUrl,
    identityPoolId: apiStack.identityPoolIdOutputId.value,
    userPoolId: apiStack.userPoolIdOutput.value,
    userPoolWebClientId: apiStack.userPoolClientIdOutput.value,
    landingBucketName: dataPipeline.cdlLandingBucket.bucketName,
    description: desc,
  })
}

const nagEnabled = app.node.tryGetContext('nagEnabled')
console.log(`CDK Nag enabled option is set to: ${nagEnabled}`)
if (nagEnabled === true) {
  console.log('CDK-nag enabled. Starting cdk-nag review')
  Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
}

const testStack = new TestStack(app, 'TestStack', {
  calculatorFunction: calculatorFunction,
  landingBucket: landingBucket,
  enrichedBucket: enrichedBucket,
  transformedBucket: transformedBucket,
  pipelineStateMachine: pipelineStateMachine,
  calculatorOutputTable: calculatorOutputTable,
  env: appEnv,
  description: desc,
})
NagSuppressions.addStackSuppressions(testStack, [
  {
    id: 'AwsSolutions-IAM4',
    reason:
      'Default L2 CDK constructs contain AWS managed policies. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-IAM5',
    reason:
      'Default L2 CDK constructs contain wildcard permissions. As this is a sample code package we have retained default CDK permissions.',
  },
  {
    id: 'AwsSolutions-SQS3',
    reason:
      'Only suppress AwsSolutions-SQS3 for dead letter queues, because they do not require their own dead letter queue.',
  },
])
