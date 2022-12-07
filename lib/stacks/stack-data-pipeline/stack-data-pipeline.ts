import { Duration, Stack, StackProps, RemovalPolicy, CfnOutput, Tags } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_dynamodb as ddb } from 'aws-cdk-lib'
import { aws_sns as sns } from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3n from 'aws-cdk-lib/aws-s3-notifications'
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib'
import { aws_stepfunctions as stepfunctions } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'
import { CLQSCalculatorStack } from './construct-calculator/calculator-construct'
import { CLQSStatemachineStack } from './construct-data-pipeline-statemachine/carbonlake-qs-statemachine-stack'
import { CarbonLakeGlueTransformationStack } from './construct-transform/glue/carbonlake-qs-glue-transform-job'
import { CarbonlakeDataQualityStack } from './construct-data-quality/carbonlake-qs-data-quality'

interface DataPipelineProps extends StackProps {
  dataLineageFunction: lambda.Function
  errorBucket: s3.Bucket
  rawBucket: s3.Bucket
  transformedBucket: s3.Bucket
  enrichedBucket: s3.Bucket
  notificationEmailAddress: string
}

export class CLQSDataPipelineStack extends Stack {
  public readonly carbonlakeLandingBucket: s3.Bucket
  public readonly calculatorOutputTable: ddb.Table
  public readonly calculatorFunction: lambda.Function
  public readonly pipelineStateMachine: stepfunctions.StateMachine

  constructor(scope: Construct, id: string, props: DataPipelineProps) {
    super(scope, id, props)

    // Landing bucket where files are dropped by customers
    // Once processed, the files are removed by the pipeline
    this.carbonlakeLandingBucket = new s3.Bucket(this, 'CLQSLandingBucket', {
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
    const { resourcesLambda, resultsLambda } = new CarbonlakeDataQualityStack(this, 'CLQSDataQualityStack', {
      inputBucket: this.carbonlakeLandingBucket,
      outputBucket: props.rawBucket,
      errorBucket: props.errorBucket,
    })

    const dqErrorNotificationSNS = new sns.Topic(this, 'CLQSDataQualityNotification', {})
    const dqEmailSubscription = new subscriptions.EmailSubscription(props.notificationEmailAddress)
    dqErrorNotificationSNS.addSubscription(dqEmailSubscription)

    /* ======== GLUE TRANSFORM ======== */
    // TODO: how should this object be instantiated? Should CarbonLakeGlueTransformationStack return the necessary glue jobs?
    const { glueTransformJobName } = new CarbonLakeGlueTransformationStack(this, 'CLQSGlueTransformationStack', {
      rawBucket: props?.rawBucket,
      transformedBucket: props?.transformedBucket,
    })

    /* ======== POST-GLUE BATCH LAMBDA ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'carbonlakePipelineDependencyLayer',
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    )

    // Lambda function to list total objects in the directory created by AWS Glue
    const batchEnumLambda = new lambda.Function(this, 'CLQSDataPipelineBatchLambda', {
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

    const { calculatorLambda, calculatorOutputTable } = new CLQSCalculatorStack(this, 'CLQSCalculatorStack', {
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
    const { statemachine } = new CLQSStatemachineStack(this, 'CLQSStatemachineStack', {
      dataLineageFunction: props?.dataLineageFunction,
      dqResourcesLambda: resourcesLambda,
      dqResultsLambda: resultsLambda,
      dqErrorNotification: dqErrorNotificationSNS,
      glueTransformJobName: glueTransformJobName,
      batchEnumLambda: batchEnumLambda,
      calculationJob: calculatorLambda,
    })
    this.pipelineStateMachine = statemachine

    /* ======== KICKOFF LAMBDA ======== */

    // Lambda function to process incoming events, generate child node IDs and start the step function
    const kickoffFunction = new lambda.Function(this, 'CLQSKickoffLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/pipeline_kickoff/')),
      handler: 'app.lambda_handler',
      layers: [dependencyLayer],
      environment: {
        LANDING_BUCKET_NAME: this.carbonlakeLandingBucket.bucketName,
        STATEMACHINE_ARN: statemachine.stateMachineArn,
      },
    })
    statemachine.grantStartExecution(kickoffFunction)

    // Invoke kickoff lambda function every time an object is created in the bucket
    this.carbonlakeLandingBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(kickoffFunction)
      // optional: only invoke lambda if object matches the filter
      // {prefix: 'bucket-prefix/', suffix: '.some-extension'},
    )

    // Landing Bucket Name output
    new CfnOutput(this, 'LandingBucketName', {
      value: this.carbonlakeLandingBucket.bucketName,
      description: 'S3 Landing Zone bucket name for data ingestion to CarbonLake Quickstart Data Pipeline',
      exportName: 'LandingBucketName',
    });

    // Landing bucket Url Output
    new CfnOutput(this, 'CLQSLandingBucketUrl', {
      value: this.carbonlakeLandingBucket.bucketWebsiteUrl,
      description: 'S3 Landing Zone bucket URL for data ingestion to CarbonLake Quickstart Data Pipeline',
      exportName: 'CLQSLandingBucketUrl',
    });

    // Output glue data brew link
    new CfnOutput(this, 'CLQSGlueDataBrewURL', {
      value: `https://${this.region}.console.aws.amazon.com/states/home?region=${this.region}`,
      description: 'URL for Glue Data Brew in AWS Console',
      exportName: 'CLQSGlueDataBrewURL',
    });

    // Output link to state machine
    new CfnOutput(this, 'CLQSDataPipelineStateMachineUrl', {
      value: `https://${this.pipelineStateMachine.env.region}.console.aws.amazon.com/states/home?region=${this.pipelineStateMachine.env.region}#/statemachines/view/${this.pipelineStateMachine.stateMachineArn}`,
      description: 'URL to open CLQS State machine to view step functions workflow status',
      exportName: 'CLQSDataPipelineStateMachineUrl',

    }); 

    Tags.of(this).add("component", "dataPipeline");
  }
}
