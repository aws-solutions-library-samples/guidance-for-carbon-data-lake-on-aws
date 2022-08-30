// -- AWS AMPLIFY CONFIGURATION PARAMETERS --

import outputsJSON from '../../../terraform-deployment/modules/tca-qs/outputs.json'
import { Amplify, Auth, Storage} from 'aws-amplify';

const AmplifyConfig = {

      // Existing API
      API: {
        aws_appsync_graphqlEndpoint: outputsJSON.outputs.tca_appsync_graphql_api_uris.value.GRAPHQL, // Replace with your GraphQL Endpoint
        aws_appsync_region: outputsJSON.outputs.tca_aws_current_region.value, // Replace with the region you deployed CDK with
        aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS', // No touchy
      },


    // Existing Auth
      Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: outputsJSON.outputs.tca_identity_pool_id.value,

        // REQUIRED - Amazon Cognito Region
        region: outputsJSON.outputs.tca_aws_current_region.value, // Replace with the region you deployed CDK with

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region
        // Required only if it's different from Amazon Cognito Region
        identityPoolRegion: outputsJSON.outputs.tca_aws_current_region.value,

        // REQUIRED - Amazon Cognito User Pool ID
        userPoolId: outputsJSON.outputs.tca_user_pool_id.value, // Replace with your User Pool ID

        // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: outputsJSON.outputs.tca_user_pool_client_id.value, // Replace with your User Pool Web Client ID

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
      },



      Storage: {
            AWSS3: {
                bucket: outputsJSON.outputs.tca_landing_bucket.value, //REQUIRED -  Amazon S3 bucket name
                region: outputsJSON.outputs.tca_aws_current_region.value, //Required -  Amazon service region
            },
        }




}

export { AmplifyConfig }

// export {existingAPI, existingAuth, existingS3}



