import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as cfninc from 'aws-cdk-lib/cloudformation-include';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';

interface CarbonlakeDataCompactionStateMachineStackProps extends NestedStackProps {
  glueCompactionJobName: any,
  glueDataFlushJobName: any,
  createIndividualAthenaViewsLambda: lambda.Function,
  createCombinedAthenaViewLambda: lambda.Function,
  definitionS3Location: s3.Bucket
}

export class CarbonlakeDataCompactionStateMachineStack extends NestedStack {
  public readonly stateMachine: sfn.CfnStateMachine;

  constructor(scope: Construct, id: string, props: CarbonlakeDataCompactionStateMachineStackProps) {
    super(scope, id, props);

    // Create IAM role to be assumed by state machine
    const stepFunctionsExecutionPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            "logs:CreateLogDelivery",
            "logs:GetLogDelivery",
            "logs:UpdateLogDelivery",
            "logs:DeleteLogDelivery",
            "logs:ListLogDeliveries",
            "logs:PutResourcePolicy",
            "logs:DescribeResourcePolicies",
            "logs:DescribeLogGroups"
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            "glue:StartJobRun",
            "glue:GetJobRun",
            "glue:GetJobRuns",
            "glue:BatchStopJobRun"
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: [
            `${props.createIndividualAthenaViewsLambda.functionArn}:*`,
            `${props.createCombinedAthenaViewLambda.functionArn}:*`,
            `${props.createIndividualAthenaViewsLambda.functionArn}`,
            `${props.createCombinedAthenaViewLambda.functionArn}`
          ],
          actions: [
            "lambda:InvokeFunction"
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            "xray:PutTraceSegments",
            "xray:PutTelemetryRecords",
            "xray:GetSamplingRules",
            "xray:GetSamplingTargets"
          ],
          effect: iam.Effect.ALLOW,
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            "glue:*"
          ],
          effect: iam.Effect.ALLOW,
        }),
      ],
    });

    // Create IAM Role to be assumed by Step Functions State Machine
    const stateMachineRole = new iam.Role(this, 'carbonlake-data-compaction-state-machine-role', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
      description: 'IAM role to be assumed by Step Functions State Machine',
      inlinePolicies: {
        // 👇 attach the Policy Document as inline policies
        StepFunctionExecutionPolicy: stepFunctionsExecutionPolicy,
      }
    });

    // Create Step Functions State Machine
    // const cfnTemplate = new cfninc.CfnInclude(this, 'Template', { 
    //   templateFile: path.join(process.cwd(), 'lib','data-compaction-pipeline', 'statemachine', 'cfn', 'carbonlake-qs-data-compaction-statemachine-stack.yml'),
    //   preserveLogicalIds: false,
    //   parameters: {
    //     dataCompactionJobName: props.glueCompactionJobName,
    //     dataFlushJobName: props.glueDataFlushJobName,
    //     createIndividualAthenaViewsLambdaName: props.createIndividualAthenaViewsLambda.functionArn,
    //     createCombinedAthenaViewLambdaName: props.createCombinedAthenaViewLambda.functionArn,
    //     stateMachineRoleArn: stateMachineRole.roleArn,
    //     definitionS3Location: props.definitionS3Location.bucketName
    //   }
    // });

    this.stateMachine = new sfn.CfnStateMachine(this, 'NightlyDataCompactionStateMachine', {
      roleArn: stateMachineRole.roleArn,
    
      // the properties below are optional
      definitionS3Location: {
        bucket: props.definitionS3Location.bucketName,
        key: ''
      },
      definitionSubstitutions: {
        dataCompactionJobName: 'definitionSubstitutions',
        dataFlushJobName: 'dataFlushJobName',
        createIndividualAthenaViewsLambdaName: 'createIndividualAthenaViewsLambdaName',
        createCombinedAthenaViewLambdaName: 'createCombinedAthenaViewLambdaName'
      },
      stateMachineName: 'NightlyDataCompactionStateMachine',
      tracingConfiguration: {
        enabled: true,
      },
    });

    
  }
}
