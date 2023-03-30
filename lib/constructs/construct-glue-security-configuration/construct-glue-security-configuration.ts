import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_glue as glue, Names } from 'aws-cdk-lib';
import { aws_kms as kms } from 'aws-cdk-lib';
import {v4 as uuidv4} from 'uuid';
import { CloudFrontDistributionS3OriginAccessIdentity } from 'cdk-nag/lib/rules/cloudfront';
  
interface GlueSecurityConfigProps {

  /**
   * Required: set name for security config
   * @default "carbon-data-lake-GlueSecurityConfig"
   */
  readonly name: string
}

export class GlueSecurityConfig extends  Construct { 
    /**
        * This construct provides a pre-configured glue
        * security configuration that defaults to encrypted Cloudwatch logs
        * and client side job bookmark encryption.
        * @param scope
        * @param id
        * @param undefined
    */
    public securityConfiguration: glue.CfnSecurityConfiguration;
    public glueJobCloudwatchKey: kms.Key
    public glueJobBookMarksEncryptionKey: kms.Key

    constructor(scope: Construct, id: string, props: GlueSecurityConfigProps) {  
      super(scope, id)

          const glueJobCloudwatchKey = new kms.Key(this, 'GlueJobCloudwatchKey', {
            enableKeyRotation: true,
          })

          const glueJobBookMarksEncryptionKey = new kms.Key(this, 'GlueJobBookMarksEncryptionKey', {
            enableKeyRotation: true,
          })
      
          this.securityConfiguration = new glue.CfnSecurityConfiguration(this, "SecurityConfig", {
          encryptionConfiguration: {
            cloudWatchEncryption: {
              cloudWatchEncryptionMode: 'SSE-KMS',
              kmsKeyArn: glueJobCloudwatchKey.keyArn,
          },
            jobBookmarksEncryption: {
              jobBookmarksEncryptionMode: 'CSE-KMS',
              kmsKeyArn: glueJobBookMarksEncryptionKey.keyArn,
            },
            s3Encryptions: [{
              s3EncryptionMode: 'SSE-S3',
            }],
          },
          name: `${props.name}-GlueSecurityConfig`,
        })
          
  }
  }