#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CarbonlakeQuickstartCiCdStack } from '../lib/ci-cd/carbonlake-qs-ci-cd-pipeline-stack';


const app = new cdk.App();

// Creates the optional CarbonLake Quickstart CICD pipeline stack with all stacks
/*
    Description: Top level stack bin for entire application with CICD pipeline deployment mechanism
    Inputs: Takes all other stacks from CICD pipeline stack and builds in the context of a CDK app
    Outputs: Outputs a pipeline that deploys.
    AWS Services: Codecommit, Codebuild, Codepipeline, Codedeploy, Cloudformation, Lambda
    Use: To use this you can run the npm run deploy:cicd command
*/

new CarbonlakeQuickstartCiCdStack(app, 'CarbonLakeQuickstartCiCdStack');
