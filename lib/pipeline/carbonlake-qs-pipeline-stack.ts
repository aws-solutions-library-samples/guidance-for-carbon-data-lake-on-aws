import { App, Stack, StackProps } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_stepfunctions_tasks as tasks } from 'aws-cdk-lib';
import { aws_stepfunctions as sfn } from 'aws-cdk-lib';
import * as path from 'path';

export class CarbonlakeQuickstartPipelineStack extends Stack {
  public readonly inputFunction: lambda.Function;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    /* ======== DEPENDENCIES ======== */

    /* ======== PERMISSIONS ======== */

    /* ======== STEP FUNCTIONS ======== */
  }
}