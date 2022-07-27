import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep} from "aws-cdk-lib/pipelines";
import { CarbonlakeQuickstartPipelineStage } from './stages/carbonlake-qs-ci-cd-stage';
import { CarbonlakeGitlabMirroringStack } from './gitlab-mirroring-aws-remove-later/carbonlake-qs-gitlab-mirroring';

export class CarbonlakeQuickstartCiCdStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Creates a CodeCommit repository called 'CarbonLakeDevTestRepo'
        // If you are repurposing this repository use your own name here
        const repo = new codecommit.Repository(this, 'CarbonLakeRepo', {
            repositoryName: "CarbonLakeRepo"
        });

        const repoBranch = this.node.tryGetContext('repoBranch');

        // Creates a pipeline for deployment and build of CDK app
        // If you are repurposing this repository change the name of the pipeline
        // Update the branch from 'qsv1-dev' to the name of the branch you want to deploy from your repo
        const pipeline = new CodePipeline(this, 'Pipeline', {
          synth: new CodeBuildStep('SynthStep', {
                  input: CodePipelineSource.codeCommit(repo, repoBranch),
                  installCommands: [
                    'npm uninstall -g aws-cdk',
                    'npm install -g aws-cdk@latest'
                  ],
                  // if you run into issues with docker build follow these steps: https://docs.aws.amazon.com/codebuild/latest/userguide/troubleshooting.html#troubleshooting-cannot-connect-to-docker-daemon
                  commands: [
                      'npm ci', //<-- uncomment this and comment next line if you want to install from package-lock.json
                      'cdk --version',
                      'node --version',
                      //'npm install',
                      'cdk synth --all'
                    ],
                    // this sets the build environment to privileged image for docker execution
                    buildEnvironment: {
                      privileged: true
                    },
                  }
              ),
              dockerEnabledForSynth: true
              

          });

          const gitlabMirroring = new CarbonlakeGitlabMirroringStack(this, "CarbonLakeGitlabMirroringStack", {
            repoName: "CarbonLakeRepo" // repo name currently hard-coded TODO: take as parameter from pipeline
          });

            const deploy = new CarbonlakeQuickstartPipelineStage(this, 'Deploy');
            const deployStage = pipeline.addStage(deploy);

          /*


          const testStage = pipeline.addStage(new cdk.Stage(this, "test", {
            env: { region: "us-east-1"}
          }));

          testStage.addPost(new ManualApprovalStep('Manual approval step'));

          const productionStage = pipeline.addStage(new cdk.Stage(this, "production", {
            env: { region: "us-east-1"}       
          }));
          */


          
      }
  }