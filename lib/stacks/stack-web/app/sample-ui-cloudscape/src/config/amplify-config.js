/* eslint-disable no-undef */
// -- AWS AMPLIFY CONFIGURATION PARAMETERS --
// ------------------------------------------
// ## These configuration parameters are dynamically generated at build ##
// ## They are passed from environmental variables in the CDK Amplify App ##
// ## This configuration file is rebuilt using those env variables every time it's deployed ##
// ------------------------------------------
const AmplifyConfig = {

// Existing API
   API: {
    aws_appsync_graphqlEndpoint: import.meta.env.VITE_GRAPH_QL_URL, // Replace with your GraphQL Endpoint
    aws_appsync_region: import.meta.env.VITE_REGION, // Replace with the region you deployed CDK with
    // aws_appsync_region: `${import.meta.env.VITE_SharedResources.currentRegion, // Todo - create output for currentRegion
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS", // No touchy
  },

  // Existing Auth
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,

    // REQUIRED - Amazon Cognito Region
    region: import.meta.env.VITE_REGION, // Replace with the region you deployed CDK with

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: import.meta.env.VITE_REGION,

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: import.meta.env.VITE_USER_POOL_ID, // Replace with your User Pool ID

    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID, // Replace with your User Pool Web Client ID

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

  // Existing Storage
  Storage: {
    AWSS3: {
      bucket: import.meta.env.VITE_UPLOAD_BUCKET, //REQUIRED -  Amazon S3 bucket name
      region: import.meta.env.VITE_REGION, //Required -  Amazon service region
    },
  },

}

export { AmplifyConfig }
  
