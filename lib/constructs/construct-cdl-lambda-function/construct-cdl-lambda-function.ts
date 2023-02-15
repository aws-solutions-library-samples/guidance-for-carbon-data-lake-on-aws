/**
     * Name of the prop that does a thing
     */

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib'

interface MyNewProps {
    /**
     * Name of the prop that does a thing
     */
    myPrivateProp: 'some-string';
    /**
     * Name of some other prop that does another thing
     */
    myPublicProp: 'some-other-string';
  }

  export class CdlLambda extends Construct {
    /**
     * Name of the s3 bucket for file ouput
     */
    public readonly s3BucketName: string;
    /**
     * Name of the iot thing that is generated
     */
    private readonly iotThing: string;
  
    /**
     * Create a lambda function that uploads dummy data to an S3 bucket
     * This dummy data can be used to demonstrate the data pipeline
     * @param scope
     * @param id 
     * @param props
     */
    constructor(scope: Construct, id: string, props: MyNewProps) {
        super(scope, id);
        // Variable used to multiply and provide a final number
        const myVariable = 100

        // Creates new S3 bucket for data upload
        const myBucket = new s3.Bucket(this, 'myS3Bucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true, // CodePipeline requires a versioned source for source stages
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

    }
    
}  