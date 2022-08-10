#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CarbonlakeQuickstartStack } from '../lib/carbonlake-qs-stack';
import { CarbonlakeQuickstartCiCdStack } from '../lib/stack-ci-cd/carbonlake-qs-ci-cd-pipeline-stack';
import { CarbonlakeQuickstartTestStack } from '../lib/stack-tests/carbonlake-qs-test';


const app = new cdk.App();

const carbonlakeStack = new CarbonlakeQuickstartStack(app, 'CarbonlakeQuickstartStack');

new CarbonlakeQuickstartTestStack(app, 'CarbonlakeQuickstartTest', {
    calculatorFunction: carbonlakeStack.calculatorFunction,
    landingBucket: carbonlakeStack.landingBucket,
    enrichedBucket:carbonlakeStack.enrichedBucket,
    transformedBucket: carbonlakeStack.transformedBucket,
    pipelineStateMachine: carbonlakeStack.pipelineStateMachine,
    calculatorOutputTable: carbonlakeStack.calculatorOutputTable,
});
