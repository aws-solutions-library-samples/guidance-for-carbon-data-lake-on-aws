import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnOutput } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_codecommit as codecommit } from "aws-cdk-lib";
import * as path from 'path';
import { AmplifyDeploy } from "../../constructs/construct-amplify-deploy/construct-amplify-deploy";

interface WebStackProps extends cdk.StackProps {
  apiId: string;
  graphqlUrl: string;
  identityPoolId: string;
  userPoolId: string;
  userPoolWebClientId: string;
  landingBucketName: string;
}

export class WebStack extends cdk.Stack {
  public amplifyDeployment: AmplifyDeploy;
  public sagemakerAnalysisBucket: s3.Bucket;
  readonly sagemakerCodecommitRepo: codecommit.Repository;

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    this.amplifyDeployment = new AmplifyDeploy(this, 'AmplifyDeployment', {
      appPath: path.join(__dirname, './app/sample-ui-cloudscape'),
      repoName: 'CDLWebAppRepo',
      region: this.region,
      apiId: props.apiId,
      graphqlUrl: props.graphqlUrl,
      identityPoolId: props.identityPoolId,
      userPoolId: props.userPoolId,
      userPoolWebClientId: props.userPoolWebClientId,
      landingBucketName: props.landingBucketName,
      

    });

    new CfnOutput(this, 'CDLWebAppRepositoryCloneUrl', {
      value: this.amplifyDeployment.repository.repositoryCloneUrlHttp,
      description: 'CDLWebAppRepositoryLink',
      exportName: 'CDLWebAppRepositoryLink'
    });

    new CfnOutput(this, 'CDLWebAppId', {
      value: this.amplifyDeployment.amplifyApp.appId,
      description: 'CDLWebAppRepository',
      exportName: 'CDLWebAppRepository'
    });

    new CfnOutput(this, 'CDLAmplifyLink', {
      value: `https://${this.amplifyDeployment.amplifyApp.env.region}.console.aws.amazon.com/amplify/home?region=${this.amplifyDeployment.amplifyApp.env.region}#/${this.amplifyDeployment.amplifyApp.appId}`,
      description: 'CDLAmplifyLink',
      exportName: 'CDLAmplifyLink'
    });

    new CfnOutput(this, 'CDLWebAppDomain', {
      value: `https://dev.${this.amplifyDeployment.amplifyApp.defaultDomain}`,
      description: 'CDLWebAppDomain',
      exportName: 'CDLWebAppDomain'
    });

  cdk.Tags.of(this).add("component", "amplifyDeployment");
}
}
