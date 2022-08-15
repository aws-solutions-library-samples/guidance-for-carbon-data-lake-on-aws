import { Stack, StackProps, Names, CfnOutput } from 'aws-cdk-lib'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import { aws_iam as iam } from 'aws-cdk-lib'
import { aws_glue as glue } from 'aws-cdk-lib'
import * as cfninc from 'aws-cdk-lib/cloudformation-include'
import { Construct } from 'constructs'
import * as path from 'path'

interface CLQSQuicksightStackProps extends StackProps {
  enrichedBucket: s3.Bucket
  quicksightUserName?: string
  enrichedDataDatabase: glue.CfnDatabase
}

export class CLQSQuicksightStack extends Stack {
  constructor(scope: Construct, id: string, props: CLQSQuicksightStackProps) {
    super(scope, id, props)

    // Update Quicksight IAM role to allow access to enriched data S3 bucket
    const quicksightS3AccessPolicy = new iam.PolicyStatement({
      resources: [
        `arn:aws:s3:::${props.enrichedBucket.bucketName}`,
        `arn:aws:s3:::${props.enrichedBucket.bucketName}/*`,
      ],
      actions: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
      effect: iam.Effect.ALLOW,
    })

    // Attach S3 access policy to Quicksight managed role
    const role = iam.Role.fromRoleArn(this, 'Role', `arn:aws:iam::${this.account}:role/aws-quicksight-service-role-v0`)
    role.addToPrincipalPolicy(quicksightS3AccessPolicy)

    // Create unique identifier to be appended to QuickSight resources
    const quicksightUniqueIdentifier = `CarbonLake-Combined-Emissions-${Names.uniqueId(role).slice(-8)}`

    // Create Quicksight data source, data set, template and dashboard via CloudFormation template
    const template = new cfninc.CfnInclude(this, 'Template', {
      templateFile: path.join(
        process.cwd(),
        'lib',
        'stacks',
        'stack-quicksight',
        'cfn',
        'carbonlake-qs-quicksight-cloudformation.yaml'
      ),
      preserveLogicalIds: false,
      parameters: {
        Region: this.region,
        Username: props.quicksightUserName ?? '',
        Unique_Identifier: quicksightUniqueIdentifier,
        EnrichedDataDatabaseName: props.enrichedDataDatabase.ref,
      },
    })

    new CfnOutput(this, 'QuickSightDataSource', {
      value: `${quicksightUniqueIdentifier}-Athena-DataSource`,
      description:
        'ID of QuickSight Data Source Connector Athena Emissions dataset. Use this connector to create additional QuickSight datasets based on Athena dataset',
    })

    new CfnOutput(this, 'QuickSightDataSet', {
      value: `${quicksightUniqueIdentifier}-Data-Set`,
      description:
        'ID of pre-created QuickSight DataSet, based on Athena Emissions dataset. Use this pre-created dataset to create new dynamic analyses and dashboards',
    })

    new CfnOutput(this, 'QuickSightDashboard', {
      value: `${quicksightUniqueIdentifier}-Dashboard`,
      description:
        'ID of pre-created QuickSight Dashboard, based on Athena Emissions dataset. Embed this pre-created dashboard directly into your user facing applications',
    })
  }
}
