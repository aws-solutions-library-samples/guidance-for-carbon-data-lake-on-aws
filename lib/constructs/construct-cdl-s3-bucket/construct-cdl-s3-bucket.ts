/**
     * This construct provides a pre-configured default s3 bucket.
     * This pre-configured default meets cdk_nag AWS specifications
     * for security and well-architected infrastructure.
     * The construct deploys an operational S3 bucket with an associated access log bucket.
     * By default the bucket will include AWS managed encryption, block all public access,
     * bucket versioning, and autoDelete objects as true.
     */

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { LifecyclePolicy } from 'aws-cdk-lib/aws-efs';

interface CdlS3Props {
    /**
     * Bucket name as a string
     */
    bucketName: string;

    /**
     * Optional: set bucket versioning to false, this is true by default
     */
    bucketVersioning?: boolean;

  }

  /**
   * Create an s3 bucket that enables cdk_nag compliance through defaults
   * This dummy data can be used to demonstrate the data pipeline
   * By default the bucket will include AWS managed encryption, block all public access,
   * bucket versioning, and autoDelete objects as true.
   * @param scope
   * @param id 
   * @param props
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
     * Create a lambda function that uploads dummy data to an S3 bucket
     * This dummy data can be used to demonstrate the data pipeline
     * @param scope
     * @param id 
     * @param props
     */
    constructor(scope: Construct, id: string, props: CdlS3Props) {
        super(scope, id);

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
            versioned: true, // versioning true by default unless otherwise specified
            removalPolicy: RemovalPolicy.DESTROY, // by default removal policy will be destroy
            autoDeleteObjects: true, // by default auto-delete policy will be true
            serverAccessLogsBucket: this.accessLogBucket // specifies the s3 bucket for access logs
        });

    }
    
}  