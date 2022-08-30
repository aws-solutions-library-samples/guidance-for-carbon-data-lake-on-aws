import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from '@aws-cdk/aws-appsync-alpha'
import {
  Role,
  PolicyStatement,
  ManagedPolicy,
  FederatedPrincipal,
  Effect,
} from 'aws-cdk-lib/aws-iam'
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import {
  AccountRecovery,
  BooleanAttribute,
  CfnUserPoolGroup,
  CfnUserPoolUser,
  CfnUserPoolUserToGroupAttachment,
  DateTimeAttribute,
  StringAttribute,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
  CfnIdentityPoolRoleAttachment,
  CfnIdentityPool,
} from 'aws-cdk-lib/aws-cognito'
import {
  IdentityPool,
  RoleMappingMatchType,
} from '@aws-cdk/aws-cognito-identitypool-alpha'

export interface CLQSApiStackProps extends StackProps {
  calculatorOutputTableRef: cdk.aws_dynamodb.Table
  adminEmail?: string
}

export class CLQSApiStack extends Stack {
  // API
  public readonly graphqlUrl: string
  public readonly apiId: string

  // Cognito
  // public readonly userPool: IUserPool;
  public readonly userPool: UserPool
  // public readonly identityPool: IIdentityPool;
  public readonly identityPool: IdentityPool
  // public readonly userPoolClient: IUserPoolClient;
  public readonly userPoolClient: UserPoolClient
  public readonly adminUser: CfnUserPoolUser

  // IAM
  public readonly clqsAdminUserRole: Role
  public readonly clqsStandardUserRole: Role
  public readonly clqsAuthRole: Role
  public readonly clqsUnAuthRole: Role
  public readonly clqsAdminUserRoleManagedPolicy: ManagedPolicy
  public readonly clStandardUserRoleManagedPolicy: ManagedPolicy
  

  constructor(scope: Construct, id: string, props: CLQSApiStackProps) {
    super(scope, id, props)

    const defaultAdminEmail = this.node.tryGetContext('adminEmail')

    // -- COGNITO USER POOL --
    const userPool = new UserPool(this, 'clqsUserPool', {
      userPoolName: 'clqsUserPool',
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
        emailSubject: `Welcome to AWS CarbonLake!`,
        emailBody:
          'Hello {username}, you have been invited to join the AWS CarbonLake app! Your temporary password is {####}',
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
        joinedOn: new DateTimeAttribute(),
        isAdmin: new BooleanAttribute({ mutable: false }),
        myappid: new StringAttribute({ minLen: 5, maxLen: 15, mutable: false }),
      },
    })

    // -- COGNITO USER POOL (APP) CLIENT
    const userPoolClient = new UserPoolClient(this, 'clqsUserPoolClient', {
      userPool: userPool,
      userPoolClientName: 'clqsUserPoolClient',
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    })

    // // -- COGNITO IDENTITY POOL
    //     const identityPool = new IdentityPool(this, 'clqsIdentityPool', {
    //         identityPoolName: 'clqsIdentityPool',
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
    const clqsIdentityPool = new CfnIdentityPool(this, 'clqsIdentityPool', {
      identityPoolName: 'clqsIdentityPool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    })

    // --- IAM ---
    //  -- AuthRole --
    // Create clqsAuthRole IAM Role using the custom managed policy
    this.clqsAuthRole = new Role(this, 'clqsAuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': clqsIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // TODO - Add basic read-only AWS Managed Policies
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'clqsAuthRole granting read-only access to S3',
    })

    //  -- clqsUnAuthRole --
    // Create clqsUnAuthRole IAM Role using the custom managed policy
    this.clqsUnAuthRole = new Role(this, 'clqsUnAuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': clqsIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // TODO - Add basic read-only AWS Managed Policies
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'clqsUnAuthRole granting access to S3',
    })

    // -- clqsAdminUserRole --
    // Create clqsAdminUserRole IAM Role using the custom managed policy
    const clqsAdminUserRole = new Role(this, 'clqsAdminUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': clqsIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // managedPolicies: [
      //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
      // ],
      description: 'clqsAdminUserRole granting access to S3',
    })

    this.clqsAdminUserRoleManagedPolicy = new ManagedPolicy(this, 'clqsAdminUserRoleManagedPolicy', {
      description: 'All permissions for clqsAdminUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:*'],
          resources: ['*'],
        }),
      ],
      roles: [clqsAdminUserRole],
    })

    //   // -- clqsStandardUserRole --
    //   // Create clqsStandardUserRole IAM Role using the custom managed policy
    this.clqsStandardUserRole = new Role(this, 'clqsStandardUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': clqsIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      // managedPolicies: [
      //  iam.ManagedPolicy.fromManagedPolicyName(scAdminS3PolicyDocument)
      // ],
      description: 'clqsStandardUserRole granting access to S3',
    })
    this.clStandardUserRoleManagedPolicy = new ManagedPolicy(this, 'clqsStandardUserRoleManagedPolicy', {
      description: 'All permissions for clqsStandardUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:*'],
          resources: ['*'],
        }),
      ],
      roles: [this.clqsStandardUserRole],
    })

    // -- IDENTITY POOL ROLE ATTACHMENT --

    const clqsRegion = cdk.Stack.of(this).region // Reference current AWS Region
    const identityProviderUrl = `cognito-idp.${clqsRegion}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`

    new CfnIdentityPoolRoleAttachment(this, 'identity-pool-role-attachment', {
      identityPoolId: clqsIdentityPool.ref,
      roles: {
        authenticated: this.clqsAuthRole.roleArn,
        unauthenticated: this.clqsUnAuthRole.roleArn,
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
                roleArn: clqsAdminUserRole.roleArn,
                value: 'Admin',
              },
              {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: this.clqsStandardUserRole.roleArn,
                value: 'Standard-Users',
              },
            ],
          },
        },
      },
    })

    // -- COGNITO USER POOL GROUPS
    const clqsAdminUserPoolGroup = new CfnUserPoolGroup(this, 'clqsAdmin', {
      userPoolId: userPool.userPoolId,
      description: 'Admin user group',
      groupName: 'Admin',
      precedence: 1,
      roleArn: clqsAdminUserRole.roleArn,
    })
    clqsAdminUserPoolGroup.node.addDependency(clqsAdminUserRole)
    const clqsStandardUserPoolGroup = new CfnUserPoolGroup(this, 'clqsStandard', {
      userPoolId: userPool.userPoolId,
      groupName: 'Standard-Users',
      description: 'Standard user group',
      precedence: 2,
      roleArn: this.clqsStandardUserRole.roleArn,
    })

    // Create an initial admin user with the email address provided in the CDK context
    const adminUser = new CfnUserPoolUser(this, 'clqsDefaultAdminUser', {
      userPoolId: userPool.userPoolId,
      desiredDeliveryMediums: ['EMAIL'],
      userAttributes: [
        {
          name: 'email',
          value: props.adminEmail,
        },
        {
          name: 'given_name',
          value: 'CarbonLake',
        },
        {
          name: 'family_name',
          value: 'Admin',
        },
      ],
      username: props.adminEmail,
    })

    const cfnUserPoolUserToGroupAttachment = new CfnUserPoolUserToGroupAttachment(
      this,
      'MyCfnUserPoolUserToGroupAttachment',
      {
        groupName: 'Admin',
        username: defaultAdminEmail,
        userPoolId: userPool.userPoolId,
      }
    )

    // Prevent creation of UserGroupAttachment until User is created
    cfnUserPoolUserToGroupAttachment.node.addDependency(adminUser)
    cfnUserPoolUserToGroupAttachment.node.addDependency(clqsAdminUserPoolGroup)

    // Create the GraphQL api and provide the schema.graphql file
    const api = new GraphqlApi(this, 'clqsApi', {
      name: 'clqsApi',
      schema: Schema.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
          },
        },
      },
      logConfig: {
        excludeVerboseContent: true,
        fieldLogLevel: FieldLogLevel.ERROR,
      },
      // Uncomment the below line to enable AWS X-Ray distributed tracing for this api
      //xrayEnabled: true
    })

    // Set the public variables so other stacks can access the deployed graphqlUrl & apiId as well as set as CloudFormation output variables
    this.graphqlUrl = api.graphqlUrl
    new CfnOutput(this, 'graphqlUrl', { value: api.graphqlUrl })
    this.apiId = api.apiId
    new CfnOutput(this, 'apiId', { value: api.apiId })

    // Add a DynamoDB datasource. The DynamoDB table we will use is created by another stack
    // and is provided in the props of this stack.
    const datasource = api.addDynamoDbDataSource('CalculatorOutputDataSource', props.calculatorOutputTableRef, {
      name: 'CalculatorOutputDataSource',
    })

    // Create a resolver for getting 1 record by the activity_event_id
    datasource.createResolver({
      typeName: 'Query',
      fieldName: 'getOne',
      requestMappingTemplate: MappingTemplate.dynamoDbGetItem('activity_event_id', 'activity_event_id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })

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
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })

    // Create a resolver for deleting a record by the activity_event_id
    datasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'delete',
      requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem('activity_event_id', 'activity_event_id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })

    // -- Outputs --
    // Set the public variables so other stacks can access the deployed auth/auz related stuff above as well as set as CloudFormation output variables

    // Cognito
    this.userPool = userPool
    new CfnOutput(this, 'userPoolId', { value: userPool.userPoolId })
    
    this.userPoolClient = userPoolClient
    new CfnOutput(this, 'CLQSuserPoolId', { 
      value: userPool.userPoolId,
      exportName: 'CLQSuserPoolId'
    })
    
    new CfnOutput(this, 'identityPoolId', { 
      value: clqsIdentityPool.ref,
      exportName: 'CLQidentityPoolId'
    })

    new CfnOutput(this, 'userPoolClientId', {
       value: userPoolClient.userPoolClientId,
       exportName: 'CLQSuserPoolClientId' 
      })

    // IAM
    this.clqsAdminUserRole = clqsAdminUserRole
    new CfnOutput(this, 'clqsAdminUserRoleOutput', { 
      value: this.clqsAdminUserRole.roleArn,
      exportName: 'CLQSclqsAdminUserRoleOutput'
    })

    new CfnOutput(this, 'clqsStandardUserRoleOutput', {
      value: this.clqsStandardUserRole.roleArn,
      exportName: 'CLQSclqsStandardUserRoleOutput' 
    })

    // Output API Endpoint
    new cdk.CfnOutput(this, 'apiEndpoint', {
      value: this.graphqlUrl,
      description: 'Base http endpoint for CarbonLake Quickstart GraphQL API',
      exportName: 'CLQSApiEndpoint',
    });

    // Output API Username (password will be email to admin user on create)
    new cdk.CfnOutput(this, 'adminUsername', {
      value: adminUser.username ?? '' ,
      description: 'Admin username created on build for GraphQL API',
      exportName: 'CLQSApiUsername',
    });

    // Output Appsync Query Link
    new cdk.CfnOutput(this, 'graphqueryTestUrl', {
      value: `https://${this.region}.console.aws.amazon.com/appsync/home?region=${this.region}#/${this.apiId}/v1/queries`,
      description: 'URL for testing AppSync GraphQL API queries in the AWS console.',
      exportName: 'CLQSGraphQLTestQueryURL',
    });

    cdk.Tags.of(this).add("component", "graphQLApi");

  }
}
