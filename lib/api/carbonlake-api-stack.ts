import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from '@aws-cdk/aws-appsync-alpha';
import { Role, PolicyStatement, PolicyDocument, ServicePrincipal, ManagedPolicy, AccountRootPrincipal, FederatedPrincipal, Effect } from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps, CfnOutput, RemovalPolicy, CfnJson } from 'aws-cdk-lib';
import {
    AccountRecovery,
    BooleanAttribute,
    CfnUserPoolGroup,
    CfnUserPoolUser,
    CfnUserPoolUserToGroupAttachment,
    DateTimeAttribute,
    IUserPool,
    IUserPoolClient,
    StringAttribute,
    UserPool,
    UserPoolClient,
    VerificationEmailStyle,
    CfnIdentityPoolRoleAttachment,
    CfnIdentityPool
  } from 'aws-cdk-lib/aws-cognito';
  import {
    IdentityPool,
    IIdentityPool,
    UserPoolAuthenticationProvider,
    IUserPoolAuthenticationProvider,
    IdentityPoolProviderUrl,
    IdentityPoolRoleMapping,
    IdentityPoolRoleAttachment,
    RoleMappingMatchType,

  } from '@aws-cdk/aws-cognito-identitypool-alpha';


export interface CarbonLakeQuickStartApiStackProps extends cdk.StackProps {
    calculatorOutputTableRef: cdk.aws_dynamodb.Table;
    adminEmail?: string;
}

export class CarbonLakeQuickStartApiStack extends cdk.Stack {
    // API
    public readonly graphqlUrl: string;
    public readonly apiId: string;

    // Cognito
    // public readonly userPool: IUserPool;
    public readonly userPool: UserPool;
    // public readonly identityPool: IIdentityPool;
    public readonly identityPool: IdentityPool;
    // public readonly userPoolClient: IUserPoolClient;
    public readonly userPoolClient: UserPoolClient;
    public readonly adminUser: CfnUserPoolUser;

    // IAM
    public readonly CarbonLakeQuickStartAdminUserRole: Role;
    public readonly CarbonLakeQuickStartStandardUserRole: Role;

    constructor(scope: Construct, id: string, props: CarbonLakeQuickStartApiStackProps) {
        super(scope, id, props);

        const defaultAdminEmail =  this.node.tryGetContext('adminEmail')

    // -- COGNITO USER POOL --
        const userPool = new UserPool(this, 'CarbonLakeQuickStartUserPool', {
            userPoolName: 'CarbonLakeQuickStartUserPool',
            signInAliases: {
                email: true,
                username: false,
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY, // Set the user pool to be detroyed if the stack that deployed it is destroyed
            selfSignUpEnabled: false, // Prevent users to sign up (security mechanism)
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            accountRecovery: AccountRecovery.EMAIL_ONLY, // Restricts account recovery only to email method
            // Invite Message
            userInvitation: {
              emailSubject: `You've been CHOSEN.`,
              emailBody: 'Hello {username}, you have been invited to join the AWS CarbonLake app! Your temporary password is {####}',
              smsMessage: 'Hello {username}, your temporary password for the AWS CarbonLake app is {####}',
            },
            // Verification Message
            userVerification: {
              emailSubject: 'Verify your email for AWS CarbonLake',
              emailBody: 'Thanks for signing up for AWS CarbonLake! Your verification code is {####}',
              emailStyle: VerificationEmailStyle.CODE,
              smsMessage: 'Thanks for signing up for AWS CarbonLake! Your verification code is {####}',
            },
            // Standard User Attributes
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
            },
            customAttributes: {
                'joinedOn': new DateTimeAttribute(),
                'isAdmin': new BooleanAttribute({ mutable: false}),
                'myappid': new StringAttribute ({ minLen: 5, maxLen: 15, mutable: false}),
              }
        });

      // -- COGNITO USER POOL (APP) CLIENT
        const userPoolClient = new UserPoolClient(this, 'CarbonLakeQuickStartUserPoolClient', {
            userPool: userPool,
            userPoolClientName: 'CarbonLakeQuickStartUserPoolClient',
            generateSecret: false // Don't need to generate secret for web app running on browsers
        });

    // // -- COGNITO IDENTITY POOL
    //     const identityPool = new IdentityPool(this, 'CarbonLakeQuickStartIdentityPool', {
    //         identityPoolName: 'CarbonLakeQuickStartIdentityPool',
    //         // allowUnauthenticatedIdentities: true,
    //         allowUnauthenticatedIdentities: false,
    //         cognitoIdentityProviders: [
    //           {
    //             clientId: userPoolClient.userPoolClientId,
    //             providerName: userPool.userPoolProviderName,
    //           },
    //         ],
    //     });
        // -- COGNITO IDENTITY POOL
        const CarbonLakeQuickStartIdentityPool = new CfnIdentityPool(this, 'CarbonLakeQuickStartIdentityPool', {
            identityPoolName: 'CarbonLakeQuickStartIdentityPool',
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
              {
                clientId: userPoolClient.userPoolClientId,
                providerName: userPool.userPoolProviderName,
              },
            ],
          });





    // --- IAM ---
    //  -- AuthRole --
    // Create CarbonLakeQuickStartAuthRole IAM Role using the custom managed policy
    const CarbonLakeQuickStartAuthRole = new Role(this, 'CarbonLakeQuickStartAuthRole', {
        assumedBy: new FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud': CarbonLakeQuickStartIdentityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'authenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        // TODO - Add basic read-only AWS Managed Policies
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        ],
        description: 'CarbonLakeQuickStartAuthRole granting read-only access to S3',
      });

    //  -- CarbonLakeQuickStartUnAuthRole --
    // Create CarbonLakeQuickStartUnAuthRole IAM Role using the custom managed policy
    const CarbonLakeQuickStartUnAuthRole = new Role(this, 'CarbonLakeQuickStartUnAuthRole', {
        assumedBy: new FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud': CarbonLakeQuickStartIdentityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'unauthenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        // TODO - Add basic read-only AWS Managed Policies
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
        ],
        description: 'CarbonLakeQuickStartUnAuthRole granting access to S3',
      });

    // -- CarbonLakeQuickStartAdminUserRole --
    // Create CarbonLakeQuickStartAdminUserRole IAM Role using the custom managed policy
    const CarbonLakeQuickStartAdminUserRole = new Role(this, 'CarbonLakeQuickStartAdminUserRole', {
        assumedBy: new FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud': CarbonLakeQuickStartIdentityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'authenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        // managedPolicies: [
        //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
        // ],
        description: 'CarbonLakeQuickStartAdminUserRole granting access to S3',
      });

      const CarbonLakeQuickStartAdminUserRoleManagedPolicy = new ManagedPolicy(this, 'CarbonLakeQuickStartAdminUserRoleManagedPolicy', {
        description: 'All permissions for CarbonLakeQuickStartAdminUserRole',
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:*'],
            resources: ['*'],
          }),
        ],
        roles: [CarbonLakeQuickStartAdminUserRole],
      });

        //   // -- CarbonLakeQuickStartStandardUserRole --
  //   // Create CarbonLakeQuickStartStandardUserRole IAM Role using the custom managed policy
    const CarbonLakeQuickStartStandardUserRole = new Role(this, 'CarbonLakeQuickStartStandardUserRole', {
        assumedBy: new FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud': CarbonLakeQuickStartIdentityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'authenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        // managedPolicies: [
        //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
        // ],
        description: 'CarbonLakeQuickStartStandardUserRole granting access to S3',
      });
      const clStandardUserRoleManagedPolicy = new ManagedPolicy(this, 'CarbonLakeQuickStartStandardUserRoleManagedPolicy', {
        description: 'All permissions for CarbonLakeQuickStartStandardUserRole',
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:*'],
            resources: ['*'],
          }),
        ],
        roles: [CarbonLakeQuickStartStandardUserRole],
      });


       // -- IDENTITY POOL ROLE ATTACHMENT --

    const CarbonLakeQuickStartRegion = cdk.Stack.of(this).region; // Reference current AWS Region
    const identityProviderUrl =
    `cognito-idp.${CarbonLakeQuickStartRegion}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`;

    new CfnIdentityPoolRoleAttachment(this,'identity-pool-role-attachment',
      {
        identityPoolId: CarbonLakeQuickStartIdentityPool.ref,
        roles: {
          authenticated: CarbonLakeQuickStartAuthRole.roleArn,
          unauthenticated: CarbonLakeQuickStartUnAuthRole.roleArn,
        },
        roleMappings: {
          roleMappingsKey: {
            type: 'Rules',
            ambiguousRoleResolution: 'Deny',
            identityProvider: identityProviderUrl,
            rulesConfiguration: {
              rules: [
                {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: CarbonLakeQuickStartAdminUserRole.roleArn,
                value: 'Admin',
              },
                {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: CarbonLakeQuickStartStandardUserRole.roleArn,
                value: 'Standard-Users',
              },
            ],
            },
          },
        },
      },
    );



    // -- COGNITO USER POOL GROUPS
    const CarbonLakeQuickStartAdminUserPoolGroup = new CfnUserPoolGroup(this, "CarbonLakeQuickStartAdmin", {
        userPoolId: userPool.userPoolId,
        description:'Admin user group',
        groupName: 'Admin',
        precedence: 1,
        roleArn: CarbonLakeQuickStartAdminUserRole.roleArn

        })
        CarbonLakeQuickStartAdminUserPoolGroup.node.addDependency(CarbonLakeQuickStartAdminUserRole)
        const CarbonLakeQuickStartStandardUserPoolGroup = new CfnUserPoolGroup(this, "CarbonLakeQuickStartStandard", {
        userPoolId: userPool.userPoolId,
        groupName: 'Standard-Users',
        description:'Standard user group',
        precedence: 2,
        roleArn: CarbonLakeQuickStartStandardUserRole.roleArn,
        })


        // Create an initial admin user with the email address provided in the CDK context
        const adminUser = new CfnUserPoolUser(this, 'CarbonLakeQuickStartDefaultAdminUser', {
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

          const cfnUserPoolUserToGroupAttachment = new CfnUserPoolUserToGroupAttachment(this, 'MyCfnUserPoolUserToGroupAttachment', {
            groupName: 'Admin',
            username: defaultAdminEmail,
            userPoolId: userPool.userPoolId,
          });

        // Prevent creation of UserGroupAttachment until User is created
        cfnUserPoolUserToGroupAttachment.node.addDependency(adminUser)
        cfnUserPoolUserToGroupAttachment.node.addDependency(CarbonLakeQuickStartAdminUserPoolGroup)



        // Create the GraphQL api and provide the schema.graphql file
        const api = new GraphqlApi(this, 'CarbonLakeQuickStartApi', {
            name: 'CarbonLakeQuickStartApi',
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

                // -- Outputs --
        // Set the public variables so other stacks can access the deployed auth/auz related stuff above as well as set as CloudFormation output variables

        // Cognito
        this.userPool = userPool;
        new CfnOutput(this, 'userPoolId', {value: userPool.userPoolId});
        // this.identityPool = CarbonLakeQuickStartIdentityPool;
        new CfnOutput(this, 'identityPoolId', {value: CarbonLakeQuickStartIdentityPool.ref});
        this.userPoolClient = userPoolClient;
        new CfnOutput(this, 'userPoolClientId', {value: userPoolClient.userPoolClientId});
        this.adminUser = adminUser;
        new CfnOutput(this, 'adminUser', {value: adminUser.username ?? ''});



        // IAM
        this.CarbonLakeQuickStartAdminUserRole = CarbonLakeQuickStartAdminUserRole;
        new CfnOutput (this, 'CarbonLakeQuickStartAdminUserRoleOutput', {value: CarbonLakeQuickStartAdminUserRole.roleArn});

        this.CarbonLakeQuickStartStandardUserRole= CarbonLakeQuickStartStandardUserRole;
        new CfnOutput (this, 'CarbonLakeQuickStartStandardUserRoleOutput', {value: CarbonLakeQuickStartStandardUserRole.roleArn});
    }
}
