import { Construct } from 'constructs';
import { aws_iam as iam, CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as Amplify from "@aws-cdk/aws-amplify-alpha"
import { NagSuppressions } from 'cdk-nag';

interface AmplifyDeployProps {
  appPath: string;
  repoName: string;
  region: string;
  apiId: string;
  graphqlUrl: string;
  identityPoolId: string;
  userPoolId: string;
  userPoolWebClientId: string;
  landingBucketName: string;

}

export class AmplifyDeploy extends Construct {
  public repository: codecommit.Repository;
  public amplifyApp: Amplify.App;
  public repositoryNameString: string;
  public branchOutput: any;

  constructor(scope: Construct, id: string, props: AmplifyDeployProps) {
    super(scope, id)
        
        // create a codecommit repository and 
        this.repository = new codecommit.Repository(this, 'AmplifyCodeCommitRepository', {
            repositoryName: props.repoName,
            description: "Amplify Web Application Deployment Repository",
            code: codecommit.Code.fromDirectory(props.appPath, 'dev')
        });

        // define an amplify app
        this.amplifyApp = new Amplify.App(this, 'CDLWebApp', {
          description: "Sample AWS Amplify Application for Carbon Data Lake Quickstart Development Kit",
          sourceCodeProvider: new Amplify.CodeCommitSourceCodeProvider({
            repository: this.repository,
          },
          ),
          environmentVariables: {
            'REGION': props.region,
            'API_ID': props.apiId,
            'GRAPH_QL_URL': props.graphqlUrl,
            'IDENTITY_POOL_ID': props.identityPoolId,
            'USER_POOL_ID': props.userPoolId,
            'USER_POOL_WEB_CLIENT_ID': props.userPoolWebClientId,
            'UPLOAD_BUCKET': props.landingBucketName,
          },
          customRules: []

        })

        this.amplifyApp.addCustomRule(Amplify.CustomRule.SINGLE_PAGE_APPLICATION_REDIRECT) // adds support for amplify single page react application delivery


        const devBranch = this.amplifyApp.addBranch('dev');

        this.amplifyApp.applyRemovalPolicy(RemovalPolicy.DESTROY);

        /**
          * Automatically deploys the Amplify app by releasing new changes to the build stage
         */
        const amplifyAutoDeploy = new cr.AwsCustomResource(this, 'AmplifyAutoDeploy', {
          onCreate: {
            service: 'Amplify',
            action: 'startJob',
            physicalResourceId: cr.PhysicalResourceId.of('app-build-trigger'),
            parameters: {
                appId: this.amplifyApp.appId,
                branchName: devBranch.branchName,
                jobType: 'RELEASE',
                jobReason: 'Auto Start build',
            }
          },
          policy: cr.AwsCustomResourcePolicy.fromStatements([ new iam.PolicyStatement({
            actions: ['amplify:StartJob'],
            effect: iam.Effect.ALLOW,
            resources: [
              `${this.amplifyApp.arn}/branches/${devBranch.branchName}/jobs/*`,
            ]
          })
          ]),
        });

        NagSuppressions.addResourceSuppressionsByPath(Stack.of(this),
        "/WebStack/AmplifyDeployment/AmplifyAutoDeploy/CustomResourcePolicy/Resource", [
          {
            id: 'AwsSolutions-IAM5',
            reason:
              'This is required to allow deployment of all jobs, since jobs are assigned dynamically.',
          }
        ] 
        )

        NagSuppressions.addStackSuppressions(Stack.of(this), [
          {
            id: 'AwsSolutions-L1',
            reason:
              'This resource uses the standard custom resource construct, which is built for stability using a previous lambda runtime.',
          },
          {
            id: 'AwsSolutions-IAM4',
            reason:
              'AWS Custom Resource is an AWS maintained construct that uses AWS Managed Policies.',
          }
        ])
    }
}
