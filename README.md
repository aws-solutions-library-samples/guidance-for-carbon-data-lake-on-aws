# Welcome to CarbonLake Quickstart CDK Application

CarbonLake Quickstart is a decarbonization measurement data solution built on AWS Services. CarbonLake Quickstart reduces the undifferentiated heavy lifting of ingesting, standardizing, transforming, and calculating carbon and ghg emission data so that customers can build decarbonization reporting, forecasting, and analytics solutions and products to drive innovation. CarbonLake includes a purpose-built data pipeline, data quality stack, data lineage stack, calculator engine, Business Intelligence tools, managed forecasting service, GraphQL API, and sample web application. CarbonLake data is ingested through the CarbonLake landing zone, and can be ingested from any service within or connected to the AWS cloud.

# Prepare your environment and launch CarbonLake (Quick Setup)

1. Navigate to CDK Directory --> `cd <the directory of this readme>`
2. Run `carbonlake-quick-setup.sh`
3. Install required dependencies
    * AWS CLI
    * AWS Amplify CLI
    * Node
    * NPM

This script will prompt you for inputs that are required, including which modules you want to deploy. Follow the prompts in the script.

When you run the script here are the actions it will take in your AWS account:

1. Configure your AWS environment credentials
2. Bootstrap the CDK 
3. Install all dependencies
4. Open link to install Docket
5. Open link to setup Quicksight account in your AWS region
6. Define inputs for context file include: adminEmail etc
7. Prompt for selection of optional CarbonLake modules that you would like to deploy
8. Deploy all modules in your AWS account

# Prepare your environment (Manual Setup)

## Setup up AWS dependencies

### Set up your Quicksight Account

* Step 1
* Step 2

## Install Dependencies

* Docker --> Docker is required for local asset bundling and building
* AWS CLI -->
* Node -->
* NPM --> 
* CDK --> `npm install -g aws-cdk`

## Prepare your environment (Manual Setup)

1. Navigate to CDK Directory -->
2. Set `cdk.context.json` values -->

## To set up your environment for CDK Development

* `aws configure`
* `npm install -g aws-cdk`
* `aws sts get-caller-identity`
* `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`

## Get Started Deploying the CDK App and Stacks

* `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`     deploy this stack to your default AWS account/region w/o the CDK pipeline
* `cdk deploy --all`                       deploy this application CI/CD stack and then link your repo for automated pipeline

## Helpful Commands for CDK

* `npm run build`                          compile typescript to js
* `cdk synth`                              emits the synthesized CloudFormation template
* `npm run watch`                          watch for changes and compile
* `npm run test`                           perform the jest unit tests
* `cdk diff`                               compare deployed stack with current state

## Context File

The `cdk.json` file tells the CDK Toolkit how to execute your app.

The `cdk.context.json` file tells the CDK Toolkit the context and parameters for your app. You will need to define:

* `adminEmail`            The email address for the administrator of the app
* `repoBranch`            The branch name that you want to automatically deploy in your pipeline



## To start deploying the CDK Stacks

* For AWS Internal Use (please remove before publication) --> You will need to increase account limits in your Isengard account to accommodate Sagemaker Notebook EC2 instance size `ml.t2.large`. Use [this link](https://sagemaker-tools.corp.amazon.com/limits) to increase your Sagemaker notebook instance account limits.
* If you are deploying only for local development `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"` will deploy all of the CarbonLake stacks without the CI/CD pipeline
* If you are deploying the full CI/CD pipeline `cdk deploy --all` will deploy the pipeline and you will have to connect your repo for automated deployment. Use the README for the gitlab mirroring component to get set up.

### The most common workflow is to:
1. Check out a branch
2. Work on the branch, deploying for local development via `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`
3. Merge your branch back into the development branch
4. This will trigger deployment in an automated test environment within the Isengard account: `carbonlake-quickstart+test@amazon.com`

# What you'll build

* Shared Resource Stack: S3, 
* Data Pipeline Step Function Workflow: AWS Step Function 
* Data Quality Module
* Event-Driven Carbon Emissions Calculator
* Data Lineage Module
* Forecasting Module
* BI and Analytics Module
* Web Application

# AWS Architecture

[See working architectural diagram here](https://design-inspector.a2z.com/?#ICarbonLake-QSV1-Simplified-Architecture)

#### Description
Insert detailed description of CarbonLake here.

A.
B.
C.
D.
E.
F.
G.
H.


## Calculator Input Model
[Calculator Data Input Model](carbonlake-quickstart/sample-data/calculator_input_single_record_example.json)
```json
{
    "activity_event_id": "customer-carbonlake-12345",
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

## Calculator Output Model
[Calculator Output Model](carbonlake-quickstart/sample-data/calculator_output_single_record_example.json)
```json
{
    "activity_event_id": "customer-carbonlake-12345",
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

## GHG Protocol Emission factors
[GHG Protocol Lookup Table Model](carbonlake-quickstart/sample-data/emissions_factor_model_2022-04-26.json)

# How to deploy

Please complete this section before submitting quickstart.

# Cost and Licenses

Please complete this section before submitting quickstart.
