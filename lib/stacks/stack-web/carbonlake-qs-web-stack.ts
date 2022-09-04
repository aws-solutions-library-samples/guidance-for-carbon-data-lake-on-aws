import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam, CfnOutput } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_codecommit as codecommit } from "aws-cdk-lib";
import * as path from 'path';
import { AmplifyDeploy } from "../../constructs/construct-amplify-deploy/construct-amplify-deploy";

interface CLQSWebStackProps extends cdk.StackProps {
  apiId: string;
  graphqlUrl: string;
  identityPoolId: string;
  userPoolId: string;
  userPoolWebClientId: string;
  landingBucketName: string;
}

export class CLQSWebStack extends cdk.Stack {
  public amplifyDeployment: AmplifyDeploy;
  public sagemakerAnalysisBucket: s3.Bucket;
  readonly sagemakerCodecommitRepo: codecommit.Repository;

  constructor(scope: Construct, id: string, props: CLQSWebStackProps) {
    super(scope, id, props);

    this.amplifyDeployment = new AmplifyDeploy(this, 'AmplifyDeployment', {
      appPath: path.join(__dirname, './app/carbonlake-ui-cloudscape'),
      repoName: 'CLQSWebAppRepo',
      region: this.region,
      apiId: props.apiId,
      graphqlUrl: props.graphqlUrl,
      identityPoolId: props.identityPoolId,
      userPoolId: props.userPoolId,
      userPoolWebClientId: props.userPoolWebClientId,
      landingBucketName: props.landingBucketName

    });

    new CfnOutput(this, 'CLQSAmplifyRepository', {
      value: "repo",
      description: 'CLQSAmplifyRepository',
      exportName: 'CLQSAmplifyRepository'
    });

  cdk.Tags.of(this).add("component", "amplifyDeployment");
}
}
