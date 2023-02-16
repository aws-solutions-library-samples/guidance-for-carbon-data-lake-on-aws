import { Duration, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'

interface CdlLambdaProps {
    /**
     * Required: Bucket name as a string
     */
    readonly bucketName: string;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default true
     */
    readonly bucketVersioning?: boolean;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default "Standard lifecycle policy."
     */
    readonly bucketLifeCyclePolicyArray?: Array <s3.LifecycleRule>;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default "S3 standard"
     */
    readonly bucketStorageClass?: boolean;


  }

  /**
     * This construct provides a pre-configured default s3 bucket.
     * This pre-configured default meets cdk_nag AWS specifications
     * for security and well-architected infrastructure.
     * The construct deploys an operational S3 bucket with an associated access log bucket.
     * By default the bucket will include AWS managed encryption, block all public access,
     * bucket versioning, and autoDelete objects as true.
     */

  
  export class CdlLambda extends Construct {
    /**
     * S3 bucket object to be passed to other functions
     */
    public readonly lambdaFunction: Lambda;
    /**
     * S3 bucket object to be passed to other functions
     */
    public readonly accessLogBucket: s3.Bucket;
    /**
        * Creates an s3 bucket that enables cdk_nag compliance through defaults
        * This dummy data can be used to demonstrate the data pipeline
        * By default the bucket will include AWS managed encryption, block all public access,
        * bucket versioning, and autoDelete objects as true.
        * @param scope
        * @param id
        * @param CdlLambdaProps
    */
    constructor(scope: Construct, id: string, props: CdlLambdaProps) {
        super(scope, id);
        /** 
         * Creates a standard opinionated cost-optimized lifecycle policy.
         * This policy begins with S3 standard storage.
         * After 30 days of no access objects are transitioned to S3 infrequent access.
         * After 90 days of no access objects are transitioned to S3 Glacier instant retrieval.
        */
        this.lambda = new lambda.Function(this, 'cdlCalculatorHandler', {
            runtime: lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            handler: this.lambdaHandler,
            timeout: Duration.minutes(5),
            environment: {
              EMISSIONS_FACTOR_TABLE_NAME: emissionsFactorReferenceTable.tableName,
              CALCULATOR_OUTPUT_TABLE_NAME: this.calculatorOutputTable.tableName,
              TRANSFORMED_BUCKET_NAME: props.transformedBucket.bucketName,
              ENRICHED_BUCKET_NAME: props.enrichedBucket.bucketName,
            },

        

    }
    
}  