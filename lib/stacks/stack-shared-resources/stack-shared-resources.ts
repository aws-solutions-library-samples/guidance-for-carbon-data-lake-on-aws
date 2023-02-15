import { Stack, StackProps, RemovalPolicy, PhysicalName, CfnOutput, Tags } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class SharedResourcesStack extends Stack {
  public readonly cdlLandingBucket: s3.Bucket
  public readonly cdlRawBucket: s3.Bucket
  public readonly cdlErrorBucket: s3.Bucket
  public readonly cdlTransformedBucket: s3.Bucket
  public readonly cdlEnrichedBucket: s3.Bucket
  public readonly cdlForecastBucket: s3.Bucket
  public readonly cdlDataLineageBucket: s3.Bucket
  public readonly glueEnrichedDataDatabase: glue.CfnDatabase

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // Raw bucket where files are moved, once they pass the data quality check
    // TODO add a lifecycle policy to archive files to Glacier
    // TODO add a default lock on the objects (WORM)
    this.cdlRawBucket = new s3.Bucket(this, 'cdlRawBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Error bucket where files are moved if they don't pass the data quality check
    // Once manually processed, the files are manually removed from the bucket
    this.cdlErrorBucket = new s3.Bucket(this, 'cdlErrorBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Transformed bucket where files are moved after they are processed (format = jsonl)
    // TODO add a lifecycle policy to archive files to Glacier
    // TODO add a default lock on the objects (WORM)
    this.cdlTransformedBucket = new s3.Bucket(this, 'cdlTransformedBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Enriched bucket where files are moved after they are enriched with calculated emissions (format = jsonl)
    // A compacting job compacts jsonl files into parquet files every day
    this.cdlEnrichedBucket = new s3.Bucket(this, 'cdlEnrichedBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Bucket used to store unprocessed data lineage events
    // TODO add a lifecycle policy to archive files to Glacier
    this.cdlDataLineageBucket = new s3.Bucket(this, 'cdlDataLineageBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Glue Metadata Catalog Database for enriched data
    this.glueEnrichedDataDatabase = new glue.CfnDatabase(this, 'enrichedCalculatorDataDatabase', {
      catalogId: this.account,
      databaseInput: {
        description: 'Glue Metadata Catalog  database for enriched calculator data',
      },
    })

    new CfnOutput(this, 'CDLEnrichedDataBucket', {
      value: this.cdlEnrichedBucket.bucketName,
      description: 'Enriched data bucket with outputs from calculator service',
      exportName: 'CDLEnrichedDataBucket',
    });

    new CfnOutput(this, 'CDLEnrichedDataBucketUrl', {
      value: this.cdlEnrichedBucket.bucketWebsiteUrl,
      description: 'Url for enriched data bucket with outputs from calculator service',
      exportName: 'CDLEnrichedDataBucketUrl',
    });

    new CfnOutput(this, 'CDLDataLineageBucket', {
      value: this.cdlDataLineageBucket.bucketName,
      description: 'Data lineage S3 bucket',
      exportName: 'CDLDataLineageBucket',
    });

    new CfnOutput(this, 'CDLDataLineageBucketUrl', {
      value: this.cdlDataLineageBucket.bucketWebsiteUrl,
      description: 'Data lineage S3 bucket URL',
      exportName: 'CDLDataLineageBucketUrl',
    });

    // Outputs the region of the CDK app -- this assumes that there is a single region and should be modified if deploying across multiple regions
    new CfnOutput(this, 'CDLAwsRegion', {
      value: this.region,
      description: 'Region of CDK Application AWS Deployment',
      exportName: 'CDLAwsRegion',
    });
  
    Tags.of(this).add("component", "sharedResources");
  }
}
