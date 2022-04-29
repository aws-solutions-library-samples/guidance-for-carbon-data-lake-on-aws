import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface CarbonLakeDataCompactionGlueJobsStackProps extends NestedStackProps {
  enrichedBucket: cdk.aws_s3.Bucket;
}

export class CarbonLakeDataCompactionGlueJobsStack extends NestedStack {
  public readonly glueCompactionJob: cdk.aws_glue.CfnJob;
  public readonly glueDataFlushJob: cdk.aws_glue.CfnJob;

    constructor(scope: Construct, id: string, props: CarbonLakeDataCompactionGlueJobsStackProps) {
        super(scope, id, props);

        // Create new S3 bucket to store glue script
        const glueScriptsBucket = new cdk.aws_s3.Bucket(this, 'glueCompactionJobScriptsBucket', {
          blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
        });

        // Create IAM policy for Glue to assume
        const glueCompactionJobS3Policy = new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              resources: [
                `arn:aws:s3:::${glueScriptsBucket.bucketName}`,
                `arn:aws:s3:::${glueScriptsBucket.bucketName}/*`,
                `arn:aws:s3:::${props.enrichedBucket.bucketName}`,
                `arn:aws:s3:::${props.enrichedBucket.bucketName}/*`
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

        // Create IAM Role to be assumed by Glue
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
        const gluePurgeOldCalculatorRecordsJobName = 'glue-remove-old-calculator-records';
        this.glueDataFlushJob = new cdk.aws_glue.CfnJob(this, gluePurgeOldCalculatorRecordsJobName, {
            name: gluePurgeOldCalculatorRecordsJobName,
            role: role.roleArn,
            command: {
              name: 'pythonshell',
              pythonVersion: '3',
              scriptLocation: 's3://' + glueScriptsBucket.bucketName + '/Scripts/glue-purge-old-calculator-records.py'
            },
            defaultArguments: { 
              '--ENRICHED_BUCKET_NAME': props.enrichedBucket.bucketName,
              '--enable-job-insights': 'true',
              "--job-language": "python", 
              "--TempDir": "s3://" + glueScriptsBucket.bucketName + "/output/temp/",
              "--spark-event-logs-path": "s3://" + glueScriptsBucket.bucketName + "/output/logs/",    
              "--enable-metrics": "",
              "--enable-continuous-cloudwatch-log": "true"
            },
            executionProperty: {
              maxConcurrentRuns: 100,
            }
          });

        // create glue ETL script to process compact calculator output data and save to S3
        const glueCompactCalculatorRecordsJobName = 'glue-compact-daily-calculator-records';
        
        this.glueCompactionJob = new cdk.aws_glue.CfnJob(this, glueCompactCalculatorRecordsJobName, {
          name: glueCompactCalculatorRecordsJobName,
          role: role.roleArn,
          command: {
            name: "glueetl",
            pythonVersion: "3",
            scriptLocation: 's3://' + glueScriptsBucket.bucketName + '/Scripts/glue-compact-calculator-records.py',
          },
          defaultArguments: { 
            '--job-bookmark-option': 'job-bookmark-enable',
            '--enable-job-insights': 'true',
            "--job-language": "python",
            "--TempDir": "s3://" + glueScriptsBucket.bucketName + "/output/temp/",
            "--spark-event-logs-path": "s3://" + glueScriptsBucket.bucketName + "/output/logs/",    
            "--enable-metrics": "",
            "--enable-continuous-cloudwatch-log": "true",
            '--ENRICHED_BUCKET_NAME': props.enrichedBucket.bucketName
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
          sources: [cdk.aws_s3_deployment.Source.asset('./lib/data-compaction-pipeline/glue/assets')],
          destinationBucket: glueScriptsBucket,
          destinationKeyPrefix: 'Scripts'
        });
    }
}