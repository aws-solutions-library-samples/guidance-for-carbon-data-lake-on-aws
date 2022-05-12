import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_events as events} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface CarbonLakeEventTriggerStateMachineStackProps extends NestedStackProps {
  stateMachineName: any;
}

export class CarbonLakeEventTriggerStateMachineStack extends NestedStack {
  public readonly eventRule: events.CfnRule;

  constructor(scope: Construct, id: string, props: CarbonLakeEventTriggerStateMachineStackProps) {
    super(scope, id, props);

    /** CREATE EVENT BRIDGE EVENT TO TRIGGER STATE MACHINE */
    const eventRulePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['*'], //TODO: limit the scope of permission here
          actions: [
            "states:StartExecution"
          ],
          effect: iam.Effect.ALLOW,
        })
      ],
    });

    const eventRuleRole = new iam.Role(this, 'event-bridge-event-rule-role', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
      description: 'IAM role to be assumed by Event Bridge Event Rule',
      inlinePolicies: {
        // 👇 attach the Policy Document as inline policies
        EventTriggerStateMachine: eventRulePolicy,
      }
    });


    this.eventRule = new events.CfnRule(this, 'TriggerDataCompactionStateMachineRule', {
      description: 'Trigger daily data compaction pipeline at 12AM UTC',
      eventBusName: 'default',
      name: props.stateMachineName,
      roleArn: eventRuleRole.roleArn,
      scheduleExpression: 'cron(0 1 * * ? *)',
      targets: [{
        arn: `arn:aws:states:${this.region}:${this.account}:stateMachine:${props.stateMachineName}`,
        id: props.stateMachineName,
        roleArn: eventRuleRole.roleArn
      }]
     });

  }
}