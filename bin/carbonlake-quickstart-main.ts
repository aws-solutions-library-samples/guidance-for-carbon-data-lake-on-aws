#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CLQSStack } from '../lib/carbonlake-quickstart-stack'
import { CLQSTestStack } from '../lib/stacks/stack-tests/clqs-test'

const app = new cdk.App()

const carbonlakeStack = new CLQSStack(app, 'CLQSMain')

new CLQSTestStack(app, 'CLQSTest', {
  calculatorFunction: carbonlakeStack.calculatorFunction,
  landingBucket: carbonlakeStack.landingBucket,
  enrichedBucket: carbonlakeStack.enrichedBucket,
  transformedBucket: carbonlakeStack.transformedBucket,
  pipelineStateMachine: carbonlakeStack.pipelineStateMachine,
  calculatorOutputTable: carbonlakeStack.calculatorOutputTable,
})
