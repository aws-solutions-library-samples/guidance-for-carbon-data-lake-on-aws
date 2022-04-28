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
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem("activity_event_id", "activity_event_id"),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
        });

        datasource.createResolver({
            typeName: 'Query',
            fieldName: 'all',
            requestMappingTemplate: appsync.MappingTemplate.fromString(`{
                "version": "2018-05-29",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
        });

        datasource.createResolver({
            typeName: 'Mutation',
            fieldName: 'delete',
            requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem("activity_event_id", "activity_event_id"),
            responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
        });
    }
}