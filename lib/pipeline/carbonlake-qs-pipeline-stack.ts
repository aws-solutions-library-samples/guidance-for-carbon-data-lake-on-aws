import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as path from 'path';

import { CarbonlakeQuickstartStatemachineStack } from './statemachine/carbonlake-qs-statemachine-stack';

interface PipelineProps extends StackProps {
  dataLineageFunction: lambda.Function
  transformBucket: s3.Bucket
}

export class CarbonlakeQuickstartPipelineStack extends Stack {
  constructor(scope: App, id: string, props: PipelineProps) {
    super(scope, id, props);

    /* ======== DATA QUALITY ======== */

    /* ======== GLUE TRANSFORM ======== */

    /* ======== CALCULATION ======== */

    /* ======== STATEMACHINE ======== */

    // Required inputs for the step function
    //  - data lineage lambda function
    //  - dq quality workflow
    //  - glue transformation job
    //  - calculation function
    const { statemachine } = new CarbonlakeQuickstartStatemachineStack(this, 'carbonlakeQuickstartStatemachineStack', {
      dataLineageFunction: props?.dataLineageFunction,
      dataQualityJob: null,
      glueTransformJob: null,
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
        // TRANSFORM_BUCKET_NAME: props.transformBucket.bucketName,
        TRANSFORM_BUCKET_NAME: props.transformBucket.bucketName,
        STATEMACHINE_ARN: statemachine.stateMachineArn
      }
    });

    // TODO: Need to add event source for the kickoffFunction (S3 PUT Event???)

    statemachine.grantStartExecution(kickoffFunction);
  }
}