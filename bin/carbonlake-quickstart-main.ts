#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CLQSTestStack } from '../lib/stacks/stack-tests/clqs-test'
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';
import { CLQSSharedResourcesStack } from '../lib/stacks/stack-shared-resources/carbonlake-qs-shared-resources-stack'
import { CLQSDataLineageStack } from '../lib/stacks/stack-data-lineage/carbonlake-data-lineage-stack'
import { CLQSCompactionStack } from "../lib/stacks/stack-data-compaction/carbonlake-qs-data-compaction-pipeline"
import { CLQSDataPipelineStack } from '../lib/stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack';
import { CLQSApiStack } from '../lib/stacks/stack-api/carbonlake-api-stack'
import { CLQSSageMakerNotebookStack } from '../lib/stacks/stack-sagemaker-notebook/carbonlake-qs-sagemaker-notebook'

const app = new cdk.App();

const appEnv = {
  region: app.node.tryGetContext('awsRegion')? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT
};

const adminEmail = app.node.tryGetContext('adminEmail')
    
if (!adminEmail) {
      console.warn('****************************************************************')
      console.warn('*** WARNING: If you will be deploying CarbonLakeApiStack     ***')
      console.warn('*** or CarbonlakeQuicksightStack, you must provide a         ***')
      console.warn('*** valid admin email address via --context adminEmail=value ***')
      console.warn('****************************************************************')
    }

    const quicksightUserName = app.node.tryGetContext('quicksightUserName')
    if (!quicksightUserName) {
      console.warn('********************************************************************')
      console.warn('*** WARNING: If you will be deploying CarbonlakeQuicksightStack, ***')
      console.warn('*** you must provide a valid admin email address                 ***')
      console.warn('*** via --context quicksightUserName=value                       ***')
      console.warn('********************************************************************')
    }

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
    // TODO: As there are created, need to add the sfn components to the pipeline stack
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
new CLQSApiStack (app, 'ApiStack', {
      adminEmail: adminEmail,
      calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
      env: appEnv
    })

    // QS6 --> Create the carbonlake quicksight stack
    /* commenting quicksight stack out for test
    this.quicksight = new CLQSQuicksightStack(this, 'QuicksightStack', {
      enrichedBucket: this.sharedResources.carbonlakeEnrichedBucket,
      quicksightUserName: quicksightUserName,
      enrichedDataDatabase: this.sharedResources.glueEnrichedDataDatabase,
    })
    */
    // QS7 --> Create the carbonlake forecast stack
    //commenting out for test
new CLQSSageMakerNotebookStack(app, 'SageMakerNotebookStack', {
      env: appEnv
    });

    cdk.Tags.of(app).add("application", "carbonlake");

    

// Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
const nag = app.node.tryGetContext('nag')

/*
    Description: Checks if context variable nag=true and 
    applies cdk nag if it is added to the app synth contex
    Inputs: Optionally accepts cdk synth --context nag=true to apply cdk-nag packs
    Outputs: Outputs cdk-nag verbose logging and throws errors if violations met
    AWS Services: cdk, cdk-nag package
*/

if (nag == "true"){
    Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
}


new CLQSTestStack(app, 'CLQSTest', {
  calculatorFunction: calculatorFunction,
  landingBucket: landingBucket,
  enrichedBucket: enrichedBucket,
  transformedBucket: transformedBucket,
  pipelineStateMachine: pipelineStateMachine,
  calculatorOutputTable: calculatorOutputTable,
  env: appEnv
})
