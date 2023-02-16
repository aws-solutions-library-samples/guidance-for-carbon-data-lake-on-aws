import { Duration, CustomResource, StackProps, PhysicalName, RemovalPolicy } from 'aws-cdk-lib'
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_logs as logs } from 'aws-cdk-lib'
import { aws_s3_deployment as s3_deployment } from 'aws-cdk-lib'
import { custom_resources as cr } from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'

export interface CalculatorProps extends StackProps {
  transformedBucket: s3.Bucket
  enrichedBucket: s3.Bucket
}

export class Calculator extends Construct {
  public readonly calculatorOutputTable: dynamodb.Table
  public readonly calculatorLambda: lambda.Function

  constructor(scope: Construct, id: string, props: CalculatorProps) {
    super(scope, id)

    const emissionFactorsReferenceTable = new dynamodb.Table(this, 'cdlEmissionFactorsReferenceTable', {
      // Key is a hash of all Emission Factors lookup fields
      partitionKey: { name: 'hash_key', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    })

    // Define DynamoDB Table for calculator output
    this.calculatorOutputTable = new dynamodb.Table(this, 'cdlCalculatorOutputTable', {
      partitionKey: { name: 'activity_event_id', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    })

    this.calculatorLambda = new lambda.Function(this, 'cdlCalculatorHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'calculatorLambda.lambda_handler',
      timeout: Duration.minutes(5),
      environment: {
        EMISSION_FACTORS_TABLE_NAME: emissionFactorsReferenceTable.tableName,
        CALCULATOR_OUTPUT_TABLE_NAME: this.calculatorOutputTable.tableName,
        TRANSFORMED_BUCKET_NAME: props.transformedBucket.bucketName,
        ENRICHED_BUCKET_NAME: props.enrichedBucket.bucketName,
      },
    })

    emissionFactorsReferenceTable.grantReadData(this.calculatorLambda)
    this.calculatorOutputTable.grantWriteData(this.calculatorLambda)
    props.transformedBucket.grantRead(this.calculatorLambda)
    props.enrichedBucket.grantWrite(this.calculatorLambda)

    // Emission Factors Data loader
    const emissionFactorsBucket = new s3.Bucket(this, 'cdlEmissionFactorsBucket', {
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
    const emission_factors_deployment = new s3_deployment.BucketDeployment(this, 'cdlEmissionFactorsDeployment', {
      sources: [s3_deployment.Source.asset(`./framework_configurations/${this.node.tryGetContext('framework')}/emission_factors`)],
      destinationBucket: emissionFactorsBucket,
      storageClass: s3_deployment.StorageClass.ONEZONE_IA
    })

    const emissionFactorsLoaderLambda = new lambda.Function(this, 'cdlEmissionFactorsLoaderLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'emissionFactorsLoaderLambda.lambda_handler',
      timeout: Duration.minutes(5),
      environment: {
        EMISSION_FACTORS_TABLE_NAME: emissionFactorsReferenceTable.tableName,
        EMISSION_FACTORS_BUCKET_NAME: emissionFactorsBucket.bucketName,
      },
    })
    emissionFactorsBucket.grantRead(emissionFactorsLoaderLambda);
    emissionFactorsReferenceTable.grantReadWriteData(emissionFactorsLoaderLambda);

    const emissionFactorsLoaderProvider = new cr.Provider(this, 'cdlEmissionFactorsLoaderProvider', {
      onEventHandler: emissionFactorsLoaderLambda,
      logRetention: logs.RetentionDays.ONE_DAY,
    });
    new CustomResource(this, 'cdlEmissionFactorsLoaderCustomResource', {
      serviceToken: emissionFactorsLoaderProvider.serviceToken,
      properties: {
        // a hash of the emission factors files is calculated
        // everytime a file is changed, the emission factors DB is repopulated
        "input_file_hash": (emission_factors_deployment.node.findChild("Asset1") as Asset).assetHash
      }
    });
  }
}
