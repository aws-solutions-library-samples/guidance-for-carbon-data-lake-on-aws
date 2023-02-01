# Welcome to the carbon data lake AWS Cloud Development Kit (CDK) application

This carbon data lake is a solution guidance with sample code that deploys an arrangement of AWS Services to enable carbon accounting applications. The carbon data lake reduces the undifferentiated heavy lifting of ingesting, standardizing, transforming, and calculating greenhouse gas emission data in carbon dioxide equivalent (CO2eq). Customers can use this guidance with sample code to advance their starting point for building decarbonization reporting, forecasting, and analytics solutions and/or products. The carbon data lake includes a purpose-built data pipeline, data quality module, data lineage module, emissions calculator microservice, business intelligence services, prebuilt forecasting machine learning notebook and compute service, GraphQL API, and sample web application. 

Customer emissions data (such as databases, historians, existing data lakes, internal/external APIs, Images, CSVs, JSON, IoT/sensor data, and third party applications including CRMs, ERPs, MES, and more) can be mapped to the standard CSV format to support centralization and processing of customer carbon data. Carbon data is ingested through the carbon data lake landing zone, and can be ingested from any service within or connected to the AWS cloud. This calculator can be deployed with a sample emissions factor model or can be modified or augmented with additional bring your own standards lookup tables and calculator logic.

## What it does

This guidance with sample code provides core functionality to accelerate data ingestion, processing, calculation, storage, analytics and insights. The following list outlines the current capabilities of the carbon data lake. Please submit a PR to request additional capabilities and features. We appreciate your feedback as we continue to improve this offering.

### Capabilities

The following list covers current capabilities as of today:

- Accepts a standard CSV formatted data input as S3 upload to the carbon data lake Landing Bucket
- Accepts multi-part and standard upload via S3 CLI, Console, and other programmatic means
- Accepts single file upload via AWS Amplify console with optional web application
- Provides daily data compaction at midnight in local time
- Performs calculation using sample calculator lookup table
- Can accept new calculator lookup table and data model with required updates to JSON files for data quality AND calculator.

## 🛠 What you will build

Deploying this repository with default parameters builds the following carbon data lake environment in the AWS Cloud.

![carbon data lake diagram](resources/architecture/architecture_diagram.png)
Figure 1: Solution Architecture Diagram

As shown in Figure 1: Solution Architecture Diagram, this guidance with sample code sets up the following application stacks

1. Amazon S3 provides a single landing zone for all ingested emissions data. Data ingress to the landing zone bucket triggers the data pipeline.
2. AWS Step Functions Workflow orchestrates the data pipeline including data quality check, data compaction, transformation, standardization, and enrichment with an emissions calculator AWS Lambda Function.
3. AWS Lambda functions trigger the data lineage service, with queueing managed by Amazon Simple Queue Service, and a second AWS Lambda Function writing all data transformations as pointers to an Amazon DynamoDB table. This table can be accessed for data lineage queries using a data lineage reconstruction AWS Lambda Function.
4. AWS Glue Data Brew provides data quality auditing and alerting workflow, and AWS Lambda Functions provide integration with Amazon Simple Notification Service and AWS Amplify Web Application.
5. AWS Lambda Functions provide data lineage processing, queued by Amazon SQS. Amazon Dynamo DB provides NoSQL pointer storage for the data ledger, and an AWS Lambda Function provides data audit reverse traversal.
6. AWS Lambda Function provides calculation of scope 1-3 emissions using a pre-seeded Amazon DynamoDB sample emissions factor lookup database.
7. Amazon S3 provides enriched data object storage for analytics workloads and AWS Dynamo DB provides storage for GraphQL API.
8. Analytics and AI/ML stack provide integrated analytics, business intelligence, and forecasting tools including a prebuilt Amazon Sagemaker notebook, AWS Quicksight with prebuilt BI dashboards and visualizations, and Amazon Athena for querying data stored in 8. Amazon S3. Services are pre-integrated with Amazon S3 enriched object store.
9. AWS Appsync provides a GraphQL API backend for integration with web applications and other data consumer applications, and AWS Amplify provides a serverless pre-configured management application that includes basic data browsing, data visualization, data uploader, and application configuration.

## Application Stacks

### Shared Resource Stack

The shared resource stack deploys all cross-stack referenced resources such as S3 buckets and lambda functions that are built as dependencies.

Review the [Shared Resources Stack](lib/stacks/stack-shared-resources/stack-shared-resources.ts) and [Stack Outputs](#shared-resources-stack-outputs)

### Optional CI/CD Pipeline

The optional CI/CD pipeline using AWS Codecommit, AWS Codebuild, AWS Codepipeline, and AWS Codedeploy to manage a self-mutating CDK pipeline. This pipeline can pick up commits to a defined branch of a github, gitlab, or codecommit repository and push them through an AWS DevOps services workflow.

Review the [Optional CI/CD Stack](lib/stacks/stack-ci-cd/stack-ci-cd.ts)

### Data Pipeline

The carbon data lake data pipeline is an event-driven Step Functions Workflow triggered by each upload to the carbon data lake landing zone S3 bucket. The data pipeline performs the following functions:

1. AWS Glue Data Brew Data Quality Check: If the data quality check passes the data is passed to the next step. If the data quality check fails the admin user receives a Simple Notification Services alert via email.
2. Data Transformation Glue Workflow: Batch records are transformed and prepared for the carbon data lake calculator microservice.
3. Data Compaction: night data compaction jobs prepare data for analytics and machine learning workloads.
4. Emissions Calculator Lambda Microservice: An AWS Lambda function performed emissions factor database lookup and calculation, outputting records to a Amazon DynamoDB table and to an S3 bucket for analytics and AI/ML application.
5. Data Transformation Ledger: Each transformation of data is recorded to a ledger using Amazon Simple Queue Service, AWS Lambda, and Amazon DynamoDB.

Review the [Data Pipeline Stack](lib/stacks/stack-data-pipeline/stack-data-pipeline.ts), [README](lib/stacks/stack-data-pipeline/README.md), and [Stack Outputs](#data-pipeline-stack-outputs)

### Emissions Factor Reference Database Sample

The Carbon Emissions Calculator Microservice comes with a pre-seeded Amazon DynamoDB reference table. This data model directly references the sample emissions factor model provided for development purposes. The sample provided is for development purposes only, and it is recommended that carbon data lake users modify this JSON document and/or create their own using a similar format.

To bring your own emissions factor model:

1. Modify and/or replace the existing [emissions factor sample document](lib/stacks/stack-data-pipeline/construct-calculator/emissions_factor_model_2022-05-22.json)
2. Alternatively make a copy and point the emissions factor lookup table component to the new filename by editing the [Calculator Construct](lib/stacks/stack-data-pipeline/construct-calculator/construct-calculator.ts#L86)
3. If you are making substantial changes beyond category and/or emissions factor coefficients you may have to edit the Calculator Microservice stack to reflect changes in input category headers. This will include editing the `generateItem` method and the `IDdbEmissionFactor` interface found in the [Calculator Construct](lib/stacks/stack-data-pipeline/construct-calculator/construct-calculator.ts#L86)

### AWS AppSync GraphQL API

A pre-built AWS AppSync GraphQL API provides flexible querying for application integration. This GraphQL API is authorized using Amazon Cognito User Pools and comes with a predefined Admin and Basic User role. This GraphQL API is used for integration with the carbon data lake AWS Amplify Sample Web Application.

Review the [AppSync GraphQL API Stack](lib/stacks/stack-api/stack-api.ts), [Documentation](lib/stacks/stack-api/README.md), and [Stack Outputs](#api-stack-outputs)

### Optional: AWS Amplify Sample Web Application

An AWS Amplify application can be deployed optionally and hosted via Amazon Cloudfront and AWS Amplify. To review deployment steps complete a successful carbon data lake application deployment. The AWS Amplify Web Application depends on the core carbon data lake components.

Review the [Web Application Stack](lib/stacks/stack-web/stack-web.ts) and [Stack Outputs](#web-stack-outputs).

### Optional: Amazon Quicksight Module with prebuilt visualizations and Analysis

An Amazon Quicksight stack can be deployed optionally with pre-built visualizations for Scope 1, 2, and 3 emissions. This stack requires additional manual setup in the AWS console detailed in this guide.

Review the [Amazon Quicksight Stack](lib/stacks/stack-quicksight/documentation/README.md)

### Optional: Sagemaker Notebook Instance with pre-built Machine Learning notebook

A pre-built machine learning notebook is deployed on an Amazon Sagemaker Notebook EC2 instance with `.ipynb` and pre-built prompts and functions.

Review the [Sagemaker Notebook Instance Stack](lib/stacks/stack-sagemaker-notebook/stack-sagemaker-notebook.ts).

### Sample Data Collection for Testing

The carbon data lake guidance with sample code comes with sample data for testing successful deployment of the application and can be found in the `sample-data` directory.

## 💲 Cost and Licenses

You are responsible for the cost of the AWS services used while running this  reference deployment. There is no additional cost for using this.

The AWS CDK stacks for this repository include configuration parameters that you can customize. Some of these settings, such as instance type, affect the cost of deployment. For cost estimates, see the pricing pages for each AWS service you use. Prices are subject to change.

Tip: After you deploy the repository, create AWS Cost and Usage Reports to track costs associated with the guidance with sample code. These reports deliver billing metrics to an S3 bucket in your account. They provide cost estimates based on usage throughout each month and aggregate the data at the end of the month. For more information, see [What are AWS Cost and Usage Reports?](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html)

This application doesn’t require any software license or AWS Marketplace subscription.

## 🚀 How to Deploy

You can deploy the carbon data lake guidance with sample code through the manual setup process using AWS CDK. We recommend use of an AWS Cloud9 instance in your AWS account or VS Code and the AWS CLI. We also generally recommend a fresh AWS account that can be integrating with your existing infrastructure using AWS Organizations.

## 🎒 Pre-requisites

- The [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) must be installed -and- configured with an AWS account on the deployment machine (see <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html> for instructions on how to do this on your preferred development platform).
- This project requires [Node.js](http://nodejs.org/). To make sure you have it available on your machine, try running the following command.

  ```sh
  node -v
  ```

- For best experience we recommend installing CDK globally: `npm install -g aws-cdk`

## 🚀 Setup

### 0/ Use git to clone this repository to your local environment

```sh
git clone #insert-http-or-ssh-for-this-repository
```

### 1/ Set up your AWS environment

- Configure your AWS credentials: `aws configure`
- For more on setting up your AWS Credentials please visit [setting up your aws credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

### 2/ Prepare your CDK environment

1. Navigate to CDK Directory
2. Set `cdk.context.json` values (see Context Parameters below)

#### --Context Parameters--

Before deployment navigate to `cdk.context.json` and update the required context parameters which include: `adminEmail`, and `repoBranch`. Review the optional and required context variables below.

- Required:`adminEmail` The email address for the administrator of the app
- Required:`repoBranch` The branch to deploy in your pipeline (default is `/main`)
- Optional:`quicksightUserName` Username for access to the carbon emissions dataset and dashboard.
- Optional:`deployQuicksightStack` Determines whether this stack is deployed. Default is false, change to `true` if you want to deploy this stack.
- Optional:`deploySagemakerStack` Determines whether this stack is deployed. Default is false, change to `true` if you want to deploy this stack.
- Optional:`deployWebStack` Determines whether this stack is deployed. Default is false, change to `true` if you want to deploy this stack.

Quicksight Note: If you choose to deploy the optional Quicksight Module make sure you review [QuickSight setup instructions](lib/stacks/stack-quicksight/documentation/README.md)

Web Application Note: If you choose to deploy the optional Web Module make sure you review [web application setup instructions](lib/stacks/stack-web/app/sample-ui-cloudscape)

### 3/ Install dependencies, build, and synthesize the CDK app

- Install dependencies

```sh
npm ci
```

- Build your node application and environment

```sh
npm run build
```

- Make sure that you have assumed an AWS Profile or credentials through AWS Configure or some other means
- Get your AWS Account Number --> `aws sts get-caller-identity`
- Bootstrap CDK so that you can build cdk assets 

```sh
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

or

```sh
cdk bootstrap # if you are authenticated through `aws configure`
```

- Synthesize the CDK application

```sh
cdk synth
```

### 4/ Deploy the application

- ✅  Recommended: deploy for local development

```sh
cdk deploy --all
```

👆 If you are deploying only for local development this will deploy all of the carbon data lake stacks without the CI/CD pipeline. This is recommended.

- ⛔️  Advanced User: deploy through CI/CD pipeline with linked repository

```sh
npm run deploy:cicd
```

👆 If you are deploying the full CI/CD pipeline this will deploy the pipeline and you will have to connect your repo for automated deployment. Use the [README for the gitlab mirroring component](lib/constructs/construct-gitlab-mirroring/README.md) to get set up. Please note that this will require some knowledge of DevOps services in AWS and is considered an advanced implementation.

### 4/ Optional: Set up the Amplify Web Application

If you have chosen to deploy the optional Web Application by setting `deployWebStack: true` in the `cdk.context.json` file, there are a few simple steps to get up and running with the web application.

For quick setup follow the instructions below.

#### Quick Setup

If you are reading this it is because you deployed the carbon data lake guidance with sample code Web Application by setting `deployWebStack: true` in the `cdk.context.json` file. Your application is already up and running in the AWS Cloud and there are a few simple steps to begin working with and editing your application.

1. Visit the AWS Amplify Console by navigating to the AWS Console and searching for Amplify. Make sure you are in the same region that you just selected to deploy your application.
2. Initiate the build process --> select your application and select "run build"
3. Visit your live web application --> click on the link in the Amplify console
   When you open the web application in your browser you should see a cognito login page with input fields for an email address and password. Enter your email address and the temporary password sent to your email when you created your carbon data lake guidance with sample code CDK Application. After changing your password, you should be able to sign in successfully at this point.

   ***NOTE: The sign-up functionality is disabled intentionally to help secure your application. You may change this and add the UI elements back, or manually add the necessary users in the cognito console while following the principle of least privilege (recommended).***

![Cognito Login Page](lib/stacks/stack-web/app/sample-ui-cloudscape/documentation/images/CarbonLakeCognitoSignInPage.png)

![carbon data lake Web Application](lib/stacks/stack-web/app/sample-ui-cloudscape/documentation/images/CarbonLake101.png)

4. Create a separate directory to manage your web application

    ```sh
    mkdir <your-web-application-directory>
    ```

5. Install the AWS Amplify CLI following the instructions on the official [AWS Amplify Documentation](https://docs.amplify.aws/cli/start/install/).

6. Pull your Amplify project

    ```sh
    amplify pull --appId <app-id> --envName <env-name>
    ```

7. Learn more about working with [AWS Amplify CLI](https://docs.amplify.aws/cli/) or the [AWS Amplify Console](https://docs.amplify.aws/start/q/integration/js/).
8. Make the web application your own and let us know what you choose do to with it.

Success! At this point, you should successfully have the Amplify app working.

### Optional A/ Manually enable & set up Amazon Quicksight Stack

If you choose to deploy the Amazon Quicksight business intelligence stack it will include prebuilt data visualizations that leverage Amazon Athena to query your processed data. If you elect to deploy this stack you will need to remove the comments.

Before you proceed you need to set up your quicksight account and user. This needs to be done manually in the console, so please open this link and follow the instructions [here](lib/stacks/stack-quicksight/documentation/README.md).

To deploy this stack navigate to `cdk.context.json` and change `deployQuicksightStack` value to `true` and redeploy the application by running `cdk deploy --all`

### Optional B/ Manually enable & set up Forecast stack

The forecast stack includes a pre-built sagemaker notebook instance running an `.ipynb` with embedded machine learning tools and prompts.

To deploy this stack navigate to `cdk.context.json` and change `deploySagemakerStack` value to `true` and redeploy the application by running `cdk deploy --all`

## 🗑 How to Destroy

You can destroy all stacks included in carbon data lake guidance with sample code with `cdk destroy --all`. You can destroy individual stacks with `cdk destroy --StackName`. By default using CDK Destroy will destroy EVERYTHING. Use this with caution! We strongly recommend that you modify this functionality by applying no delete defaults within your CDK constructs. Some stacks and constructs that we recommend revising include:

- DynamoDB Tables
- S3 Buckets
- Cognito User Pools

## Work with outputs

The CDK stacks by default export all stack outputs to `cdk-outputs.json` at the top level of the directory. You can disable this feature by removing `"outputsFile": "cdk-outputs.json"` from `cdk.json` but we recommend leaving this feature, as it is a requirement for some other features. By default this file is ignored via `.gitignore` so any outputs will not be committed to a version control repository. Below is a guide to the standard outputs.

### Shared Resources Stack Outputs

Shared resource stack outputs include:

- `cdlAwsRegion`: Region of CDK Application AWS Deployment.
- `cdlEnrichedDataBucket`: Enriched data bucket with outputs from calculator service.
- `cdlEnrichedDataBucketUrl`: Url for enriched data bucket with outputs from calculator service
- `cdlDataLineageBucket`: Data lineage S3 bucket
- `cdlDataLineageBucketUrl`: Data lineage S3 bucket URL

### API Stack Outputs

-`cdluserPoolId`: Cognito user pool ID for authentication
-`CLQidentityPoolId`: Cognito Identity pool ID for authentication
-`cdluserPoolClientId`: Cognito user pool client ID for authentication
-`cdlcdlAdminUserRoleOutput`: Admin user role output
-`cdlcdlStandardUserRoleOutput`: Standard user role output
-`cdlApiEndpoint`: GraphQL API endpoint
-`cdlApiUsername`: GraphQL API admin username
-`cdlGraphQLTestQueryURL`: GraphQL Test Query URL (takes you to AWS console if you are signed in).

### Data Pipeline Stack Outputs

-`LandingBucketName`: S3 Landing Zone bucket name for data ingestion to carbon data lake guidance with sample code Data Pipeline.
-`cdlLandingBucketUrl`: S3 Landing Zone bucket URL for data ingestion to carbon data lake guidance with sample code Data Pipeline.
-`cdlGlueDataBrewURL`: URL for Glue Data Brew in AWS Console.
-`cdlDataPipelineStateMachineUrl`: URL to open cdl state machine to view step functions workflow status.

### Web Stack Outputs

-`cdlWebAppRepositoryLink`: Amplify Web Application codecommit repository link.
-`cdlWebAppId`: Amplify Web Application ID.
-`cdlAmplifyLink`: Amplify Web Application AWS Console URL.
-`cdlWebAppDomain`: Amplify Web Application live web URL.

### Quicksight Stack Outputs

-`QuickSightDataSource`: ID of QuickSight Data Source Connector Athena Emissions dataset. Use this connector to create additional QuickSight datasets based on Athena dataset.
-`QuickSightDataSet`: ID of pre-created QuickSight DataSet, based on Athena Emissions dataset. Use this pre-created dataset to create new dynamic analyses and dashboards.
-`QuickSightDashboard`: ID of pre-created QuickSight Dashboard, based on Athena Emissions dataset. Embed this pre-created dashboard directly into your user facing applications.
-`cdlQuicksightUrl`: URL of Quicksight Dashboard.

### Sagemaker Notebook Stack Outputs

-`cdlSagemakerRepository`: Codecommit repository of sagemaker notebook.
-`cdlSagemakerNotebookUrl`: AWS console URL for Sagemaker Notebook ML Instance.

### Test Stack Outputs

-`e2eTestLambdaFunctionName`: Name of carbon data lake lambda test function.
-`e2eTestLambdaConsoleLink`: URL to open and invoke calculator test function in the AWS Console.

## 🛠 Usage

Time to get started using carbon data lake guidance with sample code! Follow the steps below to see if everything is working and get familiar with this solution.

### 1/ Make sure all the infrastructure deployed properly

In your command line shell you should see confirmation of all resources deploying. Did they deploy successfully? Any errors or issues? If all is successful you should see indication that CDK deployed. You can also verify this by navigating to the Cloudformation service in the AWS console. Visually check the series of stacks that all begin with `CLQS` to see that they deployed successfully. You can also search for the tag:

```json

"application": "carbon-data-lake"

```

### 2/ Drop some synthetic test data into the carbon data lake landing zone S3 Bucket

Time to test some data out and see if everything is working. This section assumes basic prerequisite knowledge of how to manually upload an object to S3 with the AWS console. For more on this please review [how to upload an object to S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html).

- Go to the S3 console and locate your carbon data lake landing zone bucket it will be called `cdlpipelinestack-cdllandingbucket` with a unique identifier appended to it
- Upload [carbon data lake synthetic input data](sample-data/carbonlake-test-synthetic-input-data.csv) to the S3 bucket manually
- This will kick trigger the pipeline kickoff lambda function and start the data pipeline step functions workflow -- continue!

### 3/ Take a look at the step functions workflow

- Navigate to step functions service in the aws console
- Select the step function named `cdlPipeline` with an appended uuid
- Select the recent active workflow
- Select from the "executions" list
- Have a quick look and familiarize yourself with the workflow graph inspector
- The workflow will highlight green for each passed step. See two image examples below.

![In-Progress Step Functions Workflow](resources/images/cdl-step-func-in-progress.png)

Figure. In progress step function workflow

![Successful Step Functions Workflow](resources/images/cdl-step-func-graph-inspector-completed.png)
Figure. Completed step function workflow

### 3/ Review your calculated outputs

The calculator outputs emissions calculator outputs referenced in the data model section below. Outputs are written to Amazon DynamoDB and Amazon S3. You can review the outputs using the AWS console or AWS CLI:

- Amazon DynamoDB: Navigate to Amazon DynamoDB in the AWS console. Look for a Database called `DataBase` and a table called `Table`
- Amazon S3: Navigate to S3 in the console and look for a bucket called `BucketName`. This bucket contains all calculator outputs.

You can also query this data using the GraphQL API detailed below.

### 4/ Query your GraphQL API endpoint

- Navigate to AWS AppSync in the console
- In the AWS AppSync, choose the Queries tab and then enter the following text in the editor:
- Run the following query and hit "run"

This one will get all of the records (with a default limit of 10)

```
query MyQuery {
  all {
    items {
      activity
      activity_event_id
      asset_id
      category
      emissions_output
      geo
      origin_measurement_timestamp
      raw_data
      units
      source
      scope
    }
  }
}
```

Did that all work? Continue...

### 5/ Take a look at the Amplify Sample Web Application

If you have not yet this is a great time to deploy the sample web application. Once you've run some data through the pipeline you should see that successfully populating in the application. Remember that to deploy the web application you will need to set `"deployWebStack": "true"` in `cdk.context.json`.

### 6/ Try dropping some other sample data into the landing zone

- Generate or select some additional data (it can be anything really, but carbon emissions data is good)
- Test out the data quality module by dropping different data into the bucket. Does it run through? Do you get a notification if it does not?

### 7/ Start connecting your own data to the carbon data lake landing zone

- Connect other data sources such as IoT, Streaming Data, Database Migration Workloads, or other applications to the S3 landing zone bucket. Try something out and let us know how it goes.

## 🧪 Tests

This application currently includes unit tests, infrastructure tests, deployment tests. We are working on an end to end testing solution as well. Read on for the test details:

### Pipeline Tests

For Gitlab users only -- The Gitlab CI runs each time you commit to remote and/or merge to main. This runs automatically and does the following:

- `npm ci` installs all dependencies from `package.lock.json`
- `npm run build` builds the javascript from typescript and makes sure everything works!
- `cdk synth` synthesizes all CDK stacks in the application
- Runs bandit security tests for common vulnerabilities in Python
- Runs ESLint for common formatting issues in Javascript and Typescript
- Runs CDKitten deployment tests -- these deploy your CDK in several major AWS regions, checking that it builds and deploys successfully, and then destroying those stacks after confirming that they build.
- Runs e2e data integration test -- runs an end to end test by dropping data into the pipeline and querying the GraphQL api output. If the test is successful it returns `Success`

### Manual Tests

You can run several of these tests manually on your local machine to check that everything is working as expected.

- `sh test-deployment.sh` Runs CDKitten locally using your assumed AWS role
- `sh test-e2e.sh`runs an end to end test by dropping data into the pipeline and querying the GraphQL api output. If the test is successful it returns `Success`
- `npm run lint` tests your code locally with the prebuilt linter configuration

## Extending carbon data lake

If you are looking to utilize existing features of carbon data lake while integrating your own features, modules, or applications this section provides details for how to ingest your data to the carbon data lake data pipeline, how to connect data outputs, how to integrate other applications, and how to integrate other existing AWS services. As we engage with customers this list of recommendations will grow with customer use-cases. Please feel free to submit issues that describe use-cases you would like to be documented.

### Ingesting data into carbon data lake

To ingest data into carbon data lake you can use various inputs to get data into the carbon data lake landing zone S3 bucket. This bucket can be found via AWS Console or AWS CLI under the name `bucketName`. It can also be accessed as a public readonly stack output via props `stackOutputName`. There are several methods for bringing data into an S3 bucket to start an event-driven pipeline. This article is a helpful resource as you explore options. Once your data is in S3 it will kick off the pipeline and the data quality check will begin.

### Integrating carbon data lake data outputs

### General Guide to adding features

To add additional features to carbon data lake we recommend developing your own stack that integrates with the existing carbon data lake stack inputs and outputs. We recommend starting by reviewing the concepts of application, stack, and construct in AWS CDK. Adding a stack is the best way to add functionality to carbon data lake.

1. Start by adding your own stack directory to `lib/stacks`

    ```sh
    mkdir lib/stacks/stack-title
    ```

2. Add a stack file to this directory

    ```sh
    touch lib/stacks/stack-title/stack-title.ts
    ```

3. Use basic CDK stack starter code to formulate your own stack. See example below:

    ```javascript
    import * as cdk from 'aws-cdk-lib';
    import { Construct } from 'constructs';
    // import * as sqs from 'aws-cdk-lib/aws-sqs';

    export class ExampleStack extends cdk.Stack {
        constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'ExampleStackQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
        }
    }
    ```

4. We recommend using a single stack, and integrating additional submodular components as constructs. Constructs are logical groupings of AWS resources with "sane" defaults. In many cases the CDK team has already created a reusable construct and you can simply work with that. But in specific cases you may way to create your own. You can create a construct using the commands and example below:

    ```sh
    mkdir lib/constructs/construct-title
    touch lib/constructs/construct-title/title-construct.ts
    ```

5. If you have integrated your stack successfully you should see it build when you run `cdk synth`. For development purposes we recommend deploying your stack in isolation before you deploy with the full application. You can run `cdk deploy YourStackName` to deploy in isolation.

6. Integrate your stack with the full application by importing it to `bin/main.ts` and `bin/cicd.ts` if you have chosen to deploy it.

    ```sh
    #open the file main.ts
    open main.ts
    ```

    ```javascript
    // Import your stack at the top of the file
    import {YourStackName} from './stacks/stack-title/your-stack'

    // Now create a new stack to deploy within the application
    const stackName = new YourStackName(app, "YourStackTitle", {
        // these are props that serve as an input to your stack
        // these are optional, but could include things like S3 bucket names or other outputs of other stacks.
        // For more on this see the stack output section above.
        yourStackProp1: prop1,
        yourStackProp2: prop2,
        env: appEnv // be sure to include this environment prop
    })
    ```

#### Working with Stack Outputs

You can access the outputs of application stacks by adding them as props to your stack inputs. For example, you can access the `myVpc` output by adding `networkStack.myVpc` as props your own stack. It is best practice to add this as props at the application level, and then as an interface at the stack level. Finally, you can access it via `props.myVpc` (or whatever you call it) within your stack. Below is an example.

```javascript

// Start by importing it when you instatiate your stack 👇
new MyFirstStack(app, 'MyFirstStack', {
    vpc: networkStack.myVpc
});

// Now export this as an interface within that stack 👇
export interface MySecondStackProps extends StackProps {
    vpc: Ec2.vpc
}

// Now access it as a prop where you need it within the stack 👇
this.myStackObject = new ec2.SecurityGroup(this, 'ec2SecurityGroup', {
            props.vpc,
            allowAllOutbound: true,
        });

```

The above is a theoretical example. We recommend reviewing the CDK documentation and the existing stacks to see more examples.

### Integrating with existing AWS Services

The model below describes the required schema for input to the carbon data lake calculator microservice. This is Calculator Data Input Model.

## 📚 Reference & Resources

### Helpful Commands for CDK

- `npm run build`                          compile typescript to js
- `npm run watch`                          watch for changes and compile
- `npm run test`                           perform the jest unit tests\
- `cdk diff`                               compare deployed stack with current state
- `cdk synth`                              emits the synthesized CloudFormation template
- `cdk deploy --all`                       deploy this stack to your default AWS account/region w/o the CICD pipeline
- `npm run deploy:cicd`                       deploy this application CI/CD stack and then link your repo for automated pipeline

### Data Model

#### Calculator Input Model

The model below describes the required schema for input to the carbon data lake calculator microservice. This is
[Calculator Data Input Model](sample-data/calculator_input_single_record_scope1_example.json)

```json
{
    "activity_event_id": "customer-carbon-data-lake-12345",
    "asset_id": "vehicle-1234",
    "geo": {
        "lat": 45.5152,
        "long": 122.6784
    },
    "origin_measurement_timestamp":"2022-06-26 02:31:29",
    "scope": 1,
    "category": "mobile-combustion",
    "activity": "Diesel Fuel - Diesel Passenger Cars",
    "source": "company_fleet_management_database",
    "raw_data": 103.45,
    "units": "gal"
}
```

### Calculator Output Model

The model below describes the standard output model from the carbon data lake emissions calculator microservice.

[Calculator Output Model](sample-data/calculator_output_single_record_scope1_example.json)

```json
{
    "activity_event_id": "customer-CarbonLake-12345",
    "asset_id": "vehicle-1234",
    "activity": "Diesel Fuel - Diesel Passenger Cars",
    "category": "mobile-combustion",
    "scope": 1,
    "emissions_output": {
        "calculated_emissions": {
            "co2": {
                "amount": 0.024,
                "unit": "tonnes"
            },
            "ch4": {
                "amount": 0.00001,
                "unit": "tonnes"
            },
            "n2o": {
                "amount": 0.00201,
                "unit": "tonnes"
            },
            "co2e": {
                "ar4": {
                    "amount": 0.2333,
                    "unit": "tonnes"
                },
                "ar5": {
                    "amount": 0.2334,
                    "unit": "tonnes"
                }
            }
        },
        "emissions_factor": {
            "ar4": {
                "amount": 8.812,
                "unit": "kgCO2e/unit"
            },
            "ar5": {
                "amount": 8.813,
                "unit": "kgCO2e/unit"
            }
        }
    },
    "geo": {
        "lat": 45.5152,
        "long": 122.6784
    },
    "origin_measurement_timestamp": "2022-06-26 02:31:29",
    "raw_data": 103.45,
    "source": "company_fleet_management_database",
    "units": "gal"
}
```

### Sample and bring your own emissions factor models

The json document below is a sample emissions factor model for testing and development purposes only. To use this solution or develop your own related solution please customize and update your own emissions factor models to represent your reporting requirements.

[Sample Emissions Factor Model](lib/stacks/stack-data-pipeline/construct-calculator/emissions_factor_model_2022-05-22.json). This is the lookup table used for coefficient inputs to the calculator microservice.

Calculation methodologies reflected in this solution are aligned with the sample model, and this calculator stack may require modification if a new model is applied. To review calculation methodology and lookup tables please review the [carbon data lake Emissions Calculator Stack](lib/stacks/stack-data-pipeline/construct-calculator/README.md).

## 👀 See also

- [AWS Energy & Utilities](https://aws.amazon.com/energy/)

## 🔐 Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## Appendix

### Troubleshooting

For users with an Apple M1 chip, you may run into the following error when executing npm commands: "no matching version found for node-darwin-amd64@16.4.0" or similar terminal error output depending on the version of node you are running. If this happens, execute the following commands from your terminal in order (this fix assumes you have node version manager (nvm) installed). In this example, we will use node version 16.4.0. Replace the node version in these commands with the version you are running:
```sh
nvm uninstall 16.4.0
```
```sh
arch -x86_64 zsh
```
```sh
nvm install 16.4.0
```
```sh
nvm alias default 16.4.0
```
