
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import { IotToKinesisFirehoseToS3Props, IotToKinesisFirehoseToS3 } from '@aws-solutions-constructs/aws-iot-kinesisfirehose-s3'
import { aws_s3 as s3 } from 'aws-cdk-lib'
import * as cdk from '@aws-cdk/core'


/**
 * Iot ingest stack
 */
export class IotIngestStack extends Stack {
    /**
     * Creates an instance of iot ingest stack.
     * @param scope 
     * @param id 
     * @param [props] 
     */
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        // Import the bucket name for the cdlLandingBucket in the dataPipeline stack and use it as a property of 
        // of the Construct. In stack-data-pipeline.ts, this variable is exported as 'LandingBucketName'.
        const landingBucket = s3.Bucket.fromBucketName(this, "Cdl-Landing-Bucket", cdk.Fn.importValue('LandingBucketName'))

        // Implement the aws-solutions Construct for aws-iot to kinesis firehose to s3, and override some of the defaults (description, and sql).
        // Override the default bucket creation of the Contruct in favor of using our existin bucket object createe in the data pipeline stack and declared above.
        const constructProps: IotToKinesisFirehoseToS3Props = {
            existingBucketObj: landingBucket, // This bucket gets created in the data pipeline stack, so we addded a stack dependency in main.ts to make sure the data pipoeline stack gets created first.

            iotTopicRuleProps: {
                topicRulePayload: {
                    ruleDisabled: false,
                    description: "Process ingested IoT data", // Override Construct description default.
                    sql: "SELECT * FROM 'iot/topic'", // Override Construct sql default.
                    actions: [ // Keep the Construct defaults for streamName, role creation, and logging bucket creation.
                    ],
                }

            }

        }
        new IotToKinesisFirehoseToS3(this, 'iot-ingest-firehose-s3', constructProps);


    }


}


