<!-- *Copyright Amazon.com, Inc.  This package is confidential and proprietary Amazon.com, Inc. software.* -->

# CarbonLake Amplify App Documentation
## Introduction
This sample app is used to serve as a demonstration for what you can do with the CarbonLake Quickstart core features. This code is meant to be used purely for development/demo purpose. For production workloads it is ***highly*** recommended that you do your own extensive internal testing before using.

This package sets up a React development environment that has access to all [AWS-UI](https://github.com/aws/awsui-documentation) React components. It comes with a sample application using the AWS-UI to give a demo of what your own Amplify Application using CarbonLake could look like. See [Getting started with AWS UI Components](https://polaris.a2z.com/resources/bob_ross/).

## React + Babel/ES6 + React Scripts

This is a modern JS skeleton with React AWS-UI components for [React Scripts](https://create-react-app.dev/docs/available-scripts).

## Installation

Clone this repo manually or download the .zip file. The react/amplify related items are in the **'frontend/'** directory.

## Getting started

* **Prereqs:**
    * [Node.js installed](http://nodejs.org): if you don't already have it, run `brew install node` to download Node (Homebrew needs to be installed for this to work) - Run `node -v ` to check your version.
    * [NPM installed](https://www.npmjs.com/) - Run `npm -v` to check your version.
    * [CDK deployed](https://google.com)
    * [IAM User or Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create.html) with necessary permissions created (role is recommended)
    * [AWS Amplify CLI installed](https://google.com)
        * Run `npm install -g @aws-amplify/cli`
        * Run  `amplify --version` to verify installed version

* **Helpful commands (NPM):**
    * **`npm install`** - downloads app dependencies
    * **`npm start`** — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * **`npm run build`** — builds a minified project for production
* **Helpful commands (AWS Amplify):**
    * **`amplify init`** - initialized a new Amplify project. Must run this from the root directory of the frontend app.
    * **`amplify pull`** -  operates similar to a git pull, fetching upstream backend environment definition changes from the cloud* and update the local environment to match that definition
    * **`amplify console`** - launches the browser directing you to your cloud project in the AWS Amplify Console.

* **Learn:**
    * source files are fully auto-generated and served by HTTP server.  Write your code in `src/` dir.
    * Place static files in `public/`
## Setup Guide
1. Ensure that the CDK for the quickstart has been deployed (for testing, at a bare minimum, the API, and Cognito stacks must be deployed)
2. Navigate to <ins>**'/front-end/carbonlake-ui/'**
3. Run the command **‘amplify init’** **(ENSURE YOU ARE IN THE ROOT of the app directory <ins>/'front-end/carbonlake-ui/'</ins> and not in any sub directory**
4. When asked if you want to use an existing environment, choose **‘n’** for no and enter your own name for your environment. It is recommended to have separate environments for development/testing and production.
5. Enter the name for the environment when prompted, **‘dev’** in our case
6. Enter the name for the project and press enter/return
7. The following information should be output. Verify it is correct, and press **'y'** to continue or **'n to edit the project information.

```javascript
The following configuration will be applied:

Project information
| Name: carbonlaketestapp
| Environment: dev
| Default editor: Visual Studio Code
| App type: javascript
| Javascript framework: react
| Source Directory Path: src
| Distribution Directory Path: build
| Build Command: npm run-script build
| Start Command: npm run-script start

? Initialize the project with the above configuration? (Y/n)
```

7. You will then be asked to select the authentication method you wish to use. This is used by AWS Amplify to deploy the application.
8. For authentication method, choose either **AWS profile**, or **AWS access keys**. It is recommended to use an AWS profile over access keys to have the keys automatically rotated for you, and reduce security risk. Select **AWS profile** then the profile you previously created (an IAM role with admin privileges is recommended). This will then initialize the project in the cloud for you using CloudFormation.
It is important to note that two IAM roles are created by Amplify by default - **'UnauthRole** and **AuthRole**. These are used to set what unauthenticated and authenticated users can do in relation to your Amplify App. These roles will have no policies attached by default.
4. After the CloudFormation deploys, you should receive a similar success message to the one below:
```javascript
CREATE_COMPLETE amplify-carbonlaketestapp-dev-215347 AWS::CloudFormation::Stack Thu May 26 2022 21:54:20 GMT-0400 (Eastern Daylight Time)
✔ Successfully created initial AWS cloud resources for deployments.
✔ Initialized provider successfully.
✅ Initialized your environment successfully.

Your project has been successfully initialized and connected to the cloud!

Some next steps:
"amplify status" will show you what you've added already and if it's locally configured or deployed
"amplify add <category>" will allow you to add features like user login or a backend API
"amplify push" will build all your local backend resources and provision it in the cloud
"amplify console" to open the Amplify Console and view your project status
"amplify publish" will build all your local backend and frontend resources (if you have hosting category added) and provision it in the cloud

Pro tip:
Try "amplify add api" to create a backend API and then "amplify push" to deploy everything
```
10. When deploying the CarbonLake QuickStart CDK, a Cognito user pool **(CarbonLakeQuickStartUserPool)**, Identity pool **(CarbonLakeQuickStartIdentityPool)**, and GraphQL API **(CarbonLakeApi)** will be deployed automatically, so <ins> **do not** </ins>  run the command **amplify add api** or **amplify add auth**. Instead, you will need to import these resources into your Amplify app.
11. Navigate to <ins>**'src/amplify-config.js'**</ins> and replace the values for **aws_appsync_grapqlEndpoint**, **identityPoolId**, **userPoolId**, and **userPoolWebClientId.** Your configuration should look similar to the following:
```javascript
// -- AWS AMPLIFY CONFIGURATION PARAMETERS --

// Existing API
const existingAPI = {
  // ...
  'aws_appsync_graphqlEndpoint': 'https://abcdefg123456.appsync-api.us-east-1.amazonaws.com/graphql', // Replace with your GraphQL Endpoint
  'aws_appsync_region': 'us-east-1', // Replace with the region you deployed CDK with
  'aws_appsync_authenticationType': 'AMAZON_COGNITO_USER_POOLS', // No touchy
}

// Existing Auth
const existingAuth = {
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-east-1:abcdefghijklmnop',

    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: 'us-east-1',

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_abcd1234',

    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: 'abcdefg123456',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,
```
12. When deploying the CDK, you should have been sent an email with a temporary password to the email address you provided for **adminEmail** in the **cdk.context.json**. This is to be used with the email address for the default cognito user that was created by CDK.
13. Run the command **npm run** to run the web app on your localhost. You should see a cognito login page with input fields for an email address and password. Enter your email address and the temporary password sent to your email. You should be able to sign-in successfully at this point. ***NOTE: The sign-up functionality is disabled intentionally to help secure your application. You may change this and add the UI elements back, or manually add the necessary users in the cognito console while following the principle of least privilege (recommended).***
14. Next you will need to add the AppSync helper code to your application. This is used to help connect your frontend with the CarbonLake GraphQL API backend. In the AWS Console, navigate to the AppSync console (search for AppSync in the search bar). Select the API created for you (CarbonLakeApi) then copy the relevant codegen command and run in your terminal.

Ex:
```javascript
amplify add codegen --apiId abcedfghjk1234567
```
15. You should receive a success message and be prompted to choose the code generation language target. You may also optionally enter the file name pattern for queries, mutations and subscriptions (default will be <ins>'src/grapql/**/*.js*'</ins>). When prompted choose **'Y'** to generate/update all possible GraphQL operations. For maximum statement depth, choose the number that suits the complexity of your statement. For our testing we used **'2'**.

<!-- TODO - Replace this with out GitHub link once it's live -->
16. Success! At this point, you should successfully have the Amplify app working. For any questions, please reach out to us on our [GitHub](https://github.com).

<!-- TODO - Add Instructions for S3 Upload configuration -->
<!-- TODO - Add detailed customization instructions (maybe?) -->
