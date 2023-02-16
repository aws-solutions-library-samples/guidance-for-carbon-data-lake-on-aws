import { Duration, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Integer } from 'aws-sdk/clients/apigateway';

interface CdlLambdaProps {
    /**
     * Required: name of lambda function
     */
    readonly lambdaName: string;

    /**
     * Optional: set concurrency limit
     * @default 100
     */
    readonly concurrencyLimit?: Integer;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default lambda.Runtime.PYTHON_3_9
     */
    readonly runtime?: lambda.Runtime;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default lambda.Runtime.PYTHON_3_9
     */
    readonly handler: string;

    /**
     * Optional: set bucket versioning to false, this is true by default
     * @default lambda.Runtime.PYTHON_3_9
     */
    readonly environmentalVariables?: object;

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
    public readonly lambdaFunction: lambda.Function;
    
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
        this.lambdaFunction = new lambda.Function(this, props.lambdaName, {
            runtime: props.runtime ? props.runtime : lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            handler: props.handler,
            timeout: Duration.minutes(5),
            environment: props.environmentalVariables || undefined
          });
  };
  }