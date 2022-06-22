import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';

import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

interface DataQualityStackProps extends StackProps {
  inputBucket: s3.Bucket;
  outputBucket: s3.Bucket;
}

/*
  Databrew jobs require a static dataset location at the point of creation
  so it is not possible to create the databrew resources within CDK, as the
  pipleine is expecting to provide an s3 key to be processed. Instead, this
  stack defines a lambda function to handle the deployment and tear down of
  databrew resources to be executed from within the step functions pipeline.
*/
export class DataQualityStack extends Stack {
  public readonly resourcesLambda: lambda.Function;
  public readonly resultsLambda: lambda.Function;
  constructor(scope: Construct, id: string, props: DataQualityStackProps) {
    super(scope, id, props);

    /* ====== PERMISSIONS ====== */

    // role used by the databrew profiling job -> read/write to S3
    const role = new iam.Role(this, "DataQualityProfileRole", {
      assumedBy: new iam.ServicePrincipal('databrew.amazonaws.com'),
      description: 'IAM role to be assumed by Glue DataBrew for Data Quality checks'
    })
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueDataBrewServiceRole"))
    props.inputBucket.grantRead(role);
    props.outputBucket.grantReadWrite(role);

    /* ====== RESOURCES LAMBDA ====== */

    // lambda function to handle setup and teardown of databrew resources
    this.resourcesLambda = new lambda.Function(this, "DataQualityResourcesLambda", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/manage_dq_resources/')),
      handler: "app.lambda_handler",
      timeout: Duration.seconds(60),
      environment: {
        INPUT_BUCKET_NAME: props.inputBucket.bucketName,
        OUTPUT_BUCKET_NAME: props.outputBucket.bucketName,
        PROFILE_JOB_ROLE: role.roleArn
      }
    });

    /* ====== PARSE RESULTS LAMBDA ====== */

    // lambda function to parse the results of the databrew profiling job
    this.resultsLambda = new lambda.Function(this, "DataQualityResultsLambda", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda/parse_results/')),
      handler: "app.lambda_handler",
      timeout: Duration.seconds(60),
      environment: {} // TODO: refactor app to use env var for bucket name
    });
  }
}