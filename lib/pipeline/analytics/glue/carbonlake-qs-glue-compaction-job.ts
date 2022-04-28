import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_glue as glue, aws_iam as iam, aws_s3 as s3, RemovalPolicy, aws_s3_deployment as s3deploy } from 'aws-cdk-lib';

export class CarbonLakeGlueCompactionJobStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Create a new Role for Glue
        const role = new iam.Role(this, 'carbonlake-glue-role', {
          assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
        });
        
        // Add AWSGlueServiceRole to role
        const gluePolicy = iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole");
        role.addManagedPolicy(gluePolicy);

        // Create a new S3 bucket for Glue scripts
        const bucketName = '148257099368-fifa';
        const dataBucketName = '148257099368-data';

        const glueS3Bucket = new s3.Bucket(this, 'GlueFifaBucket', {
          versioned: true,
          bucketName: bucketName,
          removalPolicy: RemovalPolicy.DESTROY,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
          encryption: s3.BucketEncryption.S3_MANAGED,
          autoDeleteObjects: true
        });
        
        // Assign role to S3 bucket
        glueS3Bucket.grantReadWrite(role);

        // Assign permission to data bucket
        const dataS3Bucket = s3.Bucket.fromBucketName(this, 'existingBucket', dataBucketName);

        dataS3Bucket.grantReadWrite(role);

        // create glue python job
        const getFifaDataJobName = 'glue-purge-old-calculator-records';
        new glue.CfnJob(this, getFifaDataJobName, {
            name: getFifaDataJobName,
            role: role.roleArn,
            command: {
              name: 'pythonshell',
              pythonVersion: '3',
              scriptLocation: 's3://' + bucketName + '/Scripts/glue-purge-old-calculator-records.py'
            } 
          });

        // script to process data and save in S3
        const processFifaDataJobName = 'glue-parquet-etl';
        const PYTHON_VERSION = "3";
        const GLUE_VERSION = "1.0";
        const COMMAND_NAME = "glueetl";
        new glue.CfnJob(this, processFifaDataJobName, {
            name: processFifaDataJobName,
            role: role.roleArn,
            command: {
              name: COMMAND_NAME,
              pythonVersion: PYTHON_VERSION,
              scriptLocation: 's3://' + bucketName + '/Scripts/glue-parquet-etl.py',
            },
            defaultArguments: { '--job-bookmark-option': 'job-bookmark-enable' },
            glueVersion: GLUE_VERSION,
          });

      
        // Deploy glue job to S3 bucket
        new s3deploy.BucketDeployment(this, 'DeployGlueJobFiles', {
          sources: [s3deploy.Source.asset('./lib/pipeline/analytics/glue/assets')],
          destinationBucket: glueS3Bucket,
          destinationKeyPrefix: 'Scripts'
        });

    }
}