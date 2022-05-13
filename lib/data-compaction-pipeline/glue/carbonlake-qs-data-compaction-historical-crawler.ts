import { NestedStack, NestedStackProps, Names } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface CarbonLakeDataCompactionHistoricalCrawlerStackProps extends NestedStackProps {
  enrichedBucket: cdk.aws_s3.Bucket;
  enrichedDataDatabase: cdk.aws_glue.CfnDatabase;
}

export class CarbonLakeDataCompactionHistoricalCrawlerStack extends NestedStack {
  public readonly glueHistoricalCalculatorCrawlerName: any;

    constructor(scope: Construct, id: string, props: CarbonLakeDataCompactionHistoricalCrawlerStackProps) {
        super(scope, id, props);

        // Create IAM policy for Glue to assume
        const glueCrawlerPolicy = new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              resources: [
                `arn:aws:s3:::${props.enrichedBucket.bucketName}`,
                `arn:aws:s3:::${props.enrichedBucket.bucketName}/*`
              ],
              actions: [
                "s3:GetObject",
                "s3:PutObject"
              ],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
          ],
        });
        const gluePolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole");

        // Create IAM Role to be assumed by Glue
        const role = new cdk.aws_iam.Role(this, 'carbonlake-glue-historical-calculator-data-crawler-role', {
          assumedBy: new cdk.aws_iam.ServicePrincipal('glue.amazonaws.com'),
          description: 'IAM role to be assumed by Glue crawler job',
          inlinePolicies: {
            GlueDataCrawlerPolicy: glueCrawlerPolicy,
          }
        });
        role.addManagedPolicy(gluePolicy);

        // create unique name for data crawler that will be used to trigger in state machine
        this.glueHistoricalCalculatorCrawlerName = `glue-historical-calculator-data-crawler-${Names.uniqueId(role).slice(-8)}`;

        
        // Create Glue crawler to update partitions in metadata catalog table for historical calculator records
        const glueHistoricalCalculatorCrawler = new cdk.aws_glue.CfnCrawler(this, this.glueHistoricalCalculatorCrawlerName, {
          role: role.roleArn,
          name: this.glueHistoricalCalculatorCrawlerName,
          description: 'AWS Glue crawler to load new partitions of historical data',
          targets: {
            s3Targets: [
              {
                path: `s3://${props.enrichedBucket.bucketName}/historical/`,
              },
            ],
          },
          databaseName: props.enrichedDataDatabase.ref
        });
    }
}