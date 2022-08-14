import { Stage, StageProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CLQSStack } from '../../../carbonlake-quickstart-stack'

export class CLQSPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props)

    new CLQSStack(this, 'WebService')
  }
}
