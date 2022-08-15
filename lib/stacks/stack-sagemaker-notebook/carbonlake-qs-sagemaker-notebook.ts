import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2, StackProps } from "aws-cdk-lib";
import { aws_iam as iam, CfnOutput } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_sagemaker as sagemaker } from "aws-cdk-lib";

export interface SageMakerNotebookStackProps extends StackProps {
  readonly notebookInstanceName?: string;
  readonly volumeSizeInGb?: number;
  readonly instanceType: ec2.InstanceType;
}

export class CLQSSageMakerNotebookStack extends cdk.Stack {
  public sagemakerNotebookInstance: sagemaker.CfnNotebookInstance;

  constructor(scope: Construct, id: string, props: SageMakerNotebookStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "data-analysis", {
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
              resources: [bucket.bucketArn],
              actions: ["s3:ListBucket"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [`${bucket.bucketArn}/*`],
              actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            }),
          ],
        }),
      },
    });

    this.sagemakerNotebookInstance = new sagemaker.CfnNotebookInstance(this, "notebook-instance", {
      instanceType: 'ml.t2.large',
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: props.notebookInstanceName,
      volumeSizeInGb: 20,
    });

    cdk.Tags.of(this).add("component", "sagemaker");
  }
}
