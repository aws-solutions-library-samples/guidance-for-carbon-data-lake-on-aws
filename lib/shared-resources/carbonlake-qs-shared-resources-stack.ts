import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'; 
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_glue as glue } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class CarbonlakeQuickstartSharedResourcesStack extends Stack {
    public readonly carbonlakeLandingBucket: s3.Bucket;
    public readonly carbonlakeRawBucket: s3.Bucket;
    public readonly carbonlakeErrorBucket: s3.Bucket;
    public readonly carbonlakeTransformedBucket: s3.Bucket;
    public readonly carbonlakeEnrichedBucket: s3.Bucket;
    public readonly carbonlakeForecastBucket: s3.Bucket;
    public readonly carbonlakeDataLineageBucket: s3.Bucket;
    public readonly glueEnrichedDataDatabase: glue.CfnDatabase;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Landing bucket where files are dropped by customers
        // Once processed, the files are removed by the pipeline
        this.carbonlakeLandingBucket = new s3.Bucket(this, 'carbonlakeLandingBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Raw bucket where files are moved, once they pass the data quality check
        // TODO add a lifecycle policy to archive files to Glacier
        // TODO add a default lock on the objects (WORM)
        this.carbonlakeRawBucket = new s3.Bucket(this, 'carbonlakeRawBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Error bucket where files are moved if they don't pass the data quality check
        // Once manually processed, the files are manually removed from the bucket
        this.carbonlakeErrorBucket = new s3.Bucket(this, 'carbonlakeErrorBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Transformed bucket where files are moved after they are processed (format = jsonl)
        // TODO add a lifecycle policy to archive files to Glacier
        // TODO add a default lock on the objects (WORM)
        this.carbonlakeTransformedBucket = new s3.Bucket(this, 'carbonlakeTransformedBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Enriched bucket where files are moved after they are enriched with calculated emissions (format = jsonl)
        // A compacting job compacts jsonl files into parquet files every day
        this.carbonlakeEnrichedBucket = new s3.Bucket(this, 'carbonlakeEnrichedBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Used for forecasting
        this.carbonlakeForecastBucket = new s3.Bucket(this, 'carbonlakeForecastBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Bucket used to store unprocessed data lineage events
        // TODO add a lifecycle policy to archive files to Glacier
        this.carbonlakeDataLineageBucket = new s3.Bucket(this, 'carbonlakeDataLineageBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Glue Metadata Catalog Database for enriched data
        this.glueEnrichedDataDatabase = new glue.CfnDatabase(this, "enrichedCalculatorDataDatabase", {
            catalogId: this.account,
            databaseInput: {
              description: 'Glue Metadata Catalog  database for enriched calculator data',
            },
          });
    }
}