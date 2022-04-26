import { App, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';                 // core constructs
import { aws_s3 as s3 } from 'aws-cdk-lib';

export class CarbonlakeQuickstartStorageStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        const carbonlakeProcessedDataBucket = new s3.Bucket(this, 'carbonlakeProcessedDataBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
          });
        
        const carbonlakeCuratedDataBucket = new s3.Bucket(this, 'carbonlakeCuratedDataBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
          });
    
        // Output bucket reference for nested stacks
        new CfnOutput(this, 'myBucketRef', {
        value: carbonlakeProcessedDataBucket.bucketName,
        description: 'The name of the processed data s3 bucket',
        exportName: 'carbonlakeProcessedDataBucket',
        });
    
    }
}