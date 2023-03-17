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
  AdvancedSecurityMode
} from 'aws-cdk-lib/aws-cognito'
import {
  IdentityPool,
  RoleMappingMatchType,
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import { NagSuppressions } from 'cdk-nag'

export interface ApiStackProps extends StackProps {
  calculatorOutputTableRef: cdk.aws_dynamodb.Table
  landingBucket: cdk.aws_s3.Bucket
  adminEmail?: string
}

export class ApiStack extends Stack {
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
  public readonly cdlAdminUserRole: Role
  public readonly cdlStandardUserRole: Role
  public readonly cdlAuthRole: Role
  public readonly cdlUnAuthRole: Role
  public readonly cdlAdminUserRoleManagedPolicy: ManagedPolicy
  public readonly clStandardUserRoleManagedPolicy: ManagedPolicy
  public readonly cdlIdentityPool: CfnIdentityPool

  // Outputs
  public readonly userPoolClientIdOutput: CfnOutput
  public readonly identityPoolIdOutputId: CfnOutput
  public readonly userPoolIdOutput: CfnOutput

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const defaultAdminEmail = this.node.tryGetContext('adminEmail')

    // -- COGNITO USER POOL --
    const userPool = new UserPool(this, 'cdlUserPool', {
      userPoolName: 'cdlUserPool',
      signInAliases: {
        email: true,
        username: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Set the user pool to be detroyed if the stack that deployed it is destroyed
      selfSignUpEnabled: false, // Prevent users to sign up (security mechanism)
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      accountRecovery: AccountRecovery.EMAIL_ONLY, // Restricts account recovery only to email method
      // Invite Message
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      advancedSecurityMode: AdvancedSecurityMode.ENFORCED,
      userInvitation: {
        emailSubject: `Welcome to AWS Carbon Data Lake!`,
        emailBody:
          'Hello {username}, you have been invited to join the AWS Carbon Data Lake app! Your temporary password is {####}',
        smsMessage: 'Hello {username}, your temporary password for the AWS Carbon Data Lake app is {####}',
      },
      // Verification Message
      userVerification: {
        emailSubject: 'Verify your email for AWS Carbon Data Lake',
        emailBody: 'Thanks for signing up for AWS Carbon Data Lake! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
        smsMessage: 'Thanks for signing up for AWS Carbon Data Lake! Your verification code is {####}',
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

    NagSuppressions.addResourceSuppressions(userPool, [
      {
          id: 'AwsSolutions-COG2',
          reason: 'Not requiring MFA by default because this is a development tool. Users are encouraged to enabled in all production environments.'
      },
    ])

    // -- COGNITO USER POOL (APP) CLIENT
    const userPoolClient = new UserPoolClient(this, 'cdlUserPoolClient', {
      userPool: userPool,
      userPoolClientName: 'cdlUserPoolClient',
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    })

    // // -- COGNITO IDENTITY POOL
    //     const identityPool = new IdentityPool(this, 'cdlIdentityPool', {
    //         identityPoolName: 'cdlIdentityPool',
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
    this.cdlIdentityPool = new CfnIdentityPool(this, 'cdlIdentityPool', {
      identityPoolName: 'cdlIdentityPool',
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
    // Create cdlAuthRole IAM Role using the custom managed policy
    this.cdlAuthRole = new Role(this, 'cdlAuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.cdlIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'cdlAuthRole granting read-only access to S3',
    })

    //  -- cdlUnAuthRole --
    // Create cdlUnAuthRole IAM Role using the custom managed policy
    this.cdlUnAuthRole = new Role(this, 'cdlUnAuthRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.cdlIdentityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
      description: 'cdlUnAuthRole granting access to S3',
    })

    // -- cdlAdminUserRole --
    // Create cdlAdminUserRole IAM Role using the custom managed policy
    const cdlAdminUserRole = new Role(this, 'cdlAdminUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.cdlIdentityPool.ref,
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
      description: 'cdlAdminUserRole granting access to S3',
    })

    this.cdlAdminUserRoleManagedPolicy = new ManagedPolicy(this, 'cdlAdminUserRoleManagedPolicy', {
      description: 'All permissions for cdlAdminUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:*'],
          resources: ['*'],
        }),
      ],
      roles: [cdlAdminUserRole],
    })

    //   // -- cdlStandardUserRole --
    //   // Create cdlStandardUserRole IAM Role using the custom managed policy
    this.cdlStandardUserRole = new Role(this, 'cdlStandardUserRole', {
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.cdlIdentityPool.ref,
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
      description: 'cdlStandardUserRole granting access to S3',
    })
    this.clStandardUserRoleManagedPolicy = new ManagedPolicy(this, 'cdlStandardUserRoleManagedPolicy', {
      description: 'All permissions for cdlStandardUserRole',
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['s3:getObject'],
          resources: ['*'],
        }),
      ],
      roles: [this.cdlStandardUserRole],
    })

    // -- IDENTITY POOL ROLE ATTACHMENT --

    const cdlRegion = cdk.Stack.of(this).region // Reference current AWS Region
    const identityProviderUrl = `cognito-idp.${cdlRegion}.amazonaws.com/${userPool.userPoolId}:${userPoolClient.userPoolClientId}`

    new CfnIdentityPoolRoleAttachment(this, 'identity-pool-role-attachment', {
      identityPoolId: this.cdlIdentityPool.ref,
      roles: {
        authenticated: this.cdlAuthRole.roleArn,
        unauthenticated: this.cdlUnAuthRole.roleArn,
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
                roleArn: cdlAdminUserRole.roleArn,
                value: 'Admin',
              },
              {
                claim: 'cognito:groups',
                matchType: RoleMappingMatchType.CONTAINS,
                roleArn: this.cdlStandardUserRole.roleArn,
                value: 'Standard-Users',
              },
            ],
          },
        },
      },
    })

    // -- COGNITO USER POOL GROUPS
    const cdlAdminUserPoolGroup = new CfnUserPoolGroup(this, 'cdlAdmin', {
      userPoolId: userPool.userPoolId,
      description: 'Admin user group',
      groupName: 'Admin',
      precedence: 1,
      roleArn: cdlAdminUserRole.roleArn,
    })
    cdlAdminUserPoolGroup.node.addDependency(cdlAdminUserRole)
    new CfnUserPoolGroup(this, 'cdlStandard', {
      userPoolId: userPool.userPoolId,
      groupName: 'Standard-Users',
      description: 'Standard user group',
      precedence: 2,
      roleArn: this.cdlStandardUserRole.roleArn,
    })

    // Create an initial admin user with the email address provided in the CDK context
    const adminUser = new CfnUserPoolUser(this, 'cdlDefaultAdminUser', {
      userPoolId: userPool.userPoolId,
      desiredDeliveryMediums: ['EMAIL'],
      userAttributes: [
        {
          name: 'email',
          value: props.adminEmail,
        },
        {
          name: 'given_name',
          value: 'Carbon Data Lake',
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
    cfnUserPoolUserToGroupAttachment.node.addDependency(cdlAdminUserPoolGroup)

    // Create the GraphQL api and provide the schema.graphql file
    const api = new GraphqlApi(this, 'cdlApi', {
      name: 'cdlApi',
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
        fieldLogLevel: FieldLogLevel.ALL
      },
      // Uncomment the below line to enable AWS X-Ray distributed tracing for this api
      xrayEnabled: true
    })

    NagSuppressions.addResourceSuppressions(api, [{ 
      id: 'AwsSolutions-ASC3', 
      reason: 'Request level access logging disabled for sample code.' 
    }])

    // Set the public variables so other stacks can access the deployed graphqlUrl & apiId as well as set as CloudFormation output variables
    this.graphqlUrl = api.graphqlUrl
    new CfnOutput(this, 'graphqlUrl', { value: api.graphqlUrl })
    this.apiId = api.apiId
    new CfnOutput(this, 'apiId', { value: api.apiId })


    // Push data to s3 raw s3 bucket
    const landingBucketDataSource = api.addHttpDataSource('landingBucketDataSource', `https://${props.landingBucket.bucketName}.s3.amazonaws.com`, {
      name: 'landingBucketDataSource',
      description: 'Raw bucket data source',
      authorizationConfig: {
        signingRegion: cdk.Stack.of(this).region,
        signingServiceName: 's3',
      },
    });
    props.landingBucket.grantPut(landingBucketDataSource)

    landingBucketDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createActivity',
      requestMappingTemplate: MappingTemplate.fromString(`{
        "version": "2018-05-29",
        "method": "PUT",
        "resourcePath": "/$ctx.args.input.activity_event_id",
        "params": {
          "body": "#foreach ($key in $ctx.args.input.keySet()) $key,#end\\n#foreach ($key in $ctx.args.input.keySet()) $ctx.args.input[$key],#end",
          "headers": {
            "Content-Type": "application/json"
          }
        }
      }`),
      responseMappingTemplate: MappingTemplate.fromString(`$util.toJson($ctx.args.input)`),
    });

    // Add a DynamoDB datasource. The DynamoDB table we will use is created by another stack
    // and is provided in the props of this stack.
    const datasource = api.addDynamoDbDataSource('CalculatorOutputDataSource', props.calculatorOutputTableRef, {
      name: 'CalculatorOutputDataSource',
    })

    datasource.createResolver({
      typeName: 'Query',
      fieldName: 'getActivity',
      requestMappingTemplate: MappingTemplate.dynamoDbGetItem('activity_event_id', 'id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })

    datasource.createResolver({
      typeName: 'Query',
      fieldName: 'listActivities',
      requestMappingTemplate: MappingTemplate.fromString(`{
                "version": "2018-05-29",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })


    // -- Outputs --
    // Set the public variables so other stacks can access the deployed auth/auz related stuff above as well as set as CloudFormation output variables

    // Cognito

    this.userPoolIdOutput = new CfnOutput(this, 'cdluserPoolId', {
      value: userPool.userPoolId,
      exportName: 'cdluserPoolId'
    })

    this.identityPoolIdOutputId = new CfnOutput(this, 'identityPoolId', {
      value: this.cdlIdentityPool.ref,
      exportName: 'CLQidentityPoolId'
    })

    this.userPoolClientIdOutput = new CfnOutput(this, 'userPoolClientId', {
       value: userPoolClient.userPoolClientId,
       exportName: 'cdluserPoolClientId'
      })

    // IAM
    this.cdlAdminUserRole = cdlAdminUserRole
    new CfnOutput(this, 'cdlAdminUserRoleOutput', {
      value: this.cdlAdminUserRole.roleArn,
      exportName: 'cdlcdlAdminUserRoleOutput'
    })

    new CfnOutput(this, 'cdlStandardUserRoleOutput', {
      value: this.cdlStandardUserRole.roleArn,
      exportName: 'cdlcdlStandardUserRoleOutput'
    })

    // Output API Endpoint
    new cdk.CfnOutput(this, 'apiEndpoint', {
      value: this.graphqlUrl,
      description: 'Base http endpoint for CarbonLake Quickstart GraphQL API',
      exportName: 'cdlApiEndpoint',
    });

    // Output API Username (password will be email to admin user on create)
    new cdk.CfnOutput(this, 'adminUsername', {
      value: adminUser.username ?? '' ,
      description: 'Admin username created on build for GraphQL API',
      exportName: 'cdlApiUsername',
    });

    // Output Appsync Query Link
    new cdk.CfnOutput(this, 'graphqueryTestUrl', {
      value: `https://${this.region}.console.aws.amazon.com/appsync/home?region=${this.region}#/${this.apiId}/v1/queries`,
      description: 'URL for testing AppSync GraphQL API queries in the AWS console.',
      exportName: 'cdlGraphQLTestQueryURL',
    });

    cdk.Tags.of(this).add("component", "graphQLApi");

  }
}
