import { Construct } from 'constructs';
import { App, aws_dynamodb, Stack, StackProps } from 'aws-cdk-lib';                 // core constructs
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import {aws_dynamodb as dynamodb} from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib';

export class CarbonlakeQuickstartCalculatorStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const emissionsFactorReferenceTable = new dynamodb.Table(this, "carbonlake-emissions-factor-reference-table", {
            partitionKey: {name: "activity_id", type: dynamodb.AttributeType.STRING },
        });

        // Define DynamoDB Table for calculator output
        const calculatorOutputTable = new dynamodb.Table(this, "carbonlake-calculator-output-table", {
            partitionKey: {name: "activity_id", type: dynamodb.AttributeType.STRING },
        });

        const calculatorLambda = new lambda.Function(this, "CarbonLakeCalculatorHandler", {
            runtime: lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromAsset('lambda'),
            handler: "function.handler",
            environment: {
                EMISSIONS_FACTOR_DATABASE_NAME: emissionsFactorReferenceTable.tableName,
                CALCULATOR_OUTPUT_TABLE_NAME: calculatorOutputTable.tableName
            }
        })
    }
}