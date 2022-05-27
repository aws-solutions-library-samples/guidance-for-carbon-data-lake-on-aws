
const myAppConfig = {
  // ...
  'aws_appsync_graphqlEndpoint': 'https://123456789abcdefg.appsync-api.us-east-1.amazonaws.com/graphql', // Replace with your GraphQL Endpoint
  'aws_appsync_region': 'us-east-1', // Replace with the region you deployed CDK with
  'aws_appsync_authenticationType': 'AMAZON_COGNITO_USER_POOLS', // No touchy
}

Amplify.configure(myAppConfig);
