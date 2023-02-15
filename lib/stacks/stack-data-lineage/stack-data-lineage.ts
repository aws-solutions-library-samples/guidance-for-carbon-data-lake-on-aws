import { Stack, StackProps, RemovalPolicy, Duration, Tags } from 'aws-cdk-lib'
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { aws_sqs as sqs } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_lambda_event_sources as event_sources } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'
import { DataLineageQuery } from './construct-data-lineage-query/construct-data-lineage-query-stack'

interface DataLineageStackProps extends StackProps {
  archiveBucket: s3.Bucket
}

export class DataLineageStack extends Stack {
  public readonly inputFunction: lambda.Function
  public readonly traceQueue: sqs.Queue

  constructor(scope: Construct, id: string, props: DataLineageStackProps) {
    super(scope, id, props)

    /* ======== STORAGE ======== */

    // Input SQS Queue
    const recordQueue = new sqs.Queue(this, 'cdlDataLineageQueue', {})

    // Retrace SQS Queue
    this.traceQueue = new sqs.Queue(this, 'cdlDataLineageTraceQueue', {
      visibilityTimeout: Duration.seconds(300),
    })

    // DynamoDB Table for data lineage record storage
    const table = new dynamodb.Table(this, 'cdlDataLineageTable', {
      partitionKey: { name: 'root_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'node_id', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl_expiry',
    })

    // # GSI to allow querying by specific child node in data lineage tree
    table.addGlobalSecondaryIndex({
      indexName: 'node-index',
      partitionKey: {
        name: 'node_id',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // # LSI to allow querying by cdl operation type
    // # This reduces branch numbers for the periodic recursive search
    table.addLocalSecondaryIndex({
      indexName: 'action-index',
      sortKey: { name: 'action_taken', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    /* ======== DEPENDENCIES ======== */

    // Lambda Layer for aws_lambda_powertools (dependency for the lambda function)
    const dependencyLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'cdlDataLineageLayer',
      `arn:aws:lambda:${Stack.of(this).region}:017000801446:layer:AWSLambdaPowertoolsPython:18`
    )

    /* ======== INPUT LAMBDA ======== */

    // Lambda function to process incoming events, generate child node IDs
    this.inputFunction = new lambda.Function(this, 'cdlDataLineageInput', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/input_function/')),
      handler: 'app.lambda_handler',
      timeout: Duration.seconds(60),
      environment: {
        SQS_QUEUE_URL: recordQueue.queueUrl,
      },
      layers: [dependencyLayer],
    })

    recordQueue.grantSendMessages(this.inputFunction)

    /* ======== PROCESS LAMBDA ======== */

    // Lambda function to process incoming events and store in DDB
    const dataLineageOutputFunction = new lambda.Function(this, 'cdlDataLineageHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/load_lineage_data/')),
      handler: 'app.lambda_handler',
      environment: {
        OUTPUT_TABLE_NAME: table.tableName,
      },
      layers: [dependencyLayer],
    })

    table.grantWriteData(dataLineageOutputFunction)
    dataLineageOutputFunction.addEventSource(
      new event_sources.SqsEventSource(recordQueue, {
        batchSize: 100,
        maxBatchingWindow: Duration.minutes(1),
      })
    )

    /* ======== TRACE LAMBDA ======== */

    // Lambda function retrace record lineage and store tree in DDB
    const traceFunction = new lambda.Function(this, 'cdlDataLineageTraceHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/rebuild_trace/')),
      handler: 'app.lambda_handler',
      environment: {
        INPUT_TABLE_NAME: table.tableName,
        OUTPUT_BUCKET_NAME: props.archiveBucket.bucketName,
      },
      layers: [dependencyLayer],
      timeout: Duration.minutes(5),
    })

    table.grantReadData(traceFunction)
    props.archiveBucket.grantReadWrite(traceFunction)
    traceFunction.addEventSource(new event_sources.SqsEventSource(this.traceQueue))

    /* ======== QUERY STACK ======== */
    // This is an optional stack to add query support on the archive bucket
    new DataLineageQuery(this, 'cdlDataLineageQueryStack', {
      dataLineageBucket: props.archiveBucket,
    })

    Tags.of(this).add("component", "dataLineage");
  }
}
