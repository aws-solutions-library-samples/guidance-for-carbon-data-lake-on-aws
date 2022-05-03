import { App, CustomResource, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_dynamodb as ddb } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as path from 'path';

import { CarbonlakeQuickstartCalculatorStack } from './calculator/carbonlake-qs-calculator';
import { CarbonlakeQuickstartS3copierStack } from './s3copier/carbonlake-qs-s3copier';
import { CarbonlakeQuickstartStatemachineStack } from './statemachine/carbonlake-qs-statemachine-stack';
import { CarbonLakeGlueTransformationStack } from './transform/glue/carbonlake-qs-glue-transform-job';

interface PipelineProps extends StackProps {
  dataLineageFunction: lambda.Function
  landingBucket: s3.Bucket,
  rawBucket: s3.Bucket,
  transformedBucket: s3.Bucket
  enrichedBucket: s3.Bucket,
  uniqueDirectory: string
}

export class CarbonlakeQuickstartPipelineStack extends Stack {
  public readonly calculatorOutputTable: ddb.Table;

  constructor(scope: App, id: string, props: PipelineProps) {
    super(scope, id, props);

    /* ======== DATA QUALITY ======== */
    new CarbonlakeQuickstartS3copierStack(this, 'carbonlakeQuickstartS3copier', {
      landingBucket: props.landingBucket,
      rawBucket: props.rawBucket
    });

    /* ======== GLUE TRANSFORM ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueTransformJob } = new CarbonLakeGlueTransformationStack(this, 'carbonlakeQuickstartGlueTransformationStack', {
      rawBucket: props?.rawBucket,
      transformedBucket: props?.transformedBucket,
      uniqueDirectory: props?.uniqueDirectory
    });
    /* ======== CALCULATION ======== */

    const calculator = new CarbonlakeQuickstartCalculatorStack(this, 'CarbonlakeCalculatorStack', {
      transformedBucket: props.transformedBucket,
      enrichedBucket: props.enrichedBucket
    })
    this.calculatorOutputTable = calculator.calculatorOutputTable

    /* ======== STATEMACHINE ======== */

    // Required inputs for the step function
    //  - data lineage lambda function
    //  - dq quality workflow
    //  - glue transformation job
    //  - calculation function
    const { statemachine } = new CarbonlakeQuickstartStatemachineStack(this, 'carbonlakeQuickstartStatemachineStack', {
      dataLineageFunction: props?.dataLineageFunction,
      dataQualityJob: null,
      glueTransformJob: glueTransformJob,
      calculationJob: null
    });

    /* ======== KICKOFF LAMBDA ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "carbonlakePipelineDependencyLayer",
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    );

    // Lambda function to process incoming events, generate child node IDs and start the step function
    const kickoffFunction = new lambda.Function(this, "carbonlakePipelineKickoffLambda", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/pipeline_kickoff/')),
      handler: "app.lambda_handler",
      layers: [dependencyLayer],
      environment: {
        STATEMACHINE_ARN: statemachine.stateMachineArn
      }
    });
    statemachine.grantStartExecution(kickoffFunction);

    // Triggering lambda from S3 notification doesn't work with CDK: "Adding this dependency would create a cyclic reference."
    // props.landingBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(kickoffFunction));
    // Solution: A Lambda Custom Resource creates the Lambda Event Notification once the pipeline is created
    // see https://aws.amazon.com/blogs/mt/resolving-circular-dependency-in-provisioning-of-amazon-s3-buckets-with-aws-lambda-event-notifications/
    const applyS3NotificationFunction = new lambda.Function(this, "carbonlakePipelineApplyS3NotificationLambda", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/apply_s3_notification'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash', '-c',
            'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output'
          ],
        }
      }),
      handler: "applyBucketNotification.handler",
    });
    new CustomResource(this, "carbonlakePipelineApplyS3NotificationCustomResource", {
      serviceToken: applyS3NotificationFunction.functionArn,
      properties: {
        "S3Bucket": props.landingBucket.bucketName,
        "FunctionARN": kickoffFunction.functionArn,
        "NotificationId": "S3ObjectCreatedEvent"
      }
    });
    kickoffFunction.addPermission("carbonlakePipelineApplyS3NotificationPermission", {
      principal: new iam.ServicePrincipal("s3.amazonaws.com"),
      action: "lambda:invokeFunction",
      sourceArn: props.landingBucket.bucketArn,
      // sourceAccount is mandatory here
      // S3 bucket ARNs do not contain account IDs, leaving the consumer open to a potential confused deputy attack if 
      // the S3 bucket is deleted or part of a predictable pattern. 
      // Adding an additional condition to explicitly specify the bucket owner's account ID may remediate the issue.
      sourceAccount: this.account
    });
    //Allow the applyS3NotificationFunction to put PutBucketNotification on the bucket
    applyS3NotificationFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [props.landingBucket.bucketArn],
      actions: [ 's3:PutBucketNotification' ],
    }));
  }
}