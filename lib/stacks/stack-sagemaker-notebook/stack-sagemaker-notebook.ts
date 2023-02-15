import { Stack, StackProps, CfnOutput, PhysicalName, RemovalPolicy, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_sagemaker as sagemaker } from "aws-cdk-lib";
import { aws_codecommit as codecommit } from "aws-cdk-lib";
import { aws_kms as kms } from "aws-cdk-lib";
import * as path from 'path';

interface SagemakerForecastStackProps extends StackProps {
  enrichedDataBucket: s3.Bucket
}

export class SageMakerNotebookStack extends Stack {
  constructor(scope: Construct, id: string, props: SagemakerForecastStackProps) {
    super(scope, id, props);

    // Used for forecasting
    const sagemakerForecastResultsBucket = new s3.Bucket(this, 'cdlForecastBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // role to be assumed by the sagemaker notebook, grants privileges to read from
    // encriched data bucket, write to results bucket, and full access to Forecast
    const sagemakerExecutionRole = new iam.Role(this, "sagemaker-execution-role", {
      assumedBy: new iam.ServicePrincipal("sagemaker.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSageMakerFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonForecastFullAccess")
      ],
      inlinePolicies: {
        s3Buckets: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [
                sagemakerForecastResultsBucket.bucketArn,
                props.enrichedDataBucket.bucketArn
              ],
              actions: ["s3:ListBucket"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [sagemakerForecastResultsBucket.arnForObjects("*")],
              actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              resources: [props.enrichedDataBucket.arnForObjects("*")],
              actions: ["s3:GetObject"],
            }),
          ],
        }),
      },
    });

    // creates a kms key to encrypt the storage volume attached the notebook instance
    const encryptionKey = new kms.Key(this, 'CDLSagemakerEncryptionKey', {
      alias: "CDLSagemakerEncryptionKey",
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.DESTROY
    })

    // creates a codecommit repo and uploads the sagemaker notebook to it as a first commit
    const sagemakerCodecommitRepo = new codecommit.Repository(this, 'CDLSagemakerCodecommitRepo', {
      repositoryName: 'CDLSagemakerRepository',
      code: codecommit.Code.fromDirectory(path.join(__dirname, 'notebooks/')), // optional property, branch parameter can be omitted
    });

    sagemakerCodecommitRepo.grantRead(sagemakerExecutionRole);

    // creates a sagemaker notebook instance with the defined codecommit repo as the default repo
    const sagemakerNotebookInstance = new sagemaker.CfnNotebookInstance(this, "CDLSagemakerNotebook", {
      instanceType: 'ml.t2.medium',
      roleArn: sagemakerExecutionRole.roleArn,
      notebookInstanceName: "CarbonLakeSagemakerNotebook",
      defaultCodeRepository: sagemakerCodecommitRepo.repositoryCloneUrlHttp,
      volumeSizeInGb: 20,
      kmsKeyId: encryptionKey.keyId
    });

    // creates a role for Amazon Forecast to assume, with permissions to access data in the results bucket
    const forecastRole = new iam.Role(this, "forecast-execution-role", {
      assumedBy: new iam.ServicePrincipal("forecast.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")]
    });


    new CfnOutput(this, 'CDLSagemakerRepository', {
      value: sagemakerCodecommitRepo.repositoryCloneUrlHttp,
      description: 'CDLSagemakerRepository',
      exportName: 'CDLSagemakerRepository',
    });

    // Output link to Sagemaker Notebook in the console
    new CfnOutput(this, 'CDLSagemakerNotebookUrl', {
      value: `https://${this.region}.console.aws.amazon.com/sagemaker/home?region=${this.region}#/notebook-instances/${sagemakerNotebookInstance.notebookInstanceName}`,
      description: 'AWS console URL for Sagemaker Notebook ML Instance',
      exportName: 'CDLSagemakerNotebookUrl',
    });

    new CfnOutput(this, 'CDLForecastResultsBucket', {
      value: sagemakerForecastResultsBucket.bucketName,
      description: 'Bucket for storing results from the optional forecast stack.',
      exportName: 'CDLForecastResultsBucket',
    });

    new CfnOutput(this, 'CDLForecastResultsRole', {
      value: forecastRole.roleArn,
      description: 'Role arn assumed by Amazon Forecast, grants permissions to read training and validation data.',
      exportName: 'CDLForecastResultsRole',
    });

    Tags.of(this).add("component", "sagemakerNotebook");
  }
}
