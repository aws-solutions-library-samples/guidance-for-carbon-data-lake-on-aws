#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CarbonlakeQuickstartStack } from '../lib/carbonlake-qs-stack';
import { CarbonlakeQuickstartCiCdPipelineStack } from '../lib/ci-cd/carbonlake-qs-ci-cd-pipeline-stack';

const app = new cdk.App();
new CarbonlakeQuickstartCiCdPipelineStack(app, 'CarbonLakeQuickstartCiCdPipelineStack');

/*
new CarbonlakeQuickstartStack(app, 'CarbonlakeQuickstartStack', {
});

*/