import * as cdk from 'aws-cdk-lib';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { Construct } from 'constructs';
import * as path from 'path';

export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
    calculatorOutputTableRef: cdk.aws_dynamodb.Table;
}

export class CarbonLakeQuickStartApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CarbonLakeQuickStartApiStackProps) {
        super(scope, id, props);

        const api = new appsync.GraphqlApi(this, 'CarbonLakeApi', {
            name: 'carbonlake-api',
            schema: appsync.Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.API_KEY
                },
            },
            xrayEnabled: false,
        });

        const datasource = api.addDynamoDbDataSource('CalculatorOutputDataSource', props.calculatorOutputTableRef, {
            name: 'CalculatorOutputDataSource'
        });

        datasource.createResolver({
            typeName: 'Query',
            fieldName: 'getOne',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem("record_id", "record_id"),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        });

        datasource.createResolver({
            typeName: 'Query',
            fieldName: 'all',
            requestMappingTemplate: appsync.MappingTemplate.fromString(`{
                "version": "2017-02-28",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList()
        });

        datasource.createResolver({
            typeName: 'Mutation',
            fieldName: 'delete',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem("record_id", "record_id"),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
        });

        /* 
        
        const calculatorOutputTableRole = new Role(this, `CalculatorOutputDynamoDBRole`, {
            assumedBy: new ServicePrincipal('appsync.amazonaws.com')
        });

        calculatorOutputTableRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
        
        const graphQLApi = new CfnGraphQLApi(this, 'CarbonLakeApi', {
            name: 'carbonlake-api',
            authenticationType: 'API_KEY'
        });

        new CfnApiKey(this, 'CarbonLakeApiKey', {
            apiId: graphQLApi.attrApiId
        });


        const apiSchema = new CfnGraphQLSchema(this, 'CarbonLakeSchema', {
            apiId: graphQLApi.attrApiId,
            definition: `
                type ${tableName} {
                    record_id: ID!
                    name: String
                }
                type Paginated${tableName} {
                    items: [${tableName}!]!
                    nextToken: String
                }
                type Query {
                    all(limit: Int, nextToken: String): Paginated${tableName}!
                    getOne(${tableName}Id: ID!): ${tableName}
                }
                type Mutation {
                    save(name: String!): ${tableName}
                    delete(${tableName}Id: ID!): ${tableName}
                }
                type Schema {
                    query: Query
                    mutation: Mutation
                }
            `
        }); 
        
        const dataSource = new CfnDataSource(this, 'CalculatorOutputDataSource', {
            apiId: api.apiId,
            name: 'CalculatorOutputDataSource',
            type: 'AMAZON_DYNAMODB',
            dynamoDbConfig: {
                tableName: props.calculatorOutputTableRef.tableName,
                awsRegion: this.region
            },
            serviceRoleArn: calculatorOutputTableRole.roleArn
        });

        const getOneResolver = new CfnResolver(this, 'GetOneQueryResolver', {
            apiId: api.apiId,
            typeName: 'Query',
            fieldName: 'getOne',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "GetItem",
                "key": {
                    "record_id": $util.dynamodb.toDynamoDBJson($ctx.args.record_id)
                }
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        getOneResolver.addDependsOn(apiSchema);

        const getAllResolver = new CfnResolver(this, 'GetAllQueryResolver', {
            apiId: api.apiId,
            typeName: 'Query',
            fieldName: 'all',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        getAllResolver.addDependsOn(apiSchema);

        const deleteResolver = new CfnResolver(this, 'DeleteMutationResolver', {
            apiId: api.apiId,
            typeName: 'Mutation',
            fieldName: 'delete',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "DeleteItem",
                "key": {
                    "record_id": $util.dynamodb.toDynamoDBJson($ctx.args.record_id)
                }
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        deleteResolver.addDependsOn(apiSchema);

        */
    }
}