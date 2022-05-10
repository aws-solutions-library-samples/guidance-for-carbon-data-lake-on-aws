import { Stack, StackProps } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import * as cfninc from 'aws-cdk-lib/cloudformation-include';
import { Construct } from 'constructs';
import * as path from 'path';

interface CarbonlakeQuicksightStackProps extends StackProps {
  enrichedBucket: s3.Bucket;
  adminEmail: any;
}

export class CarbonlakeQuicksightStack extends Stack {
  constructor(scope: Construct, id: string, props: CarbonlakeQuicksightStackProps) {
    super(scope, id, props);

    // Update Quicksight IAM role to allow access to enriched data S3 bucket
    const quicksightS3AccessPolicy = new iam.PolicyStatement({
      resources: [
        `arn:aws:s3:::${props.enrichedBucket.bucketName}`,
        `arn:aws:s3:::${props.enrichedBucket.bucketName}/*`
      ], 
      actions: [ 
        "s3:GetObject*",
        "s3:GetBucket*",
        "s3:List*"
      ],
      effect: iam.Effect.ALLOW,
    });

    // Attach S3 access policy to Quicksight managed role
    const role = iam.Role.fromRoleArn(this, 'Role', `arn:aws:iam::${this.account}:role/aws-quicksight-service-role-v0`);
    role.addToPrincipalPolicy(quicksightS3AccessPolicy);

    // Create Quicksight data source, data set, template and dashboard via CloudFormation template
    const template = new cfninc.CfnInclude(this, 'Template', { 
      templateFile: path.join(process.cwd(), 'lib','quicksight','cfn', 'carbonlake-qs-quicksight-cloudformation.yaml'),
      preserveLogicalIds: false,
      parameters: {
        Region: this.region,
        Email: props.adminEmail
      }
    });
    
  }
}
