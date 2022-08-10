import { Stack, StackProps, Names } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import * as cfninc from 'aws-cdk-lib/cloudformation-include'
import { Construct } from 'constructs'
import * as path from 'path'

interface CarbonlakeGitlabMirroringStackProps extends StackProps {
  repoName: any
}

export class CarbonlakeGitlabMirroringStack extends Stack {
  constructor(scope: Construct, id: string, props: CarbonlakeGitlabMirroringStackProps) {
    super(scope, id, props)

    // Create new IAM user with permissions to access codecommit repository (from CFN template)
    const template = new cfninc.CfnInclude(this, 'Template', {
      templateFile: path.join(
        process.cwd(),
        'lib',
        'ci-cd',
        'gitlab-mirroring-aws-remove-later',
        'cfn',
        'carbonlake-gitlab-mirroring-cloudformation.yaml'
      ),
      preserveLogicalIds: false,
      parameters: {
        CodeCommitRepositoryName: props.repoName,
      },
    })
  }
}
