import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Aspects, Stage, StageProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { TestStack } from '../../stack-tests/stack-tests'
import { QuicksightStack } from '../../stack-quicksight/stack-quicksight'
import { SharedResourcesStack } from '../../stack-shared-resources/stack-shared-resources'
import { DataLineageStack } from '../../stack-data-lineage/stack-data-lineage'
import { DataCompactionStack } from "../../stack-data-compaction/stack-data-compaction"
import { DataPipelineStack } from '../../stack-data-pipeline/stack-data-pipeline';
import { ApiStack } from '../../stack-api/stack-api'
import { SageMakerNotebookStack } from '../../stack-sagemaker-notebook/stack-sagemaker-notebook'
import { WebStack } from '../../stack-web/stack-web'
import { checkAdminEmailSetup, checkQuicksightSetup } from '../../../../resources/setup-checks/setupCheck'

export class PipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)

    const thisEnv = {
      region: this.node.tryGetContext('awsRegion')? this.node.tryGetContext('awsRegion') : process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT
    };
    
    const adminEmail = this.node.tryGetContext('adminEmail')
    
    checkAdminEmailSetup(adminEmail);

    // QS1 --> Create the cdl shared resource stack
    const sharedResources = new SharedResourcesStack(this, 'SharedResources', {env: thisEnv});
    const enrichedBucket = sharedResources.cdlEnrichedBucket
    const transformedBucket = sharedResources.cdlTransformedBucket

    // QS2 --> Create the cdl data lineage stack
      const dataLineage = new DataLineageStack(this, 'LineageStack', {
        archiveBucket: sharedResources.cdlDataLineageBucket,
        env: thisEnv
      })

    // QS3 --> Create the cdl data pipeline stack
    // cdl orchestration pipeline stack - Amazon Step Functions
      const dataPipeline = new DataPipelineStack(this, 'DataPipelineStack', {
        dataLineageFunction: dataLineage.inputFunction,
        errorBucket: sharedResources.cdlErrorBucket,
        rawBucket: sharedResources.cdlRawBucket,
        transformedBucket: sharedResources.cdlTransformedBucket,
        enrichedBucket: sharedResources.cdlEnrichedBucket,
        notificationEmailAddress: adminEmail,
        env: thisEnv
      })

        const landingBucket = dataPipeline.cdlLandingBucket
        const calculatorFunction = dataPipeline.calculatorFunction
        const pipelineStateMachine = dataPipeline.pipelineStateMachine
        const calculatorOutputTable = dataPipeline.calculatorOutputTable

    // QS4 --> Create the cdl data compaction pipeline stack
    new DataCompactionStack(this,'DataCompactionStack',
          {
            enrichedBucket: sharedResources.cdlEnrichedBucket,
            enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
            dataLineageTraceQueue: dataLineage.traceQueue,
            env: thisEnv
          }
        ) //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight

    // QS5 --> Create the cdl api stack
    const apiStack = new ApiStack (this, 'ApiStack', {
          adminEmail: adminEmail,
          calculatorOutputTableRef: dataPipeline.calculatorOutputTable,
          env: thisEnv
        })

    // QS6 --> Create the cdl quicksight stack
    const quicksightOption = this.node.tryGetContext('deployQuicksightStack')
    console.log(`Quicksight deployment option is set to: ${quicksightOption}`)
    if (quicksightOption === true) {

        const quicksightUsername = this.node.tryGetContext('quicksightUserName')
        checkQuicksightSetup(quicksightUsername);

      new QuicksightStack(this, 'QuicksightStack', {
        enrichedBucket: sharedResources.cdlEnrichedBucket,
        quicksightUsername: quicksightUsername,
        enrichedDataDatabase: sharedResources.glueEnrichedDataDatabase,
        env: thisEnv
      })
    }

    // QS7 --> Create the cdl forecast stack
    const sagemakerOption = this.node.tryGetContext('deploySagemakerStack')
    console.log(`Sagemaker deployment option is set to: ${sagemakerOption}`)
        if (sagemakerOption === true) {
      new SageMakerNotebookStack(this, 'SageMakerNotebookStack', {
          env: thisEnv
        });
        }

    // QS7 --> Create the cdl forecast stack
    const webOption = this.node.tryGetContext('deployWebStack')
    console.log(`Web deployment option is set to: ${webOption}`)
        if (webOption === true) {

        new WebStack(this, 'WebStack', {
          env: thisEnv,
          apiId: apiStack.apiId,
          graphqlUrl: apiStack.graphqlUrl,
          identityPoolId: apiStack.identityPoolIdOutputId.value,
          userPoolId: apiStack.userPoolIdOutput.value,
          userPoolWebClientId: apiStack.userPoolClientIdOutput.value,
          landingBucketName: dataPipeline.cdlLandingBucket.bucketName
        })
        }

    cdk.Tags.of(this).add("application", "carbon-data-lake");

    // Add the cdk-nag AwsSolutions Pack with extra verbose logging enabled.
    //const nag = app.node.tryGetContext('nag')

    /*
        Description: Checks if context variable nag=true and 
        applies cdk nag if it is added to the app synth contex
        Inputs: Optionally accepts cdk synth --context nag=true to apply cdk-nag packs
        Outputs: Outputs cdk-nag verbose logging and throws errors if violations met
        AWS Services: cdk, cdk-nag package
    */

    //if (nag == "true"){
        //Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))
    //}


    new TestStack(this, 'TestStack', {
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
