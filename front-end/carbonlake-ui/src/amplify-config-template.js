// -- AWS AMPLIFY CONFIGURATION PARAMETERS --
// To set up your own amplify app you will need to rename this file as amplify-config.js and follow the instructions in the README to fill in your values
import cdkOutputsJSON from '../../../cdk-outputs.json'
// Existing API
const existingAPI = {
  // ...
  API: {
    aws_appsync_graphqlEndpoint:
      cdkOutputsJSON.ApiStack.graphqlUrl, // Replace with your GraphQL Endpoint
    aws_appsync_region: "us-east-1", // Replace with the region you deployed CDK with
    // aws_appsync_region: cdkOutputsJSON.SharedResources.currentRegion, // Todo - create output for currentRegion
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS", // No touchy
  },
};

// Existing Auth
const existingAuth = {
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: cdkOutputsJSON.ApiStack.identityPoolId,

    // REQUIRED - Amazon Cognito Region
    region: "us-east-1", // Replace with the region you deployed CDK with
    // region: cdkOutputsJSON.SharedResources.currentRegion, // Replace with the region you deployed CDK with

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: "us-east-1",
    // identityPoolRegion: cdkOutputsJSON.SharedResources.currentRegion,

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: cdkOutputsJSON.ApiStack.userPoolId, // Replace with your User Pool ID

    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: cdkOutputsJSON.ApiStack.userPoolClientId, // Replace with your User Pool Web Client ID

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - Hosted UI configuration
    oauth: {
      domain: "your_cognito_domain",
      scope: [
        "phone",
        "email",
        "profile",
        "openid",
        "aws.cognito.signin.user.admin",
      ],
      redirectSignIn: "http://localhost:3000/",
      redirectSignOut: "http://localhost:3000/",
      responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
};

const existingS3 = {
  Storage: {
    AWSS3: {
      bucket: cdkOutputsJSON.DataPipelineStack.LandingBucketName, //REQUIRED -  Amazon S3 bucket name
      region: "us-east-1", //Required -  Amazon service region
      // region: cdkOutputsJSON.SharedResources.currentRegion, //Required -  Amazon service region
    },
  },
};

// Amplify.configure(existingAuth);
export { existingAPI, existingAuth, existingS3 };
