import { Stack, StackProps } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_events as events } from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface EventTriggerStateMachineProps extends StackProps {
  stateMachineName: any
}

export class EventTriggerStateMachine extends Construct {
  public readonly eventRule: events.CfnRule

  constructor(scope: Construct, id: string, props: EventTriggerStateMachineProps) {
    super(scope, id, props)

    // Create IAM policy for Event Bridge event to trigger State Machine
    const eventRulePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['*'], //TODO: limit the scope of permission here
          actions: ['states:StartExecution'],
          effect: iam.Effect.ALLOW,
        }),
      ],
    })

    // Create IAM role to be assumed by State machine
    const eventRuleRole = new iam.Role(this, 'event-bridge-event-rule-role', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
      description: 'IAM role to be assumed by Event Bridge Event Rule',
      inlinePolicies: {
        EventTriggerStateMachinePolicy: eventRulePolicy,
      },
    })

    // Create Event Bridge Event that runs every night at 12 AM UTC
    // Event triggers the NightlyDataCompaction state machine, assumes IAM role with permissions to trigger state machine
    this.eventRule = new events.CfnRule(this, `trigger-${props.stateMachineName}`, {
      description: 'Trigger daily data compaction pipeline at 12AM UTC',
      eventBusName: 'default',
      name: `trigger-${props.stateMachineName}`,
      roleArn: eventRuleRole.roleArn,
      scheduleExpression: 'cron(0 0 * * ? *)',
      targets: [
        {
          arn: `arn:aws:states:${Stack.of(this).region}:${Stack.of(this).account}:stateMachine:${props.stateMachineName}`,
          id: props.stateMachineName,
          roleArn: eventRuleRole.roleArn,
        },
      ],
    })
  }
}
