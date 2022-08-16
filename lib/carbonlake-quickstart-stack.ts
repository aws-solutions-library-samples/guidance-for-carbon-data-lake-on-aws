import * as cdk from 'aws-cdk-lib'
import { CLQSApiStack } from './stacks/stack-api/carbonlake-api-stack'
import { CLQSDataPipelineStack } from './stacks/stack-data-pipeline/carbonlake-qs-pipeline-stack'
import { CLQSDataLineageStack } from './stacks/stack-data-lineage/carbonlake-data-lineage-stack'
import { CLQSSharedResourcesStack } from './stacks/stack-shared-resources/carbonlake-qs-shared-resources-stack'
import { CLQSCompactionStack } from './stacks/stack-data-compaction/carbonlake-qs-data-compaction-pipeline'
import { CfnOutput } from 'aws-cdk-lib'
import { CLQSQuicksightStack } from './stacks/stack-quicksight/carbonlake-qs-quicksight'
import { CLQSSageMakerNotebookStack } from './stacks/stack-sagemaker-notebook/carbonlake-qs-sagemaker-notebook'
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
  public readonly sharedResources: CLQSSharedResourcesStack
  public readonly dataLineage: CLQSDataLineageStack
  public readonly dataPipeline: CLQSDataPipelineStack
  public readonly dataCompactionPipeline: CLQSCompactionStack
  public readonly api: CLQSApiStack
  public readonly quicksight: CLQSQuicksightStack
  public readonly forecast: CLQSSageMakerNotebookStack
  public contextOutput: object

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
    this.sharedResources = new CLQSSharedResourcesStack(this, 'SharedResources')
    this.enrichedBucket = this.sharedResources.carbonlakeEnrichedBucket
    this.transformedBucket = this.sharedResources.carbonlakeTransformedBucket

    // QS2 --> Create the carbonlake data lineage stack
    this.dataLineage = new CLQSDataLineageStack(this, 'LineageStack', {
      archiveBucket: this.sharedResources.carbonlakeDataLineageBucket,
    })

    // QS3 --> Create the carbonlake data pipeline stack
    // carbonlake orchestration pipeline stack - Amazon Step Functions
    // TODO: As there are created, need to add the sfn components to the pipeline stack
    this.dataPipeline = new CLQSDataPipelineStack(this, 'DataPipelineStack', {
      dataLineageFunction: this.dataLineage.inputFunction,
      errorBucket: this.sharedResources.carbonlakeErrorBucket,
      rawBucket: this.sharedResources.carbonlakeRawBucket,
      transformedBucket: this.sharedResources.carbonlakeTransformedBucket,
      enrichedBucket: this.sharedResources.carbonlakeEnrichedBucket,
      notificationEmailAddress: adminEmail,
    })
    this.landingBucket = this.dataPipeline.carbonlakeLandingBucket
    this.calculatorFunction = this.dataPipeline.calculatorFunction
    this.pipelineStateMachine = this.dataPipeline.pipelineStateMachine
    this.calculatorOutputTable = this.dataPipeline.calculatorOutputTable

    // QS4 --> Create the carbonlake data compaction pipeline stack
    this.dataCompactionPipeline = new CLQSCompactionStack(
      this,
      'CompactionStack',
      {
        enrichedBucket: this.sharedResources.carbonlakeEnrichedBucket,
        enrichedDataDatabase: this.sharedResources.glueEnrichedDataDatabase,
        dataLineageTraceQueue: this.dataLineage.traceQueue,
      }
    ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

    // QS5 --> Create the carbonlake api stack
    this.api = new CLQSApiStack(this, 'ApiStack', {
      adminEmail: adminEmail,
      calculatorOutputTableRef: this.dataPipeline.calculatorOutputTable,
    })

    // QS6 --> Create the carbonlake quicksight stack
    /* commenting quicksight stack out for test
    this.quicksight = new CLQSQuicksightStack(this, 'QuicksightStack', {
      enrichedBucket: this.sharedResources.carbonlakeEnrichedBucket,
      quicksightUserName: quicksightUserName,
      enrichedDataDatabase: this.sharedResources.glueEnrichedDataDatabase,
    })
    */
    // QS7 --> Create the carbonlake forecast stack
    //commenting out for test
    this.forecast = new CLQSSageMakerNotebookStack(this, 'SageMakerNotebookStack');
    
    /* commenting quicksight stack out for test

    // Output Landing Bucket
    const contextLandingBucket = new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });


    // Output glue data brew link
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    }); 

    // Output link to state machine
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',

    }); 

    // Output API Endpoint
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });

    // Output API Username
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });

    // Output API Password
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });

    // Output Appsync Query Link
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });
    
    // Output link to quicksight
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });

    // Output link to forecast stack
    new cdk.CfnOutput(this, 'insert', {
      value: "insert",
      description: 'insert',
      exportName: 'insert',
    });
  
    */
  }
}
