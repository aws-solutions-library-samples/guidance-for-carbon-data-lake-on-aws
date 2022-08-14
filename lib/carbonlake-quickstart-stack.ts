import * as cdk from 'aws-cdk-lib'
import { CLQSApiStack } from './stacks/stack-api/carbonlake-api-stack'
import { CLQSPipelineStack } from './stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack'
import { CLQSDataLineageStack } from './stacks/stack-data-lineage/carbonlake-data-lineage-stack'
import { CLQSSharedResourcesStack } from './stacks/stack-shared-resources/carbonlake-qs-shared-resources-stack'
import { CarbonLakeDataCompactionPipelineStack } from './stacks/stack-data-compaction/carbonlake-qs-data-compaction-pipeline'
import { CfnOutput } from 'aws-cdk-lib'
import { CarbonlakeQuicksightStack } from './stacks/stack-quicksight/carbonlake-qs-quicksight'
import { CarbonlakeForecastStack } from './stacks/stack-sagemaker-notebook/carbonlake-qs-forecast'
import { Construct } from 'constructs'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_stepfunctions as stepfunctions } from 'aws-cdk-lib'
import { pipeline } from 'stream'

export class CLQSStack extends cdk.Stack {
  public readonly calculatorFunction: lambda.Function
  public readonly landingBucket: s3.Bucket
  public readonly transformedBucket: s3.Bucket
  public readonly enrichedBucket: s3.Bucket
  public readonly pipelineStateMachine: stepfunctions.StateMachine
  public readonly calculatorOutputTable: dynamodb.Table

  constructor(scope: Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props)

    const adminEmail = this.node.tryGetContext('adminEmail')
    if (!adminEmail) {
      console.warn('****************************************************************')
      console.warn('*** WARNING: If you will be deploying CarbonLakeApiStack     ***')
      console.warn('*** or CarbonlakeQuicksightStack, you must provide a         ***')
      console.warn('*** valid admin email address via --context adminEmail=value ***')
      console.warn('****************************************************************')
    } else {
      new CfnOutput(this, 'adminEmail', { value: adminEmail })
    }

    const quicksightUserName = this.node.tryGetContext('quicksightUserName')
    if (!quicksightUserName) {
      console.warn('********************************************************************')
      console.warn('*** WARNING: If you will be deploying CarbonlakeQuicksightStack, ***')
      console.warn('*** you must provide a valid admin email address                 ***')
      console.warn('*** via --context quicksightUserName=value                       ***')
      console.warn('********************************************************************')
    } else {
      new CfnOutput(this, 'quicksightUserName', { value: quicksightUserName })
    }

    // QS1 --> Create the carbonlake shared resource stack
    const sharedResources = new CLQSSharedResourcesStack(scope, 'CarbonlakeSharedResourceStack')
    this.enrichedBucket = sharedResources.carbonlakeEnrichedBucket
    this.transformedBucket = sharedResources.carbonlakeTransformedBucket

    // QS2 --> Create the carbonlake data lineage stack
    const dataLineage = new CLQSDataLineageStack(scope, 'CarbonlakeDataLineageStack', {
      archiveBucket: sharedResources.carbonlakeDataLineageBucket,
    })

    // QS3 --> Create the carbonlake data pipeline stack
    // carbonlake orchestration pipeline stack - Amazon Step Functions
    // TODO: As there are created, need to add the sfn components to the pipeline stack
    const pipeline = new CLQSPipelineStack(scope, 'CarbonlakePipelineStack', {
      dataLineageFunction: dataLineage.inputFunction,
      errorBucket: sharedResources.carbonlakeErrorBucket,
      rawBucket: sharedResources.carbonlakeRawBucket,
      transformedBucket: sharedResources.carbonlakeTransformedBucket,
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
      notificationEmailAddress: adminEmail,
    })
    this.landingBucket = pipeline.carbonlakeLandingBucket
    this.calculatorFunction = pipeline.calculatorFunction
    this.pipelineStateMachine = pipeline.pipelineStateMachine
    this.calculatorOutputTable = pipeline.calculatorOutputTable

    //pipeline.node.addDependency(sharedResources);

    //const dataPipeline = new CarbonDataPipelineStack(app, "CarbonlakeDataPipelineStack");

    // QS4 --> Create the carbonlake data compaction pipeline stack
    const dataCompactionPipeline = new CarbonLakeDataCompactionPipelineStack(
      scope,
      'CarbonlakeDataCompactionPipelineStack',
      {
        enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
        enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
        dataLineageTraceQueue: dataLineage.traceQueue,
      }
    ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

    // QS5 --> Create the carbonlake api stack
    const api = new CLQSApiStack(scope, 'CarbonLakeApiStack', {
      adminEmail: adminEmail,
      calculatorOutputTableRef: pipeline.calculatorOutputTable,
    })

    // QS6 --> Create the carbonlake quicksight stack
    /* commenting quicksight stack out for test
    const quicksight = new CarbonlakeQuicksightStack(scope, 'CarbonlakeQuicksightStack', {
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
      quicksightUserName: quicksightUserName,
      enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
    })
    */
    // QS7 --> Create the carbonlake forecast stack
    //commenting out for test
    //const forecast = new CarbonlakeForecastStack(scope, 'CarbonlakeForecastStack')

    // QS7 --> Create the carbonlake forecast stack
    // to enable this stack uncomment the next line
    //const forecast = new CarbonlakeForecastStack(scope, 'CarbonlakeForecastStack')
  }
}
