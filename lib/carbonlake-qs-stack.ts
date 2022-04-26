import * as cdk from 'aws-cdk-lib';
import { CarbonlakeApiStack } from './api/carbonlake-api-stack';
import { CarbonlakeQuickstartCalculatorStack } from './pipeline/calculator/carbonlake-quickstart-calculator';
import { CarbonlakeQuickstartStorageStack } from './pipeline/storage/carbonlake-qs-storage-stack';
import { CarbonlakeQuickstartDataLineageStack } from './data-lineage/carbonlake-data-lineage-stack';


export class CarbonlakeQuickstartStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const app = new cdk.App();

    // TODO --> Create the carbonlake storage stack
    // const storage = new CarbonlakeQuickstartStorageStack(app, "CarbonlakeQuickstartStorageStack");

    // Create the carbonlake API stack
    // const api = new CarbonlakeApiStack(app, "CarbonlakeApiStack");

    // Create the carbonlake calculator stack
    // const calculator = new CarbonlakeQuickstartCalculatorStack(app, "CarbonlakeQuickStartCalculatorStack");

    // TODO --> Create the carbonlake etl-pipeline stack

    // TODO --> Create the carbonlake web stack

    // TODO --> Create the carbonlake grafana stack

    // TODO --> Create the carbonlake quickstart stack

    // TODO --> Create the carbonlake data lineage stack
    const dataLineage = new CarbonlakeQuickstartDataLineageStack(app, "CarbonlakeQuickstartDataLineageStack");

    // TODO --> Creat the carbonlake monitoring and observability stack
    
  }
}
