import { StackProps, Names, RemovalPolicy } from 'aws-cdk-lib'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CdlS3 } from '../../../constructs/construct-cdl-s3-bucket/construct-cdl-s3-bucket'

interface DataCompactionGlueJobsProps extends StackProps {
  enrichedBucket: cdk.aws_s3.Bucket
}

export class DataCompactionGlueJobs extends Construct {
  public readonly glueCompactionJobName: string
  public readonly glueDataFlushJobName: string

  constructor(scope: Construct, id: string, props: DataCompactionGlueJobsProps) {
    super(scope, id)

    // Create new S3 bucket to store glue data compaction script
    const glueScriptsBucket = new CdlS3(this, 'glueCompactionJobScriptsBucket', {
    })

    // Create IAM policy for Glue to assume
    const glueCompactionJobS3Policy = new cdk.aws_iam.PolicyDocument({
      statements: [
        new cdk.aws_iam.PolicyStatement({
          resources: [
            `arn:aws:s3:::${glueScriptsBucket.bucketName}`,
            `arn:aws:s3:::${glueScriptsBucket.bucketName}/*`,
            `arn:aws:s3:::${props.enrichedBucket.bucketName}`,
            `arn:aws:s3:::${props.enrichedBucket.bucketName}/*`,
          ],
          actions: [
            's3:GetObject*',
            's3:GetBucket*',
            's3:List*',
            's3:PutObject',
            's3:PutObjectTagging',
            's3:PutObjectVersionTagging',
            's3:DeleteObject',
          ],
          effect: cdk.aws_iam.Effect.ALLOW,
        }),
      ],
    })
    const gluePolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole')

    // Create IAM Role to be assumed by Glue
    const role = new cdk.aws_iam.Role(this, 'cdl-glue-transform-role', {
      assumedBy: new cdk.aws_iam.ServicePrincipal('glue.amazonaws.com'),
      description: 'IAM role to be assumed by Glue transformation job',
      inlinePolicies: {
        GlueCompactionJobS3Policy: glueCompactionJobS3Policy,
      },
    })
    role.addManagedPolicy(gluePolicy)

    // create unique name for glue data flush job that will be passed to state machine
    this.glueDataFlushJobName = `glue-remove-old-calculator-records-${Names.uniqueId(role).slice(-8)}`

    // create glue python shell script for purging old calculator records
    new cdk.aws_glue.CfnJob(this, this.glueDataFlushJobName, {
      name: this.glueDataFlushJobName,
      role: role.roleArn,
      command: {
        name: 'pythonshell',
        pythonVersion: '3',
        scriptLocation: 's3://' + glueScriptsBucket.bucketName + '/Scripts/glue-purge-old-calculator-records.py',
      },
      defaultArguments: {
        '--ENRICHED_BUCKET_NAME': props.enrichedBucket.bucketName,
        '--enable-job-insights': 'true',
        '--job-language': 'python',
        '--TempDir': 's3://' + glueScriptsBucket.bucketName + '/output/temp/',
        '--spark-event-logs-path': 's3://' + glueScriptsBucket.bucketName + '/output/logs/',
        '--enable-metrics': '',
        '--enable-continuous-cloudwatch-log': 'true',
      },
      executionProperty: {
        maxConcurrentRuns: 100,
      },
    })

    // create unique name for glue data compaction job that will be passed to state machine
    this.glueCompactionJobName = `glue-compact-daily-calculator-records-${Names.uniqueId(role).slice(-8)}`

    // create glue ETL script to process and compact calculator output data and save to S3
    new cdk.aws_glue.CfnJob(this, this.glueCompactionJobName, {
      name: this.glueCompactionJobName,
      role: role.roleArn,
      command: {
        name: 'glueetl',
        pythonVersion: '3',
        scriptLocation: 's3://' + glueScriptsBucket.bucketName + '/Scripts/glue-compact-calculator-records.py',
      },
      defaultArguments: {
        '--job-bookmark-option': 'job-bookmark-enable',
        '--enable-job-insights': 'true',
        '--job-language': 'python',
        '--TempDir': 's3://' + glueScriptsBucket.bucketName + '/output/temp/',
        '--spark-event-logs-path': 's3://' + glueScriptsBucket.bucketName + '/output/logs/',
        '--enable-metrics': '',
        '--enable-continuous-cloudwatch-log': 'true',
        '--ENRICHED_BUCKET_NAME': props.enrichedBucket.bucketName,
      },
      glueVersion: '3.0',
      maxRetries: 3,
      timeout: 2800,
      numberOfWorkers: 10,
      workerType: 'G.1X',
      executionProperty: {
        maxConcurrentRuns: 100,
      },
    })

    // Deploy glue job scripts to S3 bucket
    new cdk.aws_s3_deployment.BucketDeployment(this, 'DeployGlueJobFiles', {
      sources: [cdk.aws_s3_deployment.Source.asset('./lib/stacks/stack-data-compaction/construct-data-compaction-glue/assets')],
      destinationBucket: glueScriptsBucket,
      destinationKeyPrefix: 'Scripts',
    })
  }
}
