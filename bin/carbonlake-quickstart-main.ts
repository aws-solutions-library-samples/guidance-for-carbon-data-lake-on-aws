#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CfnOutput } from 'aws-cdk-lib'
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
    } else {
      console.log("Nope!")
      //new CfnOutput(app, 'adminEmail', { value: adminEmail })
    }

    const quicksightUserName = app.node.tryGetContext('quicksightUserName')
    if (!quicksightUserName) {
      console.warn('********************************************************************')
      console.warn('*** WARNING: If you will be deploying CarbonlakeQuicksightStack, ***')
      console.warn('*** you must provide a valid admin email address                 ***')
      console.warn('*** via --context quicksightUserName=value                       ***')
      console.warn('********************************************************************')
    } else {
      new CfnOutput(app, 'quicksightUserName', { value: quicksightUserName })
    }

    // QS1 --> Create the carbonlake shared resource stack
    const sharedResources = new CLQSSharedResourcesStack(app, 'SharedResources')
    const enrichedBucket = sharedResources.carbonlakeEnrichedBucket
    const transformedBucket = sharedResources.carbonlakeTransformedBucket

    // QS2 --> Create the carbonlake data lineage stack
    const dataLineage = new CLQSDataLineageStack(app, 'LineageStack', {
      archiveBucket: sharedResources.carbonlakeDataLineageBucket,
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
    })
    const landingBucket = dataPipeline.carbonlakeLandingBucket
    const calculatorFunction = dataPipeline.calculatorFunction
    const pipelineStateMachine = dataPipeline.pipelineStateMachine
    const calculatorOutputTable = dataPipeline.calculatorOutputTable

    // QS4 --> Create the carbonlake data compaction pipeline stack
    const dataCompactionPipeline = new CLQSCompactionStack(app,'CompactionStack',
      {
        enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
        enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
        dataLineageTraceQueue: dataLineage.traceQueue,
      }
    ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

    // QS5 --> Create the carbonlake api stack
    const api = new CLQSApiStack (app, 'ApiStack', {
      adminEmail: adminEmail,
      calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
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
    const sagemaker = new CLQSSageMakerNotebookStack(app, 'SageMakerNotebookStack');

    // Landing Bucket Name output
    new cdk.CfnOutput(app, 'CLQSLandingBucketName', {
      value: landingBucket.bucketName,
      description: 'S3 Landing Zone bucket name for data ingestion to CarbonLake Quickstart Data Pipeline',
      exportName: 'CLQSLandingBucketName',
    });

    // Landing bucket Url Output
    new cdk.CfnOutput(app, 'CLQSLandingBucketUrl', {
      value: landingBucket.bucketWebsiteUrl,
      description: 'S3 Landing Zone bucket URL for data ingestion to CarbonLake Quickstart Data Pipeline',
      exportName: 'CLQSLandingBucketUrl',
    });

    // Output glue data brew link
    new cdk.CfnOutput(app, 'CLQSGlueDataBrewURL', {
      value: "insert glue data brew url here",
      description: 'URL for Glue Data Brew in AWS Console',
      exportName: 'CLQSGlueDataBrewURL',
    });

    // Output link to state machine
    new cdk.CfnOutput(app, 'CLQSDataPipelineStateMachineUrl', {
      value: `https://${dataPipeline.pipelineStateMachine.env.region}.console.aws.amazon.com/states/home?region=${dataPipeline.pipelineStateMachine.env.region}#/statemachines/view/${dataPipeline.pipelineStateMachine.stateMachineArn}`,
      description: 'URL to open CLQS State machine to view step functions workflow status',
      exportName: 'CLQSDataPipelineStateMachineUrl',

    }); 

    // Output API Endpoint
    new cdk.CfnOutput(app, 'CLQSApiEndpoint', {
      value: api.graphqlUrl,
      description: 'Base http endpoint for CarbonLake Quickstart GraphQL API',
      exportName: 'CLQSApiEndpoint',
    });

    // Output API Username (password will be email to admin user on create)
    new cdk.CfnOutput(app, 'CLQSApiUsername', {
      value: adminEmail,
      description: 'Admin username created on build for GraphQL API',
      exportName: 'CLQSApiUsername',
    });

    // Output Appsync Query Link
    new cdk.CfnOutput(app, 'CLQSGraphQLTestQueryURL', {
      value: `https://${api.region}.console.aws.amazon.com/appsync/home?region=${api.region}#/${api.apiId}`,
      description: 'URL for testing AppSync GraphQL API queries in the AWS console.',
      exportName: 'CLQSGraphQLTestQueryURL',
    });

    // Output link to quicksight
    new cdk.CfnOutput(app, 'CLQSQuicksightUrl', {
      value: "insert",
      description: 'insert',
      exportName: 'CLQSQuicksightUrl',
    });

    // Output link to forecast stack
    new cdk.CfnOutput(app, 'CLQSSagemakerNotebookUrl', {
      value: "insert",
      description: 'AWS console URL for Sagemaker Notebook ML Instance',
      exportName: 'CLQSSagemakerNotebookUrl',
    });

    

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
})
