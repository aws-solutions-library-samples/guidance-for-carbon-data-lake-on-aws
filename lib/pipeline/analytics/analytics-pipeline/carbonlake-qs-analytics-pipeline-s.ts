import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface CarbonLakeAnalyticsPipelineStackProps extends cdk.StackProps {
  //glueScriptsBucketName: cdk.aws_s3.Bucket;
  //enrichedBucketName: cdk.aws_s3.Bucket;
}

export class CarbonLakeAnalyticsPipelineStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        const glueScriptsBucketName = 'cl-148257099368-glue-scripts';
        const enrichedBucketName = 'cl-enriched-148257099368';


        // TODO: pass this bucket in as a parameter
        const glueScriptsBucket = cdk.aws_s3.Bucket.fromBucketName(this, 'existingBucket', glueScriptsBucketName);

        // Create IAM policy for Glue to assume
        const glueCompactionJobS3Policy = new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              resources: [
                `arn:aws:s3:::${glueScriptsBucketName}`,
                `arn:aws:s3:::${glueScriptsBucketName}/*`,
                `arn:aws:s3:::${enrichedBucketName}`,
                `arn:aws:s3:::${enrichedBucketName}/*`
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
            GlueCompactionJobS3Policy: glueCompactionJobS3Policy,
          }
        });
        role.addManagedPolicy(gluePolicy);

        // create glue python shell script for purging old calculator records
        const gluePurgeOldCalculatorRecordsJobName = 'glue-purge-old-calculator-records';
        new cdk.aws_glue.CfnJob(this, gluePurgeOldCalculatorRecordsJobName, {
            name: gluePurgeOldCalculatorRecordsJobName,
            role: role.roleArn,
            command: {
              name: 'pythonshell',
              pythonVersion: '3',
              scriptLocation: 's3://' + glueScriptsBucketName + '/Scripts/glue-purge-old-calculator-records.py'
            },
            defaultArguments: { 
              '--ENRICHED_BUCKET_NAME': enrichedBucketName,
              '--enable-job-insights': 'true',
              "--job-language": "python", 
              "--TempDir": "s3://" + glueScriptsBucketName + "/output/temp/",
              "--spark-event-logs-path": "s3://" + glueScriptsBucketName + "/output/logs/",    
              "--enable-metrics": "",
              "--enable-continuous-cloudwatch-log": "true"
            },
            executionProperty: {
              maxConcurrentRuns: 100,
            }
          });

        // create glue ETL script to process compact calculator output data and save to S3
        const glueCompactCalculatorRecordsJobName = 'glue-compact-calculator-records';
        
        new cdk.aws_glue.CfnJob(this, glueCompactCalculatorRecordsJobName, {
          name: glueCompactCalculatorRecordsJobName,
          role: role.roleArn,
          command: {
            name: "glueetl",
            pythonVersion: "3",
            scriptLocation: 's3://' + glueScriptsBucketName + '/Scripts/glue-compact-calculator-records.py',
          },
          defaultArguments: { 
            '--job-bookmark-option': 'job-bookmark-enable',
            '--enable-job-insights': 'true',
            "--job-language": "python",
            "--TempDir": "s3://" + glueScriptsBucketName + "/output/temp/",
            "--spark-event-logs-path": "s3://" + glueScriptsBucketName + "/output/logs/",    
            "--enable-metrics": "",
            "--enable-continuous-cloudwatch-log": "true",
            '--ENRICHED_BUCKET_NAME': enrichedBucketName 
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
        // TODO: move into a shared location
        new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployGlueJobFiles', {
          sources: [cdk.aws_s3_deployment.Source.asset('./lib/pipeline/analytics/analytics-pipeline/assets')],
          destinationBucket: glueScriptsBucket,
          destinationKeyPrefix: 'Scripts'
        });

    }
}