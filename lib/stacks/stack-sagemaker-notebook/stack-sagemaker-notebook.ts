import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2, StackProps } from "aws-cdk-lib";
import { aws_iam as iam, CfnOutput } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_sagemaker as sagemaker } from "aws-cdk-lib";
import { aws_codecommit as codecommit } from "aws-cdk-lib";
import * as path from 'path';


export class SageMakerNotebookStack extends cdk.Stack {
  public sagemakerNotebookInstance: sagemaker.CfnNotebookInstance;
  public sagemakerAnalysisBucket: s3.Bucket;
  readonly sagemakerCodecommitRepo: codecommit.Repository;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.sagemakerAnalysisBucket = new s3.Bucket(this, "data-analysis", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const sagemakerExecutionRole = new iam.Role(this, "sagemaker-execution-role", {
      assumedBy: new iam.ServicePrincipal("sagemaker.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSageMakerFullAccess"),
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "personalize-full-access",
          "arn:aws:iam::aws:policy/service-role/AmazonPersonalizeFullAccess"
        ),
      ],
      inlinePolicies: {
        s3Buckets: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [this.sagemakerAnalysisBucket.bucketArn],
              actions: ["s3:ListBucket"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [`${this.sagemakerAnalysisBucket.bucketArn}/*`],
              actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            }),
          ],
        }),
      },
    });

    // creates a codecommit repo and uploads the sagemaker notebook to it as a first commit
    this.sagemakerCodecommitRepo = new codecommit.Repository(this, 'CDLSagemakerCodecommitRepo', {
      repositoryName: 'CDLSagemakerRepository',
      code: codecommit.Code.fromDirectory(path.join(__dirname, 'notebooks/')), // optional property, branch parameter can be omitted
    });

    this.sagemakerCodecommitRepo.grantRead(sagemakerExecutionRole);

    // creates a sagemaker notebook instance with the defined codecommit repo as the default repo
    this.sagemakerNotebookInstance = new sagemaker.CfnNotebookInstance(this, "CDLSagemakerNotebook", {
      instanceType: 'ml.t2.medium',
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: "CarbonLakeSagemakerNotebook",
      defaultCodeRepository: this.sagemakerCodecommitRepo.repositoryCloneUrlHttp,
      volumeSizeInGb: 20,
    });


    new cdk.CfnOutput(this, 'CDLSagemakerRepository', {
      value: this.sagemakerCodecommitRepo.repositoryCloneUrlHttp,
      description: 'CDLSagemakerRepository',
      exportName: 'CDLSagemakerRepository',
    });

      // Output link to Sagemaker Notebook in the console
  new cdk.CfnOutput(this, 'CDLSagemakerNotebookUrl', {
    value: `https://${this.region}.console.aws.amazon.com/sagemaker/home?region=${this.region}#/notebook-instances/${this.sagemakerNotebookInstance.notebookInstanceName}`,
    description: 'AWS console URL for Sagemaker Notebook ML Instance',
    exportName: 'CDLSagemakerNotebookUrl',
  });

  cdk.Tags.of(this).add("component", "sagemakerNotebook");
}
}
