import * as cdk from 'aws-cdk-lib';
import { CarbonLakeQuickStartApiStack } from './api/carbonlake-api-stack';
import { CarbonlakeQuickstartCalculatorStack } from './pipeline/calculator/carbonlake-qs-calculator';
import { CarbonlakeQuickstartPipelineStack } from './pipeline/carbonlake-qs-pipeline-stack';
import { CarbonlakeQuickstartDataLineageStack } from './data-lineage/carbonlake-data-lineage-stack';
import { CarbonlakeQuickstartSharedResourcesStack } from './shared-resources/carbonlake-qs-shared-resources-stack';
import { CarbonLakeDataCompactionPipelineStack } from './data-compaction-pipeline/carbonlake-qs-data-compaction-pipeline';

export class CarbonlakeQuickstartStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // QS1 --> Create the carbonlake shared resource stack
    const sharedResources = new CarbonlakeQuickstartSharedResourcesStack(scope, "CarbonlakeSharedResourceStack");
    
    // QS2 --> Create the carbonlake data lineage stack
    const dataLineage = new CarbonlakeQuickstartDataLineageStack(scope, "CarbonlakeDataLineageStack");

    // QS3 --> Create the carbonlake data pipeline stack
    //const dataPipeline = new CarbonDataPipelineStack(app, "CarbonlakeDataPipelineStack");
    const dataCompactionPipeline = new CarbonLakeDataCompactionPipelineStack(scope, "CarbonLakeDataCompactionPipelineStack", {
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket
    }); //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight
    

    // QS4 --> Create the carbonlake calculator stack
    const calculator = new CarbonlakeQuickstartCalculatorStack(scope, "CarbonlakeCalculatorStack", {
      transformedBucket: sharedResources.carbonlakeTransformedBucket,
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket
    });

    // QS5 --> Create the carbonlake quicksight stack
    //const quicksight = new CarbonlakeQuicksightStack(app, "CarbonlakeQuicksightStack");

    // QS7 --> Create the carbonlake web stack
    const api = new CarbonLakeQuickStartApiStack(scope, "CarbonLakeApiStack", {
      calculatorOutputTableRef: calculator.calculatorOutputTable
    });

    // QS8 --> Create the carbonlake forecast stack
    //const forecast = new CarbonlakeForecastStack(app, "CarbonlakeForecastStack");

    // TODO --> Creat the carbonlake monitoring and observability stack

    // carbonlake orchestration pipeline stack - Amazon Step Functions
    // TODO: As there are created, need to add the sfn components to the pipeline stack
    const pipeline = new CarbonlakeQuickstartPipelineStack(scope, "CarbonlakePipelineStack", {
      transformBucket: sharedResources.carbonlakeTransformedBucket,
      dataLineageFunction: dataLineage.inputFunction,
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket,
      rawBucket: sharedResources.carbonlakeRawBucket,
      uniqueDirectory: 'test-unique-directory'
    });
    
  }
}
