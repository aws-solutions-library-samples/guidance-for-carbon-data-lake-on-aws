import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Aspects, Stage, StageProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { AwsSolutionsChecks } from 'cdk-nag'
import { CLQSApiStack } from '../../stack-api/carbonlake-api-stack';
import { CLQSCompactionStack } from '../../stack-data-compaction/carbonlake-qs-data-compaction-pipeline';
import { CLQSDataLineageStack } from '../../stack-data-lineage/carbonlake-data-lineage-stack';
import { CLQSDataPipelineStack } from '../../stack-data-pipeline/carbonlake-qs-pipeline-stack';
import { CLQSSageMakerNotebookStack } from '../../stack-sagemaker-notebook/carbonlake-qs-sagemaker-notebook';
import { CLQSSharedResourcesStack } from '../../stack-shared-resources/carbonlake-qs-shared-resources-stack';
import { CLQSTestStack } from '../../stack-tests/clqs-test';
import { CLQSQuicksightStack } from '../../stack-quicksight/carbonlake-qs-quicksight'

export class CLQSPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)



    const thisEnv = {
      region: this.node.tryGetContext('awsRegion')? this.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT
    };
    
    const adminEmail = this.node.tryGetContext('adminEmail')
        
    if (!adminEmail) {
          console.warn('****************************************************************')
          console.warn('*** WARNING: You must provide a valid adminEmail address     ***')
          console.warn('*** you can do this via cdk.context.json                     ***')
          console.warn('***              -- OR --                                    ***')
          console.warn('*** via --context adminEmail=value                           ***')
          console.warn('****************************************************************')
        }
    
    // QS1 --> Create the carbonlake shared resource stack
    const sharedResources = new CLQSSharedResourcesStack(this, 'SharedResources', {env: thisEnv});
    const enrichedBucket = sharedResources.carbonlakeEnrichedBucket
    const transformedBucket = sharedResources.carbonlakeTransformedBucket
    
    // QS2 --> Create the carbonlake data lineage stack
      const dataLineage = new CLQSDataLineageStack(this, 'LineageStack', {
        archiveBucket: sharedResources.carbonlakeDataLineageBucket,
        env: thisEnv
      })
    
    // QS3 --> Create the carbonlake data pipeline stack
    // carbonlake orchestration pipeline stack - Amazon Step Functions
      const dataPipeline = new CLQSDataPipelineStack(this, 'DataPipelineStack', {
        dataLineageFunction: dataLineage.inputFunction,
        errorBucket: sharedResources.carbonlakeErrorBucket,
        rawBucket: sharedResources.carbonlakeRawBucket,
        transformedBucket: sharedResources.carbonlakeTransformedBucket,
        enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
        notificationEmailAddress: adminEmail,
        env: thisEnv
      })
    
        const landingBucket = dataPipeline.carbonlakeLandingBucket
        const calculatorFunction = dataPipeline.calculatorFunction
        const pipelineStateMachine = dataPipeline.pipelineStateMachine
        const calculatorOutputTable = dataPipeline.calculatorOutputTable
    
    // QS4 --> Create the carbonlake data compaction pipeline stack
    new CLQSCompactionStack(this,'CompactionStack',
          {
            enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
            enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
            dataLineageTraceQueue: dataLineage.traceQueue,
            env: thisEnv
          }
        ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight
    
    // QS5 --> Create the carbonlake api stack
    new CLQSApiStack (this, 'ApiStack', {
          adminEmail: adminEmail,
          calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
          env: thisEnv
        })
    
    // QS6 --> Create the carbonlake quicksight stack
    // commenting quicksight stack out for test
    const quicksightOption = this.node.tryGetContext('deployQuicksightStack')
    console.log(`Quicksight deployment option is set to: ${quicksightOption}`)
    if (quicksightOption === true) {
    
        const quicksightUsername = this.node.tryGetContext('quicksightUserName')
        if (!quicksightUsername) {
          console.warn('********************************************************************')
          console.warn('*** WARNING: If you will be deploying CarbonlakeQuicksightStack, ***')
          console.warn('*** you must provide a valid admin email address                 ***')
          console.warn('*** you can do this via cdk.context.json                         ***')
          console.warn('***              -- OR --                                        ***')
          console.warn('*** via --context quicksightUserName=value                       ***')
          console.warn('********************************************************************')
        }
    
    new CLQSQuicksightStack(this, 'QuicksightStack', {
        enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
        quicksightUsername: quicksightUsername,
        enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
        env: thisEnv
      })
    }
    
    // QS7 --> Create the carbonlake forecast stack
    const sagemakerOption = this.node.tryGetContext('deploySagemakerStack')
    console.log(`Sagemaker deployment option is set to: ${sagemakerOption}`)
        if (sagemakerOption === true) {
      new CLQSSageMakerNotebookStack(this, 'SageMakerNotebookStack', {
          env: thisEnv
        });
    
        cdk.Tags.of(this).add("thislication", "carbonlake");
        }
        
    
    // Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
    const nag = this.node.tryGetContext('nag')
    
    /*
        Description: Checks if context variable nag=true and 
        thislies cdk nag if it is added to the this synth contex
        Inputs: Optionally accepts cdk synth --context nag=true to thisly cdk-nag packs
        Outputs: Outputs cdk-nag verbose logging and throws errors if violations met
        AWS Services: cdk, cdk-nag package
    */
    
    if (nag == "true"){
        Aspects.of(this).add(new AwsSolutionsChecks({ verbose: true }))
    }
    
    
    new CLQSTestStack(this, 'CLQSTest', {
      calculatorFunction: calculatorFunction,
      landingBucket: landingBucket,
      enrichedBucket: enrichedBucket,
      transformedBucket: transformedBucket,
      pipelineStateMachine: pipelineStateMachine,
      calculatorOutputTable: calculatorOutputTable,
      env: thisEnv
    })
    
  }
}
