import { App, Stack, StackProps, RemovalPolicy, PhysicalName, CfnOutput, Tags } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class CLQSSharedResourcesStack extends Stack {
  public readonly carbonlakeLandingBucket: s3.Bucket
  public readonly carbonlakeRawBucket: s3.Bucket
  public readonly carbonlakeErrorBucket: s3.Bucket
  public readonly carbonlakeTransformedBucket: s3.Bucket
  public readonly carbonlakeEnrichedBucket: s3.Bucket
  public readonly carbonlakeForecastBucket: s3.Bucket
  public readonly carbonlakeDataLineageBucket: s3.Bucket
  public readonly glueEnrichedDataDatabase: glue.CfnDatabase

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // Raw bucket where files are moved, once they pass the data quality check
    // TODO add a lifecycle policy to archive files to Glacier
    // TODO add a default lock on the objects (WORM)
    this.carbonlakeRawBucket = new s3.Bucket(this, 'carbonlakeRawBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Error bucket where files are moved if they don't pass the data quality check
    // Once manually processed, the files are manually removed from the bucket
    this.carbonlakeErrorBucket = new s3.Bucket(this, 'carbonlakeErrorBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Transformed bucket where files are moved after they are processed (format = jsonl)
    // TODO add a lifecycle policy to archive files to Glacier
    // TODO add a default lock on the objects (WORM)
    this.carbonlakeTransformedBucket = new s3.Bucket(this, 'carbonlakeTransformedBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Enriched bucket where files are moved after they are enriched with calculated emissions (format = jsonl)
    // A compacting job compacts jsonl files into parquet files every day
    this.carbonlakeEnrichedBucket = new s3.Bucket(this, 'carbonlakeEnrichedBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Used for forecasting
    this.carbonlakeForecastBucket = new s3.Bucket(this, 'carbonlakeForecastBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Bucket used to store unprocessed data lineage events
    // TODO add a lifecycle policy to archive files to Glacier
    this.carbonlakeDataLineageBucket = new s3.Bucket(this, 'carbonlakeDataLineageBucket', {
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

    new CfnOutput(this, 'CLQSEnrichedDataBucket', {
      value: this.carbonlakeEnrichedBucket.bucketName,
      description: 'Enriched data bucket with outputs from calculator service',
      exportName: 'CLQSEnrichedDataBucket',
    });

    new CfnOutput(this, 'CLQSEnrichedDataBucketUrl', {
      value: this.carbonlakeEnrichedBucket.bucketWebsiteUrl,
      description: 'Url for enriched data bucket with outputs from calculator service',
      exportName: 'CLQSEnrichedDataBucketUrl',
    });

    new CfnOutput(this, 'CLQSDataLineageBucket', {
      value: this.carbonlakeDataLineageBucket.bucketName,
      description: 'Data lineage S3 bucket',
      exportName: 'CLQSDataLineageBucket',
    });

    new CfnOutput(this, 'CLQSDataLineageBucketUrl', {
      value: this.carbonlakeDataLineageBucket.bucketWebsiteUrl,
      description: 'Data lineage S3 bucket URL',
      exportName: 'CLQSDataLineageBucketUrl',
    });

    // Outputs the region of the CDK app -- this assumes that there is a single region and should be modified if deploying across multiple regions
    new CfnOutput(this, 'CLQSAwsRegion', {
      value: this.region,
      description: 'Region of CDK Application AWS Deployment',
      exportName: 'CLQSAwsRegion',
    });
  
    Tags.of(this).add("component", "sharedResources");
  }
}
