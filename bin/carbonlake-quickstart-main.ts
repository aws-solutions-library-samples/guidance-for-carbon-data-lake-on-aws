#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CLQSTestStack } from '../lib/stacks/stack-tests/clqs-test'
//import { AwsSolutionsChecks } from 'cdk-nag'
import { CLQSQuicksightStack } from '../lib/stacks/stack-quicksight/carbonlake-qs-quicksight'
import { Aspects } from 'aws-cdk-lib';
import { CLQSSharedResourcesStack } from '../lib/stacks/stack-shared-resources/carbonlake-qs-shared-resources-stack'
import { CLQSDataLineageStack } from '../lib/stacks/stack-data-lineage/carbonlake-data-lineage-stack'
import { CLQSCompactionStack } from "../lib/stacks/stack-data-compaction/carbonlake-qs-data-compaction-pipeline"
import { CLQSDataPipelineStack } from '../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack';
import { CLQSApiStack } from '../lib/stacks/stack-api/carbonlake-api-stack'
import { CLQSSageMakerNotebookStack } from '../lib/stacks/stack-sagemaker-notebook/carbonlake-qs-sagemaker-notebook'
import { CLQSWebStack } from '../lib/stacks/stack-web/carbonlake-qs-web-stack'
import { checkAdminEmailSetup, checkQuicksightSetup } from '../resources/setup-checks/setupCheck';

const app = new cdk.App();

const appEnv = {
  region: app.node.tryGetContext('awsRegion')? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT
};

const adminEmail = app.node.tryGetContext('adminEmail')
    
checkAdminEmailSetup(adminEmail);

// QS1 --> Create the carbonlake shared resource stack
const sharedResources = new CLQSSharedResourcesStack(app, 'SharedResources', {env: appEnv});
const enrichedBucket = sharedResources.carbonlakeEnrichedBucket
const transformedBucket = sharedResources.carbonlakeTransformedBucket

// QS2 --> Create the carbonlake data lineage stack
  const dataLineage = new CLQSDataLineageStack(app, 'LineageStack', {
    archiveBucket: sharedResources.carbonlakeDataLineageBucket,
    env: appEnv
  })

// QS3 --> Create the carbonlake data pipeline stack
// carbonlake orchestration pipeline stack - Amazon Step Functions
  const dataPipeline = new CLQSDataPipelineStack(app, 'DataPipelineStack', {
    dataLineageFunction: dataLineage.inputFunction,
    errorBucket: sharedResources.carbonlakeErrorBucket,
    rawBucket: sharedResources.carbonlakeRawBucket,
    transformedBucket: sharedResources.carbonlakeTransformedBucket,
    enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
    notificationEmailAddress: adminEmail,
    env: appEnv
  })

    const landingBucket = dataPipeline.carbonlakeLandingBucket
    const calculatorFunction = dataPipeline.calculatorFunction
    const pipelineStateMachine = dataPipeline.pipelineStateMachine
    const calculatorOutputTable = dataPipeline.calculatorOutputTable

// QS4 --> Create the carbonlake data compaction pipeline stack
new CLQSCompactionStack(app,'CompactionStack',
      {
        enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
        enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
        dataLineageTraceQueue: dataLineage.traceQueue,
        env: appEnv
      }
    ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

// QS5 --> Create the carbonlake api stack
const apiStack = new CLQSApiStack (app, 'ApiStack', {
      adminEmail: adminEmail,
      calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
      env: appEnv
    })

// QS6 --> Create the carbonlake quicksight stack
const quicksightOption = app.node.tryGetContext('deployQuicksightStack')
console.log(`Quicksight deployment option is set to: ${quicksightOption}`)
if (quicksightOption === true) {

    const quicksightUsername = app.node.tryGetContext('quicksightUserName')
    checkQuicksightSetup(quicksightUsername);

  new CLQSQuicksightStack(app, 'QuicksightStack', {
    enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
    quicksightUsername: quicksightUsername,
    enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
    env: appEnv
  })
}

// QS7 --> Create the carbonlake forecast stack
const sagemakerOption = app.node.tryGetContext('deploySagemakerStack')
console.log(`Sagemaker deployment option is set to: ${sagemakerOption}`)
    if (sagemakerOption === true) {
  new CLQSSageMakerNotebookStack(app, 'SageMakerNotebookStack', {
      env: appEnv
    });
    }

// QS7 --> Create the carbonlake forecast stack
const webOption = app.node.tryGetContext('deployWebStack')
console.log(`Web deployment option is set to: ${webOption}`)
    if (webOption === true) {

    new CLQSWebStack(app, 'WebStack', {
      env: appEnv,
      apiId: apiStack.apiId,
      graphqlUrl: apiStack.graphqlUrl,
      identityPoolId: apiStack.identityPoolIdOutputId.value,
      userPoolId: apiStack.userPoolIdOutput.value,
      userPoolWebClientId: apiStack.userPoolClientIdOutput.value,
      landingBucketName: dataPipeline.carbonlakeLandingBucket.bucketName
    })
    }

cdk.Tags.of(app).add("application", "carbonlake");

// Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
//const nag = app.node.tryGetContext('nag')

/*
    Description: Checks if context variable nag=true and 
    applies cdk nag if it is added to the app synth contex
    Inputs: Optionally accepts cdk synth --context nag=true to apply cdk-nag packs
    Outputs: Outputs cdk-nag verbose logging and throws errors if violations met
    AWS Services: cdk, cdk-nag package
*/

//if (nag == "true"){
    //Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
//}


new CLQSTestStack(app, 'CLQSTest', {
  calculatorFunction: calculatorFunction,
  landingBucket: landingBucket,
  enrichedBucket: enrichedBucket,
  transformedBucket: transformedBucket,
  pipelineStateMachine: pipelineStateMachine,
  calculatorOutputTable: calculatorOutputTable,
  env: appEnv
})
