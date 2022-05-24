#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CarbonlakeQuickstartStack } from '../lib/carbonlake-qs-stack';
import { CarbonlakeQuickstartCiCdStack } from '../lib/ci-cd/carbonlake-qs-ci-cd-pipeline-stack';


const app = new cdk.App();

// Creates a reference to the CarbonLake pipeline in the stack deployment
new CarbonlakeQuickstartCiCdStack(app, 'CarbonLakeQuickstartCiCdStack');


new CarbonlakeQuickstartStack(app, 'CarbonlakeQuickstartStack');
