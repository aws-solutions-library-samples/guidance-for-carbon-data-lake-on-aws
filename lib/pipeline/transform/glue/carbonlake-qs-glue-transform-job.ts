import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
  //glueScriptsBucketName: cdk.aws_s3.Bucket;
  //rawBucketName: cdk.aws_s3.Bucket;
  //transformedBucketName: cdk.aws_s3.Bucket;
  //uniqueDirectory: string; //comes from step function
}

export class CarbonLakeGlueTransformationStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        const glueScriptsBucketName = 'cl-148257099368-glue-scripts';
        const rawBucketName = 'cl-raw-148257099368';
        const transformedBucketName = 'cl-cleansed-148257099368';
        const uniqueDirectory = 'this-is-a-unique-identifier';

        // TODO: pass this bucket in as a parameter
        const glueScriptsBucket = cdk.aws_s3.Bucket.fromBucketName(this, 'existingBucket', glueScriptsBucketName);

        // Create IAM policy for Glue to assume
        const glueTransformS3Policy = new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              resources: [
                `arn:aws:s3:::${glueScriptsBucketName}`,
                `arn:aws:s3:::${glueScriptsBucketName}/*`,
                `arn:aws:s3:::${rawBucketName}`,
                `arn:aws:s3:::${rawBucketName}/*`,
                `arn:aws:s3:::${transformedBucketName}`,
                `arn:aws:s3:::${transformedBucketName}/*`
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
        const glueSplitCsvIntoJsonJobName = 'glue-split-csv-into-json';
        new cdk.aws_glue.CfnJob(this, glueSplitCsvIntoJsonJobName, {
            name: glueSplitCsvIntoJsonJobName,
            role: role.roleArn,
            command: {
              name: "glueetl",
              pythonVersion: "3",
              scriptLocation: 's3://' + glueScriptsBucketName + '/Scripts/glue-split-csv-into-json.py',
            },
            defaultArguments: { 
              '--job-bookmark-option': 'job-bookmark-enable',
              '--enable-job-insights': 'true',
              "--job-language": "python",
              "--TempDir": "s3://" + glueScriptsBucketName + "/output/temp/",
              "--spark-event-logs-path": "s3://" + glueScriptsBucketName + "/output/logs/",    
              "--enable-metrics": "",
              "--enable-continuous-cloudwatch-log": "true",
              '--UNIQUE_DIRECTORY': uniqueDirectory,
              '--RAW_BUCKET_NAME': rawBucketName,
              '--TRANFORMED_BUCKET_NAME': transformedBucketName
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