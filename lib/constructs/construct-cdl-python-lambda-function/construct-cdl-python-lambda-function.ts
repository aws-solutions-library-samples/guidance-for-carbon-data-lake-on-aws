import { Duration } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Integer } from 'aws-sdk/clients/apigateway';
import { aws_sqs as sqs } from 'aws-cdk-lib';

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
     * Optional: set timeout minutes
     * @default 15
     */
    readonly timeout?: Duration;

    /**
     * Optional: set lambda runtime to select different python runtime
     * @default lambda.Runtime.PYTHON_3_9
     */
    readonly runtime: lambda.Runtime;

    /**
     * Optional: set handler name -- default is "main.handler"
     */
    readonly handler: string;

    /**
     * Optional: set handler directory path -- default is './lambda'
     * @default "./lambda"
     */
    readonly code: lambda.Code;

    /**
     * Optional: set handler directory path -- default is './lambda'
     * @default undefined
     */
    readonly layers?: Array<lambda.ILayerVersion>;

    /**
     * Optional: set environmental variables (always encrypted by default)
     * @default undefined
     */
    readonly environment?: Record<string, string>;
  
  }

  /**
     * This construct provides a pre-configured default Python Lambda Function.
     * This pre-configured default meets cdk_nag AWS specifications
     * for security and well-architected infrastructure.
     */

  
  export class CdlPythonLambda extends lambda.Function {
    /**
     * S3 bucket object to be passed to other functions
     */
    public readonly lambdaFunction: lambda.Function;
    public readonly lambdaDlq: sqs.Queue;
    
    /**
        * Creates a Python Lambda Function that enables cdk_nag compliance through defaults
        * This Lambda Function includes a FIFO dead letter queue,
        * X-Ray tracing enabled by default, and x86 architecture
        * to utilize Graviton2 instances and improve performance
        * and reduce electricity consumption.
        * @param scope
        * @param id
        * @param CdlLambdaProps
    */
    constructor(scope: Construct, id: string, props: CdlLambdaProps) {
        super(scope, id, props);
        
        /** 
         * Creates a FIFO queue to use as dead letter queue for Lambda function.
        */

        this.lambdaDlq = new sqs.Queue(this, `${props.lambdaName}DLQ`, {
          queueName: `${props.lambdaName}dlg.fifo`,
          deliveryDelay: Duration.millis(0),
          contentBasedDeduplication: true,
          retentionPeriod: Duration.days(14),
          fifo: true
        })

         /** 
         * Creates a Python Lambda Function with FIFO dead letter queue, x86 architecture,
         * and X-ray tracing.
        */
        
        this.lambdaFunction = new lambda.Function(this, props.lambdaName, {
            runtime: props.runtime,
            code: props.code,
            handler: props.handler,
            layers: props.layers,
            timeout: props.timeout? props.timeout : Duration.minutes(5),
            environment: props.environment || undefined,
            architecture: lambda.Architecture.X86_64, // specify graviton2 based lambda architecture
            deadLetterQueueEnabled: true, // enable FIFO dead letter queue
            deadLetterQueue: this.lambdaDlq, // specify FIFO dead letter queue
            tracing: lambda.Tracing.ACTIVE // enable x-ray tracing for all functions
          });
  }
  }