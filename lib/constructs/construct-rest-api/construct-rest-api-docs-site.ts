import { Construct } from 'constructs';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { CustomResource, custom_resources as cr, Environment, RemovalPolicy } from 'aws-cdk-lib'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CdlS3 } from '../construct-cdl-s3-bucket/construct-cdl-s3-bucket';

interface RestApiDocsSiteStackProps {
  restHttpApi: HttpApi;
  env?: Environment;
}

export class RestApiDocsSite extends Construct {
  public readonly restApiDocsSiteBucket: Bucket; 
  public readonly restApiSpecFile: string = 'cdl-rest-api-openapi.json';
  public readonly restApiDocsSitePath: string = 'swagger'

  constructor(scope: Construct, id: string, props: RestApiDocsSiteStackProps) {
    super(scope, id)

    // Create the S3 bucket that will contain the artifacts needed for Swagger (i.e OpenAPI spec file)
    this.restApiDocsSiteBucket = new CdlS3(this, 'cdlRestApiDocsSiteBucket', {
    });

    // Create custom resource that builds the OpenAPI spec file from API Gateway and stores it in the above bucket
    const exportOpenapiSpecLambda = new NodejsFunction(this, 'buildOpenApiSpec', {
      environment: {
        API_ID: props.restHttpApi.apiId,
        BUCKET_NAME: this.restApiDocsSiteBucket.bucketName,
        OPEN_API_SPEC_KEY_NAME: this.restApiSpecFile
      },
      initialPolicy: [new PolicyStatement({
        actions: ['apigateway:GET'],
        resources: [`arn:aws:apigateway:${props.env?.region}::/apis/${props.restHttpApi.apiId}/*`],
      })],
    });
    this.restApiDocsSiteBucket.grantReadWrite(exportOpenapiSpecLambda);

    const exportOpenapiSpecProvider = new cr.Provider(this, 'cdlExportOpenapiSpecProvider', {
      onEventHandler: exportOpenapiSpecLambda,
      logRetention: RetentionDays.ONE_DAY
    });

    new CustomResource(this, 'cdlExportOpenapiSpecCustomResource', {
      serviceToken: exportOpenapiSpecProvider.serviceToken
    });

    // Crate lambda that serves the Swagger UI site
    const swaggerLambda = new NodejsFunction(this, 'swagger', {
      environment: {
        BUCKET_NAME: this.restApiDocsSiteBucket.bucketName,
        KEY_NAME: this.restApiSpecFile
      },
      bundling: {
        // For some reason the NodejsFunction does not include this required dependency
        nodeModules: ['swagger-ui-dist'],
      }
    });
    this.restApiDocsSiteBucket.grantRead(swaggerLambda);

    props.restHttpApi.addRoutes({
      path: `/${this.restApiDocsSitePath}`,
      methods: [HttpMethod.ANY],
      integration: new HttpLambdaIntegration(
        'SwaggerApiIntegration',
        swaggerLambda,
      ),
    });

    props.restHttpApi.addRoutes({
      path: `/${this.restApiDocsSitePath}/{proxy+}`,
      methods: [HttpMethod.ANY],
      integration: new HttpLambdaIntegration(
        'SwaggerApiIntegration',
        swaggerLambda,
      ),
    });
  }
}