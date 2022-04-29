import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


interface CarbonLakeDataCompactionHistoricalCrawlerStackProps extends NestedStackProps {
  enrichedBucket: cdk.aws_s3.Bucket;
}

export class CarbonLakeDataCompactionHistoricalCrawlerStack extends NestedStack {
  public readonly glueHistoricalCalculatorCrawler: cdk.aws_glue.CfnCrawler;

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
        
        this.glueHistoricalCalculatorCrawler = new cdk.aws_glue.CfnCrawler(this, 'GlueHistoricalCalculatorDataCrawler', {
          role: role.roleArn,
          name: 'glue-historical-calculator-data-crawler',
          description: 'AWS Glue crawler to load new partitions of historical data',
          targets: {
            s3Targets: [
              {
                path: `s3://${props.enrichedBucket.bucketName}/historical`,
              },
            ],
          },
          databaseName: 'enriched-calculator-data',
          // the properties below are optional
          recrawlPolicy: {
            recrawlBehavior: 'CRAWL_NEW_FOLDERS_ONLY',
          }
        });
    }
}