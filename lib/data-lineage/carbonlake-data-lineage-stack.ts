import { App, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_lambda_event_sources as event_sources } from 'aws-cdk-lib';
import * as path from 'path';

export class CarbonlakeQuickstartDataLineageStack extends Stack {
  public readonly inputFunction: lambda.Function;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    /* ======== STORAGE ======== */

    // Input SQS Queue
    const queue = new sqs.Queue(this, 'carbonlakeDataLineageQueue', {});

    // DynamoDB Table for data lineage record storage
    const table = new dynamodb.Table(this, "carbonlakeDataLineageTable", {
      partitionKey: { name: "root_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "child_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // GSI to allow querying by specific child node in data lineage tree
    table.addGlobalSecondaryIndex({
      indexName: "child-index",
      partitionKey: {
        name: "child_id",
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    })

    // GSI to allow querying by specific child node in data lineage tree
    table.addGlobalSecondaryIndex({
      indexName: "parent-index",
      partitionKey: {
        name: "parent_id",
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    })

    // LSI to allow querying by carbonlake operation type
    // This reduces branch numbers for the periodic recursive search
    table.addLocalSecondaryIndex({
      indexName: "action-index",
      sortKey:{ name: "action_taken", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    })

    // Audit Bucket for storing reconstructed data lineage trees from record -> parent

    /* ======== DEPENDENCIES ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "carbonlakeDataLineageLayer",
      `arn:aws:lambda:${this.region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    );

    /* ======== INPUT LAMBDA ======== */

    // Lambda function to process incoming events, generate child node IDs
    this.inputFunction = new lambda.Function(this, "carbonlakeDataLineageInput", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/input_function/')),
      handler: "app.lambda_handler",
      environment: {
        SQS_QUEUE_URL: queue.queueUrl
      },
      layers: [dependencyLayer]
    });

    queue.grantSendMessages(this.inputFunction);

    /* ======== PROCESS LAMBDA ======== */

    // Lambda function to process incoming events and store in DDB
    const dataLineageOutputFunction = new lambda.Function(this, "carbonlakeDataLineageHandler", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/load_lineage_data/')),
      handler: "app.lambda_handler",
      environment: {
        OUTPUT_TABLE_NAME: table.tableName
      },
      layers: [dependencyLayer]
    });

    table.grantWriteData(dataLineageOutputFunction);
    dataLineageOutputFunction.addEventSource(new event_sources.SqsEventSource(queue));
  }
}