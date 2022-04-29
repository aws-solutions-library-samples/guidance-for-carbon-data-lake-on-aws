import * as cdk from 'aws-cdk-lib';
import { CarbonLakeQuickStartApiStack } from './api/carbonlake-api-stack';
import { CarbonlakeQuickstartCalculatorStack } from './pipeline/calculator/carbonlake-qs-calculator';
import { CarbonlakeQuickstartPipelineStack } from './pipeline/carbonlake-qs-pipeline-stack';
import { CarbonlakeQuickstartDataLineageStack } from './data-lineage/carbonlake-data-lineage-stack';
import { CarbonlakeQuickstartSharedResourcesStack } from './shared-resources/carbonlake-qs-shared-resources-stack';
import { CarbonLakeAnalyticsPipelineStack } from './pipeline/analytics/analytics-pipeline/carbonlake-qs-analytics-pipeline-s';
import { CarbonLakeGlueTransformationStack } from './pipeline/transform/glue/carbonlake-qs-glue-transform-job';

export class CarbonlakeQuickstartStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // QS1 --> Create the carbonlake shared resource stack
    const sharedResources = new CarbonlakeQuickstartSharedResourcesStack(scope, "CarbonlakeSharedResourceStack");
    
    // QS2 --> Create the carbonlake data lineage stack
    const dataLineage = new CarbonlakeQuickstartDataLineageStack(scope, "CarbonlakeDataLineageStack");

    // QS3 --> Create the carbonlake data pipeline stack
    // carbonlake orchestration pipeline stack - Amazon Step Functions
    // TODO: As there are created, need to add the sfn components to the pipeline stack
    const pipeline = new CarbonlakeQuickstartPipelineStack(scope, "CarbonlakePipelineStack", {
      dataLineageFunction: dataLineage.inputFunction,
      transformedBucket: sharedResources.carbonlakeTransformedBucket,
      enrichedBucket: sharedResources.carbonlakeEnrichedBucket
    });
  
    //const dataPipeline = new CarbonDataPipelineStack(app, "CarbonlakeDataPipelineStack");
    const analyticsPipeline = new CarbonLakeAnalyticsPipelineStack(scope, "CarbonLakeAnalyticsPipelineStack", {
      //glueScriptsBucketName: "cl-148257099368-glue-scripts"
    }); //placeholder to test deploying analytics pipeline stack: contains glue jobs that run daily at midnight
    const glueTransformJob = new CarbonLakeGlueTransformationStack(scope, "CarbonLakeGlueTransformationStack", {});

    // QS4 --> Create the carbonlake calculator stack
    // const calculator = new CarbonlakeQuickstartCalculatorStack(scope, "CarbonlakeCalculatorStack", {
    //   transformedBucket: sharedResources.carbonlakeTransformedBucket,
    //   enrichedBucket: sharedResources.carbonlakeEnrichedBucket
    // });

    // QS5 --> Create the carbonlake quicksight stack
    //const quicksight = new CarbonlakeQuicksightStack(app, "CarbonlakeQuicksightStack");

    // QS7 --> Create the carbonlake web stack
    const api = new CarbonLakeQuickStartApiStack(scope, "CarbonLakeApiStack", {
      calculatorOutputTableRef: pipeline.calculatorOutputTable
    });

    // QS8 --> Create the carbonlake forecast stack
    //const forecast = new CarbonlakeForecastStack(app, "CarbonlakeForecastStack");

    // TODO --> Creat the carbonlake monitoring and observability stack
    
  }
}
