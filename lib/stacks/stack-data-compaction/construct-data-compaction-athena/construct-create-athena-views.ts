import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as path from 'path'
import { CdlPythonLambda } from '../../../constructs/construct-cdl-python-lambda-function/construct-cdl-python-lambda-function'
import { CdlS3 } from '../../../constructs/construct-cdl-s3-bucket/construct-cdl-s3-bucket'

export interface CreateAthenaViewsProps extends StackProps {
  enrichedDataDatabase: glue.CfnDatabase
}

export class CreateAthenaViews extends Construct {
  public readonly createIndividualAthenaViewsLambda: lambda.Function
  public readonly createCombinedAthenaViewsLambda: lambda.Function

  constructor(scope: Construct, id: string, props: CreateAthenaViewsProps) {
    super(scope, id)

    const athenaQueryResultsBucket = new CdlS3(this, 'athenaQueryResultsBucket', {
      bucketName: 'athenaQueryResultsBucket'
    })


    // Create IAM policy for Lambda to assume
    const createAthenaViewsLambdaRolePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: [
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}`,
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}/*`,
          ],
          actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: [
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}`,
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}/*`,
          ],
          actions: [
            's3:DeleteObject*',
            's3:PutObject',
            's3:PutObjectLegalHold',
            's3:PutObjectRetention',
            's3:PutObjectTagging',
            's3:PutObjectVersionTagging',
            's3:Abort*',
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: [
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}`,
            `arn:aws:s3:::${athenaQueryResultsBucket.bucketName}/*`,
            `arn:aws:athena:${Stack.of(this).region}:${Stack.of(this).account}:workgroup/primary`,
          ],
          actions: [
            'athena:GetWorkGroup',
            'athena:StartQueryExecution',
            'athena:StopQueryExecution',
            'athena:GetQueryExecution',
            'athena:GetQueryResults',
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: [
            `arn:aws:glue:${Stack.of(this).region}:${Stack.of(this).account}:catalog`,
            `arn:aws:glue:${Stack.of(this).region}:${Stack.of(this).account}:database/${props.enrichedDataDatabase.ref}`,
            `arn:aws:glue:${Stack.of(this).region}:${Stack.of(this).account}:table/${props.enrichedDataDatabase.ref}/*`,
          ],
          actions: [
            'glue:CreateDatabase',
            'glue:DeleteDatabase',
            'glue:GetDatabase',
            'glue:GetDatabases',
            'glue:UpdateDatabase',
            'glue:CreateTable',
            'glue:DeleteTable',
            'glue:BatchDeleteTable',
            'glue:UpdateTable',
            'glue:GetTable',
            'glue:GetTables',
            'glue:BatchCreatePartition',
            'glue:CreatePartition',
            'glue:DeletePartition',
            'glue:BatchDeletePartition',
            'glue:UpdatePartition',
            'glue:GetPartition',
            'glue:GetPartitions',
            'glue:BatchGetPartition',
          ],
          effect: iam.Effect.ALLOW,
        }),
      ],
    })
    const lambdaPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')

    // Create IAM Role to be assumed by Lambda
    const role = new iam.Role(this, 'create-athena-views-lambda-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'IAM role to be assumed by Lambda to create Athena views',
      inlinePolicies: {
        LambdaAthenaPolicy: createAthenaViewsLambdaRolePolicy,
      },
    })
    role.addManagedPolicy(lambdaPolicy)

    // Lambda function that creates today & historical Athena views
    this.createIndividualAthenaViewsLambda = new CdlPythonLambda(this, 'CDLIndividualAthenaViewsHandler', {
      lambdaName: 'CDLIndividualAthenaViewsHandler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      role: role,
      handler: 'createIndividualAthenaViews.lambda_handler',
      description:
        'Lambda function for creating Athena views representing recent and historical formatted emissions data',
      environment: {
        ATHENA_QUERY_OUTPUT_LOCATION: athenaQueryResultsBucket.bucketName,
        GLUE_DATABASE_NAME: props.enrichedDataDatabase.ref,
      },
    })

    // Lambda function that creates combined emissions Athena view
    this.createCombinedAthenaViewsLambda = new CdlPythonLambda(this, 'CDLCombinedAthenaViewHandler', {
      lambdaName: 'CDLCombinedAthenaViewHandler',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      role: role,
      handler: 'createCombinedAthenaView.lambda_handler',
      description: 'Lambda function for creating Athena view representing combined formatted emissions data',
      environment: {
        ATHENA_QUERY_OUTPUT_LOCATION: athenaQueryResultsBucket.bucketName,
        GLUE_DATABASE_NAME: props.enrichedDataDatabase.ref,
      },
    })
  }
}
