import { Names, NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface CarbonLakeGlueTransformationStackProps extends NestedStackProps {
  rawBucket: cdk.aws_s3.Bucket;
  transformedBucket: cdk.aws_s3.Bucket;
  uniqueDirectory: any
}

export class CarbonLakeGlueTransformationStack extends NestedStack {
  public readonly glueTransformJobName: string;

    constructor(scope: Construct, id: string, props: CarbonLakeGlueTransformationStackProps) {
        super(scope, id, props);

        // Create new S3 bucket to store glue script
          const glueScriptsBucket = new cdk.aws_s3.Bucket(this, 'glueTransformationScriptsBucket', {
            blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });


        // Create IAM policy for Glue to assume
        const glueTransformS3Policy = new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              resources: [
                `arn:aws:s3:::${glueScriptsBucket.bucketName}`,
                `arn:aws:s3:::${glueScriptsBucket.bucketName}/*`,
                `arn:aws:s3:::${props.rawBucket.bucketName}`,
                `arn:aws:s3:::${props.rawBucket.bucketName}/*`,
                `arn:aws:s3:::${props.transformedBucket.bucketName}`,
                `arn:aws:s3:::${props.transformedBucket.bucketName}/*`
              ],
              actions: [
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:PutObject",
                "s3:PutObjectTagging",
                "s3:PutObjectVersionTagging"
              ],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
          ],
        });
        const gluePolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole");

        // Create IAM Role to be assuemd by Glue
        const role = new cdk.aws_iam.Role(this, 'carbonlake-glue-transform-role', {
          assumedBy: new cdk.aws_iam.ServicePrincipal('glue.amazonaws.com'),
          description: 'IAM role to be assumed by Glue transformation job',
          inlinePolicies: {
            // 👇 attach the Policy Document as inline policies
            GlueTranformationS3Policy: glueTransformS3Policy,
          }
        });
        role.addManagedPolicy(gluePolicy);

        // create glue ETL script to process split input CSV files into smaller JSON files and save to S3
        this.glueTransformJobName = `glue-transform-${Names.uniqueId(role).slice(-8)}`;

        const glueTransformJob = new cdk.aws_glue.CfnJob(this, this.glueTransformJobName, {
            name: this.glueTransformJobName,
            role: role.roleArn,
            command: {
              name: "glueetl",
              pythonVersion: "3",
              scriptLocation: 's3://' + glueScriptsBucket.bucketName + '/Scripts/glue-split-csv-into-json.py',
            },
            defaultArguments: { 
              '--job-bookmark-option': 'job-bookmark-enable',
              '--enable-job-insights': 'true',
              "--job-language": "python",
              "--TempDir": "s3://" + glueScriptsBucket.bucketName + "/output/temp/",
              "--spark-event-logs-path": "s3://" + glueScriptsBucket.bucketName + "/output/logs/",    
              "--enable-metrics": "",
              "--enable-continuous-cloudwatch-log": "true",
              // '--UNIQUE_DIRECTORY': props.uniqueDirectory,
              '--RAW_BUCKET_NAME': props.rawBucket.bucketName,
              '--TRANFORMED_BUCKET_NAME': props.transformedBucket.bucketName
            },
            glueVersion: "3.0",
            maxRetries: 3,
            timeout: 2800,
            numberOfWorkers: 10,
            workerType: "G.1X",
            executionProperty: {
              maxConcurrentRuns: 100
            }
          });

        // Deploy glue job to S3 bucket
        new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployGlueJobFiles', {
          sources: [cdk.aws_s3_deployment.Source.asset('./lib/pipeline/transform/glue/assets')],
          destinationBucket: glueScriptsBucket,
          destinationKeyPrefix: 'Scripts'
        });

    }
}