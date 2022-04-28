import * as cdk from 'aws-cdk-lib';
import { CarbonLakeQuickStartApiStack } from './api/carbonlake-api-stack';
import { CarbonlakeQuickstartCalculatorStack } from './pipeline/calculator/carbonlake-quickstart-calculator';
import { CarbonlakeQuickstartSharedResourcesStack } from './shared-resources/carbonlake-qs-shared-stack-resources';
import { CarbonlakeQuickstartDataLineageStack } from './data-lineage/carbonlake-data-lineage-stack';


export class CarbonlakeQuickstartStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app = new cdk.App();

    // QS1 --> Create the carbonlake shared resource stack
    //const sharedResources = new CarbonlakeSharedResourceStack(app, "CarbonlakeSharedResourceStack")
    
    // QS2 --> Create the carbonlake data lineage stack
    const dataLineage = new CarbonlakeQuickstartDataLineageStack(app, "CarbonlakeDataLineageStack")

    // QS3 --> Create the carbonlake data pipeline stack
    //const dataPipeline = new CarbonDataPipelineStack(app, "CarbonlakeDataPipelineStack")

    // QS4 --> Create the carbonlake calculator stack
    const calculator = new CarbonlakeQuickstartCalculatorStack(app, "CarbonlakeQuickStartCalculatorStack");

    // QS5 --> Create the carbonlake quicksight stack
    //const quicksight = new CarbonlakeQuicksightStack(app, "CarbonlakeQuickstartStack")

    // QS7 --> Create the carbonlake web stack
    const api = new CarbonLakeQuickStartApiStack(app, "CarbonLakeQuickStartApiStack", {
      calculatorOutputTableRef: calculator.calculatorOutputTable
    });

    // QS8 --> Create the carbonlake forecast stack
    //const forecast = new CarbonlakeForecastStack(app, "CarbonlakeForecastStack")

    //include CFN outputs below
    /*
    new CfnOutput(this, 'Example Output', {
      value: locator.someArn,
    });
    */
  }
}
