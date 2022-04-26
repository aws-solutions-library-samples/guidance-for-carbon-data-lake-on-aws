import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_lambda_event_sources as event_sources } from 'aws-cdk-lib';
import * as path from 'path';

export class CarbonlakeQuickstartDataLineageStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        // Input SQS Queue
        const dataLineageQueue = new sqs.Queue(this, 'carbonlakeDataLineageQueue', {});

        // DynamoDB Table for data lineage record storage
        const dataLineageTable = new dynamodb.Table(this, "carbonlakeDataLineageTable", {
            partitionKey: {name: "activity_id", type: dynamodb.AttributeType.STRING },
        });

        // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
        const dataLineageDependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
          this,
          "carbonlakeDataLineageLayer",
          `arn:aws:lambda:${process.env.AWS_DEFAULT_REGION}:017000801446:layer:AWSLambdaPowertoolsPython:18`
        );

        // Lambda function to process incoming events and store in DDB
        const dataLineageFunction = new lambda.Function(this, "carbonlakeDataLineageHandler", {
          runtime: lambda.Runtime.PYTHON_3_9,
          code: lambda.Code.fromAsset(path.join(__dirname, './lambda/load_lineage_data/')),
          handler: "app.lambda_handler",
          environment: {
            SQS_QUEUE: "",
            OUTPUT_TABLE_NAME: dataLineageTable.tableName
          },
          layers: [dataLineageDependencyLayer]
        });

        dataLineageFunction.addEventSource(new event_sources.SqsEventSource(dataLineageQueue));
    }
}