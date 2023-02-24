import { CdkCustomResourceEvent, CdkCustomResourceResponse, Context } from 'aws-lambda'
import express from 'express'
import serverless from 'serverless-http'
import swaggerUI from 'swagger-ui-express'
import aws from "aws-sdk";

const app = express()
const s3 = new aws.S3();

export const handler = async (event: CdkCustomResourceEvent, context: Context,): Promise<CdkCustomResourceResponse> => {
  if (process.env.BUCKET_NAME && process.env.KEY_NAME) {
    // Get the OpenAPI spec from the provided S3 bucket
    const getOpenApiSpcResult = await s3.getObject({
      Bucket: process.env.BUCKET_NAME,
      Key: process.env.KEY_NAME
    }).promise();

    const error = getOpenApiSpcResult.$response.error;
    if (error) {
      console.error(`Error while getting OpenAPI spec from S3: ${error}`, error.stack);
      return {
        statusCode: 500,
        body: error.message,
      }
    } else if (!getOpenApiSpcResult.Body) {
      console.error('Body of OpenAPI spec is empty or null');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Body of OpenAPI spec is empty or null'}),
      }
    } else {
      // Serve up the retrieved OpenAPI spec via Swagger
      app.use(
        '/swagger',
        swaggerUI.serve,
        swaggerUI.setup(JSON.parse(getOpenApiSpcResult.Body.toString()))
      )
  
      const serverlessHandler = serverless(app, {
        provider: "aws",
      });
  
      return serverlessHandler(event, context);
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Invalid configuration"}),
    }
  }
};