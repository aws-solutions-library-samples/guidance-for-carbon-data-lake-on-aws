import * as cdk from 'aws-cdk-lib';
import { CarbonLakeQuickStartApiStack } from './api/carbonlake-api-stack';
import { CarbonlakeQuickstartCalculatorStack } from './pipeline/calculator/carbonlake-quickstart-calculator';
import { CarbonlakeQuickstartPipelineStack } from './pipeline/carbonlake-qs-pipeline-stack';
import { CarbonlakeQuickstartStorageStack } from './pipeline/storage/carbonlake-qs-storage-stack';
import { CarbonlakeQuickstartDataLineageStack } from './data-lineage/carbonlake-data-lineage-stack';


export class CarbonlakeQuickstartStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app = new cdk.App();

    // TODO --> Create the carbonlake storage stack
    const storage = new CarbonlakeQuickstartStorageStack(app, "CarbonlakeQuickstartStorageStack");

    // Create the carbonlake calculator stack
    const calculator = new CarbonlakeQuickstartCalculatorStack(app, "CarbonlakeQuickStartCalculatorStack");
    
    // Create the carbonlake API stack
    const api = new CarbonLakeQuickStartApiStack(app, "CarbonLakeQuickStartApiStack", {
      calculatorOutputTableRef: calculator.calculatorOutputTable
    });

    // TODO --> Create the carbonlake etl-pipeline stack

    // TODO --> Create the carbonlake web stack

    // TODO --> Create the carbonlake grafana stack

    // TODO --> Create the carbonlake quickstart stack

    // TODO --> Create the carbonlake data lineage stack
    const dataLineage = new CarbonlakeQuickstartDataLineageStack(app, "CarbonlakeQuickstartDataLineageStack");

    // TODO --> Creat the carbonlake monitoring and observability stack

    // carbonlake orchestration pipeline stack - Amazon Step Functions
    // TODO: As there are created, need to add the sfn components to the pipeline stack
    const pipeline = new CarbonlakeQuickstartPipelineStack(app, "CarbonlakeQuickstartPipelineStack", {
      transformBucket: "transform-bucket-name-placeholder",
      dataLineageFunction: "data-lineage-function-placeholder"
    });
    
  }
}
