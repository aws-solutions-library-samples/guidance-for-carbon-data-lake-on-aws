import { NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { custom_resources as cr } from 'aws-cdk-lib';
import emission_factors from './emissions_factor_model_2022-04-26.json';
import * as path from 'path';
import { Construct } from 'constructs';

const DDB_BATCH_WRITE_ITEM_CHUNK_SIZE = 25;

export interface CarbonlakeQuickstartCalculatorStackProps extends NestedStackProps {
    transformedBucket: s3.Bucket;
    enrichedBucket: s3.Bucket;
}

export class CarbonlakeQuickstartCalculatorStack extends NestedStack {
    public readonly calculatorOutputTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props: CarbonlakeQuickstartCalculatorStackProps) {
        super(scope, id, props);

        const emissionsFactorReferenceTable = new dynamodb.Table(this, "carbonLakeEmissionsFactorReferenceTable", {
            partitionKey: { name: "category", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "activity", type: dynamodb.AttributeType.STRING },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // Define DynamoDB Table for calculator output
        this.calculatorOutputTable = new dynamodb.Table(this, "carbonlakeCalculatorOutputTable", {
            partitionKey: { name: "activity_event_id", type: dynamodb.AttributeType.STRING },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const calculatorLambda = new lambda.Function(this, "carbonLakeCalculatorHandler", {
            runtime: lambda.Runtime.PYTHON_3_9,
            code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            handler: "calculatorLambda.lambda_handler",
            environment: {
                EMISSIONS_FACTOR_TABLE_NAME: emissionsFactorReferenceTable.tableName,
                CALCULATOR_OUTPUT_TABLE_NAME: this.calculatorOutputTable.tableName,
                TRANSFORMED_BUCKET_NAME: props.transformedBucket.bucketName,
                ENRICHED_BUCKET_NAME: props.enrichedBucket.bucketName
            }
        });

        emissionsFactorReferenceTable.grantReadData(calculatorLambda);
        this.calculatorOutputTable.grantWriteData(calculatorLambda);
        props.transformedBucket.grantRead(calculatorLambda);
        props.enrichedBucket.grantWrite(calculatorLambda);

        //We popupate the Emission Factors DB with data from a JSON file
        //We split into chunks because BatchWriteItem has a limitation of 25 items per batch
        //See https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
        for (let i = 0; i<emission_factors.length; i+=DDB_BATCH_WRITE_ITEM_CHUNK_SIZE) {
            const chunk = emission_factors.slice(i, i + DDB_BATCH_WRITE_ITEM_CHUNK_SIZE);
            new cr.AwsCustomResource(this, `initCarbonLakeEmissionsFactorReferenceTable${i}`, {
                onCreate: {
                    service: 'DynamoDB',
                    action: 'batchWriteItem',
                    parameters: {
                        RequestItems: {
                            [emissionsFactorReferenceTable.tableName]: this.generateBatch(chunk),
                        },
                    },
                    physicalResourceId: cr.PhysicalResourceId.of(emissionsFactorReferenceTable.tableName + '_initialization')
                },
                policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: [emissionsFactorReferenceTable.tableArn] }),
            });
        }

    }

    private generateBatch = (chunk: IGhgEmissionFactor[]): { PutRequest: { Item: IDdbEmissionFactor } }[] => {
        const result: { PutRequest: { Item: IDdbEmissionFactor; }; }[] = [];
        chunk.forEach((emission_factor) => {
            result.push({ PutRequest: { Item: this.generateItem(emission_factor) } });
        });
        return result;
    };

    private generateItem = (emission_factor: IGhgEmissionFactor): IDdbEmissionFactor => {
        const coefficients = emission_factor.emissions_factor_standards.ghg.coefficients;
        return {
            activity: { S: emission_factor.activity },
            category: { S: emission_factor.category },
            scope: { N: emission_factor.scope },
            emissions_factor_standards: { M: {
                ghg: { M: {
                    coefficients: { M: {
                            co2_factor: { S: coefficients.co2_factor },
                            ch4_factor: { S: coefficients.ch4_factor },
                            n2o_factor: { S: coefficients.n2o_factor },
                            biofuel_co2: { S: coefficients.biofuel_co2 },
                            AR4_kgco2e: { S: coefficients['AR4-kgco2e'] },
                            AR5_kgco2e: { S: coefficients['AR5-kgco2e'] },
                            units: { S: coefficients.units },
                        }
                    },
                    last_updated: { S: emission_factor.emissions_factor_standards.ghg.last_updated },
                    source: { S: emission_factor.emissions_factor_standards.ghg.source },
                    source_origin: { S: emission_factor.emissions_factor_standards.ghg.source_origin },
                }}
            }}
        };
    }
}

interface IDdbEmissionFactor {
    category: { S: string };
    activity: { S: string };
    scope: { N: string };
    emissions_factor_standards: { M: {
        ghg: { M: {
            coefficients: { M: {
                    co2_factor: { S: string }; //TODO use number (I used string because some values are empty in JSON)
                    ch4_factor: { S: string }; //TODO use number (I used string because some values are empty in JSON)
                    n2o_factor: { S: string }; //TODO use number (I used string because some values are empty in JSON)
                    biofuel_co2: { S: string };//TODO use number (I used string because some values are empty in JSON)
                    AR4_kgco2e: { S: string }; //TODO use number (I used string because some values are empty in JSON)
                    AR5_kgco2e: { S: string }; //TODO use number (I used string because some values are empty in JSON)
                    units: { S: string };
                };
            };
            last_updated: { S: string };
            source: { S: string };
            source_origin: { S: string };
        }};
    }};
}

interface IGhgEmissionFactor {
    category: string;
    activity: string;
    scope: string;
    emissions_factor_standards: {
        ghg: {
            coefficients: {
                co2_factor: string;
                ch4_factor: string;
                n2o_factor: string;
                biofuel_co2: string;
                "AR4-kgco2e": string;
                "AR5-kgco2e": string;
                units: string;
            };
            last_updated: string;
            source: string;
            source_origin: string;
        };
    };
}