// -- AWS AMPLIFY CONFIGURATION PARAMETERS --

// Existing API
const existingAPI = {
  // ...
  API: {
    aws_appsync_graphqlEndpoint: 'https://abcedfg123456.appsync-api.YOUR-AWS-REGION.amazonaws.com/graphql', // Replace with your GraphQL Endpoint
    aws_appsync_region: 'YOUR-AWS-REGION', // Replace with the region you deployed CDK with
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS', // No touchy
  }

}

// Existing Auth
const existingAuth = {
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:52468e33-f23a-4ae2-92ca-071bd1bcb366',

    // REQUIRED - Amazon Cognito Region
    region: 'YOUR-AWS-REGION', // Replace with the region you deployed CDK with

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: 'YOUR-AWS-REGION',

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: 'YOUR-AWS-REGOIN_abc123', // Replace with your User Pool ID

    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'abcdefg123456', // Replace with your User Pool Web Client ID

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - Hosted UI configuration
    oauth: {
        domain: 'your_cognito_domain',
        scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: 'http://localhost:3000/',
        redirectSignOut: 'http://localhost:3000/',
        responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
}

// Amplify.configure(existingAuth);
export {existingAPI, existingAuth}

