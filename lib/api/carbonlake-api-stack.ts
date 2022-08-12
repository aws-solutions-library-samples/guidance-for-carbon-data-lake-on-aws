import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from '@aws-cdk/aws-appsync-alpha';
import { CfnOutput } from 'aws-cdk-lib';
import { CfnUserPoolUser, IUserPool, IUserPoolClient, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { IdentityPool, IIdentityPool, UserPoolAuthenticationProvider } from '@aws-cdk/aws-cognito-identitypool-alpha';


export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
    calculatorOutputTableRef: cdk.aws_dynamodb.Table;
    adminEmail?: string;
}

export class CarbonLakeQuickStartApiStack extends cdk.Stack {
    public readonly graphqlUrl: string;
    public readonly apiId: string;
    public readonly userPool: IUserPool;
    public readonly identityPool: IIdentityPool;
    public readonly userPoolClient: IUserPoolClient;
    public readonly adminUser: CfnUserPoolUser;

    constructor(scope: Construct, id: string, props: CarbonLakeQuickStartApiStackProps) {
        super(scope, id, props);

        // Create a sample Cognito user pool to use in providing authentication & authorization for the API
        const userPool = new UserPool(this, 'CarbonLakeQuickStartUserPool', {
            userPoolName: 'CarbonLakeQuickStartUserPool',
            signInAliases: {
                email: true,
                username: false,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Set the user pool to be detroyed if the stack that deployed it is destroyed
            selfSignUpEnabled: false, // Prevent users to sign up (security mechanism)
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            standardAttributes: {
                email: {
                  required: true,
                  mutable: false,
                },
                givenName: {
                  required: true,
                  mutable: true,
                },
                familyName: {
                  required: true,
                  mutable: true,
                },
            }

        });

        // Create a Cognito identity pool to be used with the Amplify sample app
        const identityPool = new IdentityPool(this, 'CarbonLakeQuickStartIdentityPool', {
            identityPoolName: 'CarbonLakeQuickStartIdentityPool',
            allowUnauthenticatedIdentities: true,
            authenticationProviders: {
                userPools: [new UserPoolAuthenticationProvider({ userPool })],
            },
        });

        // Create a sample Cognito user pool client to allow users created in Cognito to login and use the API
        const userPoolClient = new UserPoolClient(this, 'CarbonLakeQuickStartUserPoolClient', {
            userPool: userPool,
            userPoolClientName: 'CarbonLakeQuickStartUserPoolClient',
            generateSecret: false // Don't need to generate secret for web app running on browsers
        });

        // Create an initial admin user with the email address provided in the CDK context
        const adminUser = new CfnUserPoolUser(this, 'CarbonLakeQuickStartAdminUser', {
            userPoolId: userPool.userPoolId,
            desiredDeliveryMediums: ['EMAIL'],
            userAttributes: [
                {
                    name: 'email',
                    value: props.adminEmail
                },
                {
                    name: 'given_name',
                    value: 'CarbonLake'
                },
                {
                    name: 'family_name',
                    value: 'Admin'
                }
            ],
            username: props.adminEmail
          });

        // Set the public variables so other stacks can access the deployed auth/auz related stuff above as well as set as CloudFormation output variables
        this.userPool = userPool;
        new CfnOutput(this, 'userPoolId', {value: userPool.userPoolId});
        this.identityPool = identityPool;
        new CfnOutput(this, 'identityPoolId', {value: identityPool.identityPoolId});
        this.userPoolClient = userPoolClient;
        new CfnOutput(this, 'userPoolClientId', {value: userPoolClient.userPoolClientId});
        this.adminUser = adminUser;
        new CfnOutput(this, 'adminUser', {value: adminUser.username ?? ''});

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
