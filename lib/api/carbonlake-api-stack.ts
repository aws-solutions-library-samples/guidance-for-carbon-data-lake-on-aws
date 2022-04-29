import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from '@aws-cdk/aws-appsync-alpha';
import { CfnOutput } from 'aws-cdk-lib';
import { IUserPool, IUserPoolClient, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
    calculatorOutputTableRef: cdk.aws_dynamodb.Table;
}

export class CarbonLakeQuickStartApiStack extends cdk.Stack {
    public readonly graphqlUrl: string;
    public readonly apiId: string;
    public readonly userPool: IUserPool;
    public readonly userPoolClient: IUserPoolClient;

    constructor(scope: Construct, id: string, props: CarbonLakeQuickStartApiStackProps) {
        super(scope, id, props);

        // Create a sample Cognito user pool to use in providing authentication & authorization for the API
        const userPool = new UserPool(this, 'CarbonLakeQuickStartUserPool', {
            userPoolName: 'CarbonLakeQuickStartUserPool'
        });

        // Create a sample Cognito user pool client to allow users created in Cognito to login and use the API
        const userPoolClient = new UserPoolClient(this, 'CarbonLakeQuickStartUserPoolClient', {
            userPool: userPool,
            userPoolClientName: 'CarbonLakeQuickStartUserPoolClient',
            generateSecret: false
        });

        // Set the public variables so other stacks can access the deployed userPoolId & userPoolClientId as well as set as CloudFormation output variables
        this.userPool = userPool;
        new CfnOutput(this, 'userPoolId', {value: userPool.userPoolId});
        this.userPoolClient = userPoolClient;
        new CfnOutput(this, 'userPoolClientId', {value: userPoolClient.userPoolClientId});

        // Create the GraphQL api and provide the schema.graphql file
        const api = new GraphqlApi(this, 'CarbonLakeApi', {
            name: 'CarbonLakeApi',
            schema: Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool: userPool
                    }
                },
            },
            logConfig: {
                excludeVerboseContent: true,
                fieldLogLevel: FieldLogLevel.ERROR
            },
            // Uncomment the below line to enable AWS X-Ray distributed tracing for this api
            //xrayEnabled: true
        });

        // Set the public variables so other stacks can access the deployed graphqlUrl & apiId as well as set as CloudFormation output variables
        this.graphqlUrl = api.graphqlUrl;
        new CfnOutput(this, 'graphqlUrl', {value: api.graphqlUrl});
        this.apiId = api.apiId;
        new CfnOutput(this, 'apiId', {value: api.apiId});

        // Add a DynamoDB datasource. The DynamoDB table we will use is created by another stack
        // and is provided in the props of this stack.
        const datasource = api.addDynamoDbDataSource('CalculatorOutputDataSource', props.calculatorOutputTableRef, {
            name: 'CalculatorOutputDataSource'
        });

        // Create a resolver for getting 1 record by the activity_event_id
        datasource.createResolver({
            typeName: 'Query',
            fieldName: 'getOne',
            requestMappingTemplate: MappingTemplate.dynamoDbGetItem("activity_event_id", "activity_event_id"),
            responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
        });

        // Create a resolver for getting a list of records. This resolver will limit the number of records
        // returned by a value provided or by a default of 20. This resolver can be used for pagination.
        datasource.createResolver({
            typeName: 'Query',
            fieldName: 'all',
            requestMappingTemplate: MappingTemplate.fromString(`{
                "version": "2018-05-29",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`),
            responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
        });

        // Create a resolver for deleting a record by the activity_event_id
        datasource.createResolver({
            typeName: 'Mutation',
            fieldName: 'delete',
            requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem("activity_event_id", "activity_event_id"),
            responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
        });
    }
}