#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Aspects } from 'aws-cdk-lib'
import { TestStack } from '../lib/stacks/stack-tests/stack-tests'
import { QuicksightStack } from '../lib/stacks/stack-quicksight/stack-quicksight'
import { SharedResourcesStack } from '../lib/stacks/stack-shared-resources/stack-shared-resources'
import { DataLineageStack } from '../lib/stacks/stack-data-lineage/stack-data-lineage'
import { DataCompactionStack } from "../lib/stacks/stack-data-compaction/stack-data-compaction"
import { DataPipelineStack } from '../lib/stacks/stack-data-pipeline/stack-data-pipeline';
import { ApiStack } from '../lib/stacks/stack-api/stack-api'
import { SageMakerNotebookStack } from '../lib/stacks/stack-sagemaker-notebook/stack-sagemaker-notebook'
import { WebStack } from '../lib/stacks/stack-web/stack-web'
import { IotIngestStack } from '../lib/stacks/stack-iot-ingest/iot-ingest'
import { checkAdminEmailSetup, checkQuicksightSetup } from '../resources/setup-checks/setupCheck';
import { RestApiStack } from '../lib/stacks/stack-api-rest/stack-api-rest'
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { config } from '../lib/codegen/config';
import { generate } from '@graphql-codegen/cli'

const app = new cdk.App();

const appEnv = {
  region: app.node.tryGetContext('awsRegion')? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT
};

const framework = app.node.tryGetContext('framework')

const codegenConfig = config(framework)

// TODO -- add destroy and remove objects policies for S3 buckets
// TODO -- add any other dev configs for prod/dev deployment

// Generate needed artifacts based on the specific framework configuration
console.log(`Generating artifacts for ${framework} framework\n using config located in ./framework_configurations/${framework}/ ...`)
generate(codegenConfig).then(() => {
  console.log('Codegen completed')
  const adminEmail = app.node.tryGetContext('adminEmail')
      
  checkAdminEmailSetup(adminEmail);

  // CDL-SHARED-RESOURCES --> Create the cdl shared resource stack
  const sharedResources = new SharedResourcesStack(app, 'SharedResources', {env: appEnv});
  const enrichedBucket = sharedResources.cdlEnrichedBucket
  const transformedBucket = sharedResources.cdlTransformedBucket

  // CDL-DATA-LINEAGE --> Create the cdl data lineage stack
    const dataLineage = new DataLineageStack(app, 'LineageStack', {
      archiveBucket: sharedResources.cdlDataLineageBucket,
      env: appEnv
    })

  // CDL-DATA-PIPELINE --> Create the cdl data pipeline stack
  // cdl orchestration pipeline stack - Amazon Step Functions
    const dataPipeline = new DataPipelineStack(app, 'DataPipelineStack', {
      dataLineageFunction: dataLineage.inputFunction,
      errorBucket: sharedResources.cdlErrorBucket,
      rawBucket: sharedResources.cdlRawBucket,
      transformedBucket: sharedResources.cdlTransformedBucket,
      enrichedBucket: sharedResources.cdlEnrichedBucket,
      notificationEmailAddress: adminEmail,
      env: appEnv
    })

      const landingBucket = dataPipeline.cdlLandingBucket
      const calculatorFunction = dataPipeline.calculatorFunction
      const pipelineStateMachine = dataPipeline.pipelineStateMachine
      const calculatorOutputTable = dataPipeline.calculatorOutputTable

  // CDL-DATA-COMPACTION --> Create the cdl data compaction pipeline stack
  new DataCompactionStack(app,'DataCompactionStack',
        {
          enrichedBucket: sharedResources.cdlEnrichedBucket,
          enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
          dataLineageTraceQueue: dataLineage.traceQueue,
          env: appEnv
        }
      ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

  // CDL-API-STACK --> Create the cdl api stack
  const apiStack = new ApiStack (app, 'ApiStack', {
        adminEmail: adminEmail,
        landingBucket: landingBucket,
        calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
        env: appEnv
      })
  
  // CDL-REST-API-STACK --> Create the cdl rest api stack
  const restApiStack = new RestApiStack(app, 'ApiStackRest', {
    landingBucket: landingBucket,
    env: appEnv
  });

  // CDL-QUICKSIGHT-STACK --> Create the cdl quicksight stack
  const quicksightOption = app.node.tryGetContext('deployQuicksightStack')
  console.log(`Quicksight deployment option is set to: ${quicksightOption}`)
  if (quicksightOption === true) {

      const quicksightUsername = app.node.tryGetContext('quicksightUserName')
      checkQuicksightSetup(quicksightUsername);

    new QuicksightStack(app, 'QuicksightStack', {
      enrichedBucket: sharedResources.cdlEnrichedBucket,
      quicksightUsername: quicksightUsername,
      enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
      env: appEnv
    })
  }

  // CDL-FORECAST-STACK --> Create the cdl forecast stack
  const sagemakerOption = app.node.tryGetContext('deploySagemakerStack')
  console.log(`Sagemaker deployment option is set to: ${sagemakerOption}`)
      if (sagemakerOption === true) {
    new SageMakerNotebookStack(app, 'SageMakerNotebookStack', {
        env: appEnv,
        enrichedDataBucket: sharedResources.cdlEnrichedBucket
      });
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
        landingBucketName: dataPipeline.cdlLandingBucket.bucketName
      })
      }

  // CDL-IOT-INGEST-STACK --> Create the iot ingest stack  
  // TODO: add the option switch in the cdk.json template   
  const iotIngestOption = new IotIngestStack(app, 'IoTIngestStack', {
    env: appEnv
  })

  // Add a stack dependency so the DataPipeline stack gets created before IoTIngest stack. Landing Bucket must exist for IoT ingest stack to deploy.
  iotIngestOption.node.addDependency(dataPipeline)

const nagEnabled = app.node.tryGetContext('nagEnabled')
console.log(`CDK Nag enabled option is set to: ${nagEnabled}`)
if (nagEnabled === true){
    console.log("CDK-nag enabled. Starting cdk-nag review")
    Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
}
/*
NagSuppressions.addResourceSuppressions(bucket, [
  {
    id: 'AwsSolutions-S2',
    reason: 'Demonstrate a resource level suppression.'
  },
*/

  new TestStack(app, 'TestStack', {
    calculatorFunction: calculatorFunction,
    landingBucket: landingBucket,
    enrichedBucket: enrichedBucket,
    transformedBucket: transformedBucket,
    pipelineStateMachine: pipelineStateMachine,
    calculatorOutputTable: calculatorOutputTable,
    env: appEnv
  })
});
