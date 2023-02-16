import { Construct } from 'constructs';
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { LifecyclePolicy } from 'aws-cdk-lib/aws-efs';

interface CdlS3Props {
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

  
  export class CdlS3 extends Construct {
    /**
     * S3 bucket object to be passed to other functions
     */
    public readonly s3Bucket: s3.Bucket;
    /**
     * S3 bucket object to be passed to other functions
     */
    public readonly accessLogBucket: s3.Bucket;

    /**
        * Creates an s3 bucket that enables cdk_nag compliance through defaults
        * This dummy data can be used to demonstrate the data pipeline
        * By default the bucket will include AWS managed encryption, block all public access,
        * bucket versioning, and autoDelete objects as true.
        * @param {Construct} scope the Scope of the CDK Construct
        * @param {CdlS3Props} props the CdlS3Props [properties]{@link CdlS3Props}
        * @param CdlS3Props
    */
    constructor(scope: Construct, id: string, props: CdlS3Props) {
        super(scope, id);
        /** 
         * Creates a standard opinionated cost-optimized lifecycle policy.
         * This policy begins with S3 standard storage.
         * After 30 days of no access objects are transitioned to S3 infrequent access.
         * After 90 days of no access objects are transitioned to S3 Glacier instant retrieval.
        */
        const costOptimizedLifecycleRule = [
            {
                transitions: [
                    {
                        storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                        transitionAfter: Duration.days(30),
                    },
                    {
                        storageClass: s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
                        transitionAfter: Duration.days(90),
                    },
                ],
            },
        ];

        // Creates new S3 bucket for data upload
        this.accessLogBucket = new s3.Bucket(this, `${props.bucketName}-access-logs`, {
            encryption: s3.BucketEncryption.S3_MANAGED, // all buckets are encrypted with AWS managed keys
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // all public access is blocked
            versioned: true, // versioning true by default unless otherwise specified
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // Creates new S3 bucket for data upload
        this.s3Bucket = new s3.Bucket(this, props.bucketName, {
            encryption: s3.BucketEncryption.S3_MANAGED, // all buckets are encrypted with AWS managed keys
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // all public access is blocked
            versioned: props.bucketVersioning ? props.bucketVersioning : true, // versioning true by default unless otherwise specified
            removalPolicy: RemovalPolicy.DESTROY, // by default removal policy will be destroy
            autoDeleteObjects: true, // by default auto-delete policy will be true
            serverAccessLogsBucket: this.accessLogBucket, // specifies the s3 bucket for access logs
            // by default this leaves the bucket lifecycle policy as the default for the s3 bucket construct
        });

        /**
        * If optional bucketLifeCyclePolicyArray is defined as prop,
        * loops through array of policies and adds each to the s3 bucket.
        * This allows standard s3 policy to be default
        * and user can define any additional policies to ovveride this default.
            */
        if(props.bucketLifeCyclePolicyArray) {
            console.log("Lifecycle policy option enabled");
            (props.bucketLifeCyclePolicyArray).forEach(policy => {
                this.s3Bucket.addLifecycleRule(policy)
            });
        }

    }
    
}  