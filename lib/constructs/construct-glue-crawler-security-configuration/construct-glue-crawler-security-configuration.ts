import { Construct } from 'constructs';
import * as glue_alpha from '@aws-cdk/aws-glue-alpha';
import { aws_kms as kms } from 'aws-cdk-lib';
  
  export class GlueCrawlerSecurityConfig extends  glue_alpha.SecurityConfiguration { 
    /**
        * This construct provides a pre-configured glue crawler
        * security configuration that defaults to encrypted Cloudwatch logs
        * and job bookmark decryption.
        * @param scope
        * @param id
        * @param glue_alpha.SecurityConfigurationProps
    */
    constructor(scope: Construct, id: string, props: glue_alpha.SecurityConfigurationProps) {
        super(scope, id, {
          ...props,
          /** 
             * Creates a default glue crawler security configuration
            */
          cloudWatchEncryption: {
            mode: glue_alpha.CloudWatchEncryptionMode.KMS,
            kmsKey: new kms.Key(scope, `${id}CloudwatchKey`, {
              enableKeyRotation: true,
            })
          },
          jobBookmarksEncryption: {
            mode: glue_alpha.JobBookmarksEncryptionMode.CLIENT_SIDE_KMS,
            kmsKey: new kms.Key(scope, `${id}JobBookmarkKey`, {
              enableKeyRotation: true,
            })
          },
          s3Encryption: {
            mode: glue_alpha.S3EncryptionMode.KMS,
            kmsKey: new kms.Key(scope, `${id}S3Key`, {
              enableKeyRotation: true,
            })
          },
        } 
          );
  }
  }