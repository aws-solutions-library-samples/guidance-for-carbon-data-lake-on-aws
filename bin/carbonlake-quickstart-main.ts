#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CLQSStack } from '../lib/carbonlake-quickstart-stack'
import { CLQSTestStack } from '../lib/stacks/stack-tests/clqs-test'
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';

const app = new cdk.App()

const carbonlakeStack = new CLQSStack(app, 'CLQS', {
  env: {
    region: app.node.tryGetContext('awsRegion')? app.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT
  }
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
  calculatorFunction: carbonlakeStack.calculatorFunction,
  landingBucket: carbonlakeStack.landingBucket,
  enrichedBucket: carbonlakeStack.enrichedBucket,
  transformedBucket: carbonlakeStack.transformedBucket,
  pipelineStateMachine: carbonlakeStack.pipelineStateMachine,
  calculatorOutputTable: carbonlakeStack.calculatorOutputTable,
})
