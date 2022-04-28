import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';

export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
  //glueScriptsBucketName: cdk.aws_s3.Bucket;
}

export class CarbonLakeGlueCompactionJobStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);
        const glueScriptsBucketName = 'cl-148257099368-glue-scripts';
        const rawBucketName = 'cl-148257099368-raw';
        const transformedBucketName = 'cl-148257099368-cleansed';
        const enrichedBucketName = 'cl-148257099368-enriched';
        const uniqueDirectory = 'this-is-a-unique-identifier';

        // Create a new Role for Glue
        const role = new cdk.aws_iam.Role(this, 'carbonlake-glue-role', {
          assumedBy: new cdk.aws_iam.ServicePrincipal('glue.amazonaws.com'),
        });
        
        // Add AWSGlueServiceRole to role
        const gluePolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole");
        role.addManagedPolicy(gluePolicy);
        
        // Assign role to S3 bucket with glue scripts
        const glueScriptsBucket = cdk.aws_s3.Bucket.fromBucketName(this, 'existingBucket', glueScriptsBucketName);
        glueScriptsBucket.grantReadWrite(role);

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
              '--ENRICHED_BUCKET_NAME': enrichedBucketName 
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
              '--ENRICHED_BUCKET_NAME': enrichedBucketName 
            },
            glueVersion: "1.0",
            executionProperty: {
              maxConcurrentRuns: 100,
            }
          });

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
              '--UNIQUE_DIRECTORY': uniqueDirectory,
              '--RAW_BUCKET_NAME': rawBucketName,
              '--TRANFORMED_BUCKET_NAME': transformedBucketName
            },
            glueVersion: "1.0",
            executionProperty: {
              maxConcurrentRuns: 100,
            }
          });
      
        // Deploy glue job to S3 bucket
        new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployGlueJobFiles', {
          sources: [cdk.aws_s3_deployment.Source.asset('./lib/pipeline/analytics/glue/assets')],
          destinationBucket: glueScriptsBucket,
          destinationKeyPrefix: 'Scripts'
        });

    }
}