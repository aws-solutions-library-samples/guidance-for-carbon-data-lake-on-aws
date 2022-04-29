import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_dynamodb as ddb } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
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
        // TRANSFORM_BUCKET_NAME: props.transformBucket.bucketName,
        TRANSFORM_BUCKET_NAME: props.transformedBucket.bucketName,
        STATEMACHINE_ARN: statemachine.stateMachineArn
      }
    });

    // TODO: Need to add event source for the kickoffFunction (S3 PUT Event???)

    statemachine.grantStartExecution(kickoffFunction);
  }
}