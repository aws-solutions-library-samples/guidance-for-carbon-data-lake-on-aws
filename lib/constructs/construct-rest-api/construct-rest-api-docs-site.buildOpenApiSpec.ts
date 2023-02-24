import { CdkCustomResourceResponse, Context, CdkCustomResourceEvent } from 'aws-lambda';
import aws from "aws-sdk";
import editJsonFile from "edit-json-file";
import fs from "fs";
import activityJsonSchamea from "./schemas/activity-schema.json";

export const handler = async (event: CdkCustomResourceEvent, context: Context,): Promise<CdkCustomResourceResponse> => {
  console.log('Lambda is invoked with:' + JSON.stringify(event));

  const response: CdkCustomResourceResponse = {
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Status: 'SUCCESS'
  };

  if (process.env.API_ID && process.env.BUCKET_NAME && process.env.OPEN_API_SPEC_KEY_NAME) {
    const apiId = process.env.API_ID;
    const bucketName = process.env.BUCKET_NAME;
    const openApiSpecKeyName = process.env.OPEN_API_SPEC_KEY_NAME;

    if (event.RequestType == 'Create' || event.RequestType == 'Update') {
      // Export the OpenAPI spec from the deployed HTTP API
      const openApiSpec = await new aws.ApiGatewayV2().exportApi({
        ApiId: apiId,
        Specification: 'OAS30',
        OutputType: 'JSON',
        IncludeExtensions: false
      }).promise();
      const error = openApiSpec.$response.error;
      if (error) {
        console.error(`Error while exporting OpenAPI spec for api id = ${apiId}: ${error}`, error.stack);
        response.Data = { Result: error } ;
        response.Status = 'FAILED';
      } else {
        if (openApiSpec.body) {
          // Create a temp file of the exported OpenAPI spec to make changes to
          const tmpFile = "/tmp/openapi.json";
          fs.writeFileSync(tmpFile, openApiSpec.body.toString());

          // Use the editJsonFile lib to make easy modifications to the OpenAPI spec json
          const jsonFile = editJsonFile(tmpFile, {
            // Save the file as it is changed
            autosave: true
          });
          
          // Add the Activity JSON schema
          jsonFile.set("components.schemas.Activity", activityJsonSchamea);

          // Set a list of Activity JSON schema objects as the requestBody for POST /activities
          jsonFile.set("paths./activities.post.requestBody", {
            "description": "A list of activities to be processed",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Activity"
                  }
                }
              }
            },
            "required": true
          }, { preservePaths: false });

          // Add a standard API response object
          jsonFile.set("components.responses.Standard", {
            "description": "An error has occured. Interrogate the message and details for more information.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string"
                    },
                    "details": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          });

          // Set the responses for POST /activities
          jsonFile.set("paths./activities.post.responses", {
            "200": {
              "description": "Activities submitted successfully"
            },
            "400": {
              "$ref": "#/components/responses/Standard"
            },
            "500": {
              "$ref": "#/components/responses/Standard",
              "description": "A server error has occured"
            }
          }, { preservePaths: false });

          jsonFile.unset("tags");

          // Upload enhanced OpenAPI spec to S3 bucket for later use
          await new aws.S3().putObject({
            Key: openApiSpecKeyName,
            Bucket: bucketName,
            Body: fs.readFileSync(tmpFile)
          }).promise();
          console.info(`Wrote enhanced OpenAPI spec to S3: ${bucketName}/${openApiSpecKeyName}`)
          response.Data = { Result: 'Success' } ;
        } else {
          response.Data = { Result: 'Body of exported OpenAPI spec is empty or null' } ;
          response.Status = 'FAILED';
        }
      }
    }
  } else {
    response.Data = { Result: 'API_ID, BUCKET_NAME, or OPEN_API_SPEC_KEY_NAME env var missing' } ;
    response.Status = 'FAILED';
  }

  return response;
};