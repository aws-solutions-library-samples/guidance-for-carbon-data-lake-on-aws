# Welcome to CarbonLake Quickstart CDK Application

CarbonLake Quickstart is a decarbonization data accelerator solution built on existing AWS Services. CarbonLake Quickstart reduces the undifferentiated heavy lifting of ingesting, standardizing, transforming, and calculating carbon and ghg emission data so that customers can build decarbonization reporting, forecasting, and analytics solutions and products for internal and external use. CarbonLake includes a purpose-built data pipeline, data quality module, data lineage module, emissions calculator microservice, business intelligency services, managed forecasting service, graphQL api, and sample web application. CarbonLake data is ingested through the CarbonLake landing zone, and can be ingested from any service within or connected to the AWS cloud.

## 🛠 What you will build

![CarbonLake architectural diagram](resources/architecture/carbonLake-quickstart-v1-architecture-image.png)

- Shared Resource Stack
- CI/CD Pipeline
- Step Functions Workflow Data Pipeline
  - Data Quality
  - Data Transform
  - Emissions Calculator Microservice
- Data Lineage
- GraphQL API
- Sagemaker Notebook Instance
- Quicksight Module
- Web Application
- Sample Data Collection
- Unit Tests
- Integration Tests
- Functional Tests
- Emissions Factor Reference Databases

## 💲 Cost and Licenses

You are responsible for the cost of the AWS services used while running this Quick Start reference deployment. There is no additional cost for using this Quick Start.  

The AWS CloudFormation templates for this Quick Start include configuration parameters that you can customize. Some of these settings, such as instance type, affect the cost of deployment. For cost estimates, see the pricing pages for each AWS service you use. Prices are subject to change.

Tip: After you deploy the Quick Start,  create AWS Cost and Usage Reports to track costs associated with the Quick Start. These reports deliver billing metrics to an S3 bucket in your account. They provide cost estimates based on usage throughout each month and aggregate the data at the end of the month. For more information, see  What are AWS Cost and Usage Reports?

This Quick Start doesn’t require any software license or AWS Marketplace subscription.

## How to Deploy

You can deploy CarbonLake Quickstart through the manual setup process using AWS CDK. We recommend use of an AWS Cloud9 instance in your AWS account or VS Code and Isengard CLI. We also recommend that you either use a fresh isengard account for deployment, or a burner account.

## 🎒 Pre-requisites

- The [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) must be installed *and* configured with an AWS account on the deployment machine (see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html for instructions on how to do this on your preferred development platform).
- This project requires [Node.js](http://nodejs.org/). To make sure you have it available on your machine, try running the following command.
  ```sh
  node -v
  ```
- [Docker](https://docs.docker.com/get-docker/)
- For best experience we recommend installing CDK globally: `npm install -g aws-cdk`

## 🚀 Setup

### 1/ Manually Enable Amazon Quicksight

Before you proceed you need to set up your quicksight account and user. This needs to be done manually in the console, so please open this link and follow the instructions [here](lib/quicksight/documentation/README.md).

### 1.5/ AWS INTERNAL ONLY (REMOVE LATER): Enable Sagemaker Notebook Instance Type

Note for AWS users only (will be removed later). To deploy the forecast stack in an Isengard account If you're an internal AWS Isengard user you will need to request a Sagemaker notebook limit increase at this link:

1. Go to [Sagemaker Tools](https://sagemaker-tools.corp.amazon.com/limits)
2. Select the resource type dropdown
3. Select `notebook instances`
4. Select `notebook-instance/ml.t2.large` and select 1 instance as the limit
5. Under justification required enter: Quickstart development.
6. Press enter

### 2/ Ensure you are logged in to the Amazon ECR

This is needed to build lambda function assets locally in a docker container. You can do this from the command line:

```sh
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

### 3/ Make sure docker is running and build locally

Check that docker is running: [more from the docker site here](https://docs.docker.com/config/daemon/#check-whether-docker-is-running)

The operating-system independent way to check whether Docker is running is to ask Docker, using the `docker info` command.

You can also use operating system utilities, such as `sudo systemctl is-active docker` or `sudo status docker` or `sudo service docker status`, or checking the service status using Windows utilities.

Build the dependencies from `package.lock.json`: 

```sh
npm ci
```
Synthesize the CDK app locally:

```sh
cdk synth
```

### 4/ Set up your AWS environment

* Configure your AWS credentials --> `aws configure`
* Get your AWS Account Number --> `aws sts get-caller-identity`
* Bootstrap CDK so that you can build cdk assets --> `cdk bootstrap aws://ACCOUNT-NUMBER/REGION` or `cdk bootstrap` if you are authenticated through aws configure

### 5/ Prepare your CDK environment (Manual Setup)

1. Navigate to CDK Directory
2. Set `cdk.context.json` values --> The `cdk.context.json` file tells the CDK Toolkit the context and parameters for your app.

    **Context Variables**

    - `adminEmail`            The email address for the administrator of the app
    - `repoBranch`            The branch to deploy in your pipeline (default is `/main`)
    - `quicksightUserName`    Username for access to the carbon emissions dataset and dashboard.


Note: Make sure you review [QuickSight setup instructions](lib/quicksight/documentation/README.md)

### 6/ Get Started Deploying the CDK App and Stacks

- ✅  Recommended: deploy for local development 
  ```sh
  cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"
  ``` 
  👆 If you are deploying only for local development this will deploy all of the CarbonLake stacks without the CI/CD pipeline. This is recommended.

- ⛔️  Advanced User: deploy through CI/CD pipeline with linked repository
  ```sh
  cdk deploy --all
  ```
  👆 If you are deploying the full CI/CD pipeline will deploy the pipeline and you will have to connect your repo for automated deployment. Use the [README for the gitlab mirroring component](lib/ci-cd/gitlab-mirroring-aws-remove-later/README.md) to get set up. Please note that this will require some knowledge of DevOps services in AWS and is considered an advanced implementation.

### 7/ Set up the Amplify Web Application

To really test out the CarbonLake Quickstart please follow the [Web Application README](front-end/carbonlake-ui/documentation/README.md) to manually deploy the AWS Amplify sample web application.

## 🛠 Usage

Time to get started using CarbonLake Quickstart! Follow the steps below to see if everything is working and get familiar with this solution.

### 1/ Make sure all the Infrastructure Deployed Properly

In your command line shell you should see confirmation of all resources deploying. Did they deploy successfully? Any errors or issues? If all is successful you should see indication that CDK deployed. Continue!

### 2/ Drop some sythetic test data into the CarbonLake Landing Zone S3 Bucket

Time to test some data out and see if everything is working...
- Go to the S3 console and locate your CarbonLake landing zone bucket
- Upload [CarboLakeQS Synthetic Input Data](sample-data/carbon-lake-synthetic-input-data.csv) to the S3 bucket manually
- This will kick of the pipeline -- continue!

### 3/ Take a look at the step functions workflow
- Navigate to step functions service in the aws console
- On the left sidebar select "state machines" --> do you see a state machine present? Continue...
- Also on the left sidebar select "activities" --> do you see the pipeline as an activity? Continue...
- Have a quick look and familiarize yourself with the workflow

### 4/ Query your GraphQL API Endpoint
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

If you have not yet this is a great time to deploy the sample web application. Once you've run some data throught the pipeline you should see that successfully populating in the application. Please follow the [Web Application README](front-end/carbonlake-ui/documentation/README.md) to manually deploy the AWS Amplify sample web application.

### 6/ Try dropping some other sample data into the landing zone

- Generate or select some additional data (it can be anything really, but carbon emissions data is good)
- Test out the data quality module by dropping different data into the bucket. Does it run through? Do you get a notification if it does not?

### 7/ Start connecting your own data to the carbonlake landing zone

- Connect other data sources such as IoT, Streaming Data, Database Migration Workloads, or other applications to the S3 landing zone bucket. Try something out and let us know how it goes.

## 📚 Reference & Resources

### Helpful Commands for CDK

* `npm run build`                          compile typescript to js
* `npm run watch`                          watch for changes and compile
* `npm run test`                           perform the jest unit tests\
* `cdk diff`                               compare deployed stack with current state
* `cdk synth`                              emits the synthesized CloudFormation template
* `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`     deploy this stack to your default AWS account/region w/o the CDK pipeline
* `cdk deploy --all`                       deploy this application CI/CD stack and then link your repo for automated pipeline

### Data Model

#### Calculator Input Model

The model below describes the required schema for input to the CarbonLake calculator microservice. This is
[Calculator Data Input Model](sample-data/calculator_input_single_record_scope1_example.json)

```json
{
    "activity_event_id": "customer-CarbonLake-12345",
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

The model below describes the standard output model from the carbonlake emissions calculator microservice.

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

### GHG Protocol Emission factors

The json document below describes the emissions factor model extracted via python script from the GHG protocol emissions factor calculator excel spreadsheet last updated May 2022.

[GHG Protocol Lookup Table Model](lib/pipeline/calculator/emissions_factor_model_2022-05-22.json)


## Troubleshooting WIP

1. Docker daemon not running

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

Make sure docker is running either by starting docker desktop or with the command line.


## 👀 See also

- GHG Protocol Guidance
- CarbonLake Wiki

## 🔐 Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information. (TODO Implement this)


## Reference & Resources

### Helpful Commands for CDK

* `npm run build`                          compile typescript to js
* `npm run watch`                          watch for changes and compile
* `npm run test`                           perform the jest unit tests\
* `cdk diff`                               compare deployed stack with current state
* `cdk synth`                              emits the synthesized CloudFormation template


## CI Test

TODO

## Infra Validation Test

TODO

## End to End Integration Test

TODO

### Automated Test and Validation Instructions

TODO

### Manual Test Instructions

TODO