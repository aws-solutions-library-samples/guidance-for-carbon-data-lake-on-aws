import { APIGatewayEventRequestContextV2, APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from 'aws-lambda';
import Ajv, { ErrorObject } from "ajv"
import activityJsonSchamea from "./schemas/activity-schema.json";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';

interface ApiResponse {
  message: string,
  details: string[],
}

export const handler = async (event: APIGatewayProxyEventV2, context: APIGatewayEventRequestContextV2): Promise<APIGatewayProxyResultV2> => {
  let statusCode = 200;
  const apiResponse: ApiResponse = {
    message: "Data submitted successfully",
    details: []
  };

  const ajv = new Ajv();
  const validate = ajv.compile(activityJsonSchamea);
  
  switch (event.requestContext.http.method) {
    case "POST":
      if (event.body) {
        const body:any[] = JSON.parse(event.body);
        if (Array.isArray(body)) {
          let validationErrors = false;
          body.forEach((activity:any) => {
            // Validate that the provided body adheres to the json schema that was generated.
            // You must parse the string body to JSON before validation as the validator is expecting
            // a JSON object not a string
            if (!validate(activity)) {
              validationErrors = true;
              statusCode = 400
              apiResponse.message = "Invalid body";
              apiResponse.details = apiResponse.details.concat(parseValidationErrorDetails(activity.activity_event_id, validate.errors));
              console.log(validate.errors)
            }
          });

          if (!validationErrors) {
            if (process.env.LANDING_BUCKET) {
              try {
                const uuid = uuidv4();
                const params:S3.Types.PutObjectRequest = {
                  Bucket: process.env.LANDING_BUCKET,
                  Key: uuid,
                  Body: JSON.stringify(body)
                }
                const s3PutRsult = await new S3().putObject(params).promise();
                const error = s3PutRsult.$response.error;
                if (error) {
                  statusCode = 500
                  apiResponse.message = error.message;
                  console.error(`Error while uploading to S3: ${error}`, error.stack);
                } else {
                  console.log(`Data uploaded to S3 successfully. Bucket = ${process.env.LANDING_BUCKET} | Key = ${uuid}`);
                }
              } catch (error) {
                statusCode = 500
                apiResponse.message = `Error while uploading to S3: ${error}`;
                console.error(`Error while uploading to S3: ${error}`);
              }
            } else {
              statusCode = 500
              apiResponse.message = "Lambda function is not configured correctly. Landing S3 bucket has not been provided in the environment variables.";
            }
          }
        } else {
          statusCode = 400
          apiResponse.message = "Request body must be an array of JSON Activity objects"
        }
      } else {
        statusCode = 400
        apiResponse.message = "You must provide a body"
      }
      break;
    case "GET":
      //TODO: Write code to get an activity from DDB
      apiResponse.message = "Needs to be implemented"
      break;
    default:
      statusCode = 400
      apiResponse.message = "Unsupported HTTP method"
  }

  return {
    statusCode: statusCode,
    body: JSON.stringify(apiResponse),
  };
};

function parseValidationErrorDetails(activity_event_id: string, errors: ErrorObject[] | null | undefined): string[] {
  const errorDetails: string[] = []; 
  if (errors) {
    errors.forEach((error: ErrorObject) => {
      if (error.dataPath) {
        errorDetails.push(`activity_event_id = ${activity_event_id}: ${error.dataPath} | ${error.message}`);
      } else {
        errorDetails.push(`activity_event_id = ${activity_event_id}: ${error.message}`);
      }
    });
  }

  return errorDetails;
}