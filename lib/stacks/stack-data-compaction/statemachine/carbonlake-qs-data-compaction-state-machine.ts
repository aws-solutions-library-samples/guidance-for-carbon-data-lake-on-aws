import { NestedStack, NestedStackProps, Names } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_sqs as sqs } from 'aws-cdk-lib'
import { aws_lambda as lambda } from 'aws-cdk-lib'
import { aws_stepfunctions as sfn } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface CarbonlakeDataCompactionStateMachineStackProps extends NestedStackProps {
  glueCompactionJobName: any
  glueDataFlushJobName: any
  glueHistoricalCalculatorCrawlerName: any
  createIndividualAthenaViewsLambda: lambda.Function
  createCombinedAthenaViewLambda: lambda.Function
  stateMachineS3Bucket: s3.Bucket
  enemerateDirectoriesFunction: lambda.Function
}

export class CarbonlakeDataCompactionStateMachineStack extends NestedStack {
  public readonly stateMachineName: any

  constructor(scope: Construct, id: string, props: CarbonlakeDataCompactionStateMachineStackProps) {
    super(scope, id, props)

    // Create IAM role to be assumed by state machine
    const stepFunctionsExecutionPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            'logs:CreateLogDelivery',
            'logs:GetLogDelivery',
            'logs:UpdateLogDelivery',
            'logs:DeleteLogDelivery',
            'logs:ListLogDeliveries',
            'logs:PutResourcePolicy',
            'logs:DescribeResourcePolicies',
            'logs:DescribeLogGroups',
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: ['glue:StartJobRun', 'glue:GetJobRun', 'glue:GetJobRuns', 'glue:BatchStopJobRun'],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: [
            `${props.createIndividualAthenaViewsLambda.functionArn}:*`,
            `${props.createCombinedAthenaViewLambda.functionArn}:*`,
            `${props.createIndividualAthenaViewsLambda.functionArn}`,
            `${props.createCombinedAthenaViewLambda.functionArn}`,
            `${props.enemerateDirectoriesFunction.functionArn}`,
          ],
          actions: ['lambda:InvokeFunction'],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
            'xray:GetSamplingRules',
            'xray:GetSamplingTargets',
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: ['glue:*'],
          effect: iam.Effect.ALLOW,
        }),
      ],
    })

    // Create IAM Role to be assumed by Step Functions State Machine
    const stateMachineRole = new iam.Role(this, 'carbonlake-data-compaction-state-machine-role', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
      description: 'IAM role to be assumed by Step Functions State Machine',
      inlinePolicies: {
        StepFunctionExecutionPolicy: stepFunctionsExecutionPolicy,
      },
    })

    // Create unique name for state machine that will be used to trigger Event Bridge Event
    this.stateMachineName = `NightlyDataCompactionStateMachine-${Names.uniqueId(stateMachineRole).slice(-8)}`

    // Create Step Functions State Machine using JSON definition stored in S3
    const stateMachine = new sfn.CfnStateMachine(this, this.stateMachineName, {
      roleArn: stateMachineRole.roleArn,

      // the properties below are optional
      definitionS3Location: {
        bucket: props.stateMachineS3Bucket.bucketName,
        key: 'stateMachineDefinition.json',
      },
      definitionSubstitutions: {
        dataCompactionJobName: props.glueCompactionJobName,
        dataFlushJobName: props.glueDataFlushJobName,
        historicalCalculatorCrawlerName: props.glueHistoricalCalculatorCrawlerName,
        createIndividualAthenaViewsLambdaName: props.createIndividualAthenaViewsLambda.functionName,
        createCombinedAthenaViewLambdaName: props.createCombinedAthenaViewLambda.functionName,
        enemerateDirectoriesFunction: props.enemerateDirectoriesFunction.functionName,
      },
      stateMachineName: this.stateMachineName,
      tracingConfiguration: {
        enabled: true,
      },
    })
  }
}
