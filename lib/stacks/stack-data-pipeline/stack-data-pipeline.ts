import { Duration, Stack, StackProps, RemovalPolicy, CfnOutput, Tags } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_dynamodb as ddb } from 'aws-cdk-lib'
import { aws_sns as sns } from 'aws-cdk-lib'
import { aws_kms as kms } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { aws_stepfunctions as stepfunctions } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'
import { Calculator } from './construct-calculator/construct-calculator'
import { DataPipelineStatemachine } from './construct-data-pipeline-statemachine/construct-data-pipeline-statemachine'
import { GlueTransformation } from './construct-transform/glue/construct-glue-transform-job'
import { DataQuality } from './construct-data-quality/construct-data-quality'
import { CdlS3 } from '../../constructs/construct-cdl-s3-bucket/construct-cdl-s3-bucket'
import { CdlPythonLambda } from '../../constructs/construct-cdl-python-lambda-function/construct-cdl-python-lambda-function'
import { NagSuppressions } from 'cdk-nag/lib/nag-suppressions'

interface DataPipelineProps extends StackProps {
  dataLineageFunction: lambda.Function
  errorBucket: s3.Bucket
  rawBucket: s3.Bucket
  transformedBucket: s3.Bucket
  enrichedBucket: s3.Bucket
  notificationEmailAddress: string
}

export class DataPipelineStack extends Stack {
  public readonly cdlLandingBucket: s3.Bucket
  public readonly calculatorOutputTable: ddb.Table
  public readonly calculatorFunction: lambda.Function
  public readonly pipelineStateMachine: stepfunctions.StateMachine

  constructor(scope: Construct, id: string, props: DataPipelineProps) {
    super(scope, id, props)

    // Landing bucket where files are dropped by customers
    // Once processed, the files are removed by the pipeline
    this.cdlLandingBucket = new CdlS3(this, 'LandingBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          exposedHeaders: ['x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2', 'ETag'],
          maxAge: 3000,
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    })

    /* ======== DATA QUALITY ======== */
    const { resourcesLambda, resultsLambda } = new DataQuality(this, 'CDLDataQuality', {
      inputBucket: this.cdlLandingBucket,
      outputBucket: props.rawBucket,
      errorBucket: props.errorBucket,
    })

    const dqErrorNotificationSnsKey = new kms.Key(this, 'dqErrorNotificationSnsKey', {
      enableKeyRotation: true,
    })

    const dqErrorNotificationSNS = new sns.Topic(this, 'CDLDataQualityNotification', {
      masterKey: dqErrorNotificationSnsKey
    })

    NagSuppressions.addResourceSuppressions(dqErrorNotificationSNS, [
      { 
        id: 'AwsSolutions-SNS3', 
        reason: 'SSL is not available on L2 construct.' },
    ]);


    const dqEmailSubscription = new subscriptions.EmailSubscription(props.notificationEmailAddress)
    dqErrorNotificationSNS.addSubscription(dqEmailSubscription)

    /* ======== GLUE TRANSFORM ======== */
    const { glueTransformJobName } = new GlueTransformation(this, 'CDLGlueTransformation', {
      rawBucket: props?.rawBucket,
      transformedBucket: props?.transformedBucket,
    })

    /* ======== POST-GLUE BATCH LAMBDA ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'cdlPipelineDependencyLayer',
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    )

    // Lambda function to list total objects in the directory created by AWS Glue
    const batchEnumLambda = new CdlPythonLambda(this, 'CDLDataPipelineBatchLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/batch_enum_lambda/')),
      handler: 'app.lambda_handler',
      layers: [dependencyLayer],
      timeout: Duration.seconds(60),
      environment: {
        TRANSFORMED_BUCKET_NAME: props.transformedBucket.bucketName,
      },
    })

    props.transformedBucket.grantRead(batchEnumLambda)

    /* ======== CALCULATION ======== */

    const { calculatorLambda, calculatorOutputTable } = new Calculator(this, 'CDLCalculator', {
      transformedBucket: props.transformedBucket,
      enrichedBucket: props.enrichedBucket,
    })
    this.calculatorOutputTable = calculatorOutputTable
    this.calculatorFunction = calculatorLambda

    /* ======== STATEMACHINE ======== */

    // Required inputs for the step function
    //  - data lineage lambda function
    //  - dq quality workflow
    //  - glue transformation job
    //  - calculation function
    const { statemachine } = new DataPipelineStatemachine(this, 'CDLStatemachine', {
      dataLineageFunction: props?.dataLineageFunction,
      dqResourcesLambda: resourcesLambda,
      dqResultsLambda: resultsLambda,
      dqErrorNotification: dqErrorNotificationSNS,
      glueTransformJobName: glueTransformJobName,
      batchEnumLambda: batchEnumLambda,
      calculationJob: calculatorLambda,
    })
    this.pipelineStateMachine = statemachine

    dqErrorNotificationSnsKey.grantEncryptDecrypt(resultsLambda)
    
    dqErrorNotificationSnsKey.grantEncryptDecrypt(this.pipelineStateMachine)

    /* ======== KICKOFF LAMBDA ======== */

    // Lambda function to process incoming events, generate child node IDs and start the step function
    const kickoffFunction = new CdlPythonLambda(this, 'CDLKickoffLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/pipeline_kickoff/')),
      handler: 'app.lambda_handler',
      layers: [dependencyLayer],
      environment: {
        LANDING_BUCKET_NAME: this.cdlLandingBucket.bucketName,
        STATEMACHINE_ARN: statemachine.stateMachineArn,
      },
    })
    statemachine.grantStartExecution(kickoffFunction)

    // Invoke kickoff lambda function every time an object is created in the bucket
    this.cdlLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(kickoffFunction)
      // optional: only invoke lambda if object matches the filter
      // {prefix: 'bucket-prefix/', suffix: '.some-extension'},
    )

    // Landing Bucket Name output
    new CfnOutput(this, 'LandingBucketName', {
      value: this.cdlLandingBucket.bucketName,
      description: 'S3 Landing Zone bucket name for data ingestion to cdl Quickstart Data Pipeline',
      exportName: 'LandingBucketName',
    });

    // Landing bucket Url Output
    new CfnOutput(this, 'CDLLandingBucketUrl', {
      value: this.cdlLandingBucket.bucketWebsiteUrl,
      description: 'S3 Landing Zone bucket URL for data ingestion to cdl Quickstart Data Pipeline',
      exportName: 'CDLLandingBucketUrl',
    });

    // Output glue data brew link
    new CfnOutput(this, 'CDLGlueDataBrewURL', {
      value: `https://${this.region}.console.aws.amazon.com/states/home?region=${this.region}`,
      description: 'URL for Glue Data Brew in AWS Console',
      exportName: 'CDLGlueDataBrewURL',
    });

    // Output link to state machine
    new CfnOutput(this, 'CDLDataPipelineStateMachineUrl', {
      value: `https://${this.pipelineStateMachine.env.region}.console.aws.amazon.com/states/home?region=${this.pipelineStateMachine.env.region}#/statemachines/view/${this.pipelineStateMachine.stateMachineArn}`,
      description: 'URL to open CDL State machine to view step functions workflow status',
      exportName: 'CDLDataPipelineStateMachineUrl',

    }); 

    Tags.of(this).add("component", "dataPipeline");
  }
}
