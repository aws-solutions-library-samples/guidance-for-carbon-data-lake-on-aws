# Welcome to CarbonLake Quickstart CDK Application

CarbonLake Quickstart is a decarbonization measurement data solution built on existing AWS Services. CarbonLake Quickstart reduces the undifferentiated heavy lifting of ingesting, standardizing, transforming, and calculating carbon and ghg emission data so that customers can build decarbonization reporting, forecasting, and analytics solutions and products to drive innovation. CarbonLake includes a purpose-built data pipeline, data quality stack, data lineage stack, calculator engine, Business Intelligence tools, managed forecasting service, GraphQL API, and sample web application. CarbonLake data is ingested through the CarbonLake landing zone, and can be ingested from any service within or connected to the AWS cloud.

- [What you will build](#what-you-will-build)
- [Costs and licenses](#costs-and-licenses)
- [Prepare your environment and launch CarbonLake (Quick Setup)](#prepare-your-environment-and-launch-carbonlake-quick-setup)
- [Prepare your environment (Manual Setup)](#prepare-your-environment-manual-setup)

## What you will build

![carbonlake architectural diagram](resources/architecture/carbonlake-quickstart-v1-architecture-image.png)

- Shared Resource Stack
- CI/CD Pipeline
- Step Functions Workflow Data Pipeline
  - Data Quality
  - Data Transform
  - Emissions Calculator Microservice
- Data Lineage
- GraphQL API
- Forecast Notebook
- Quicksight Module
- Web Application
- Sample Data Collection
- Unit Tests
- Integration Tests
- Functional Tests
- Emissions Factor Reference Databases

## Cost and Licenses

TODO --> Insert cost table for services

## How to Deploy

You can deploy CarbonLake Quickstart through the quick setup process, or through the manual setup process. Read on for information about each.

### (Quick Setup) Prepare your environment and launch CarbonLake

#### Prerequisites

1. Install node.js
2. Install AWS CLI
3. Install Docker

#### Quick setup with CarbonLake CLI (WIP Under Contstruction)

1. Navigate to CarbonLake CLI Directory --> `cd <the directory of this readme>/tools/cli`
2. Install the CLI dependencies `npm install`
3. Run `node .`

This script will prompt you for inputs that are required, including which modules you want to deploy. Follow the prompts in the script.

When you run the script here are the actions it will take on your local machine and in your AWS account:

1. Ask you for application setup parameters like Application Name, Admin Email
2. Ask you which optional modules you want to deploy
3. Install all dependencies
4. Configure your AWS environment credentials
5. Bootstrap the CDK
6. Open links to setup optional modules such as Quicksight
7. Output a context file to supply deployment parameters
9. Deploy all modules in your AWS account
10. Run optional end to end tests to make sure the pipeline is working as expected

### (Manual Setup) Prepare your environment and launch CarbonLake

### Prerequisites

STOP! Before you proceed you need to set up your quicksight account and user. This needs to be done manually in the console, so please open this link and follow the instructions [here](carbonlake-quickstart/lib/quicksight/README.md).

Deploying the Forecast stack? If you're an internal AWS Isengard user you will need to request a Sagemaker notebook limit increase at this link:

1. Go to [Sagemaker Tools](https://sagemaker-tools.corp.amazon.com/limits)
2. Select the resource type dropdown
3. Select `notebook instances`
4. Select `notebook-instance/ml.t2.large` and select 1 instance as the limit
5. Under justification required enter: Quickstart development.
6. Press enter

#### Install Dependencies

* Docker --> https://docs.docker.com/get-docker/
* AWS CLI --> https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
* Node --> https://nodejs.org/en/download/
* CDK --> `npm install -g aws-cdk`


#### Set up your environment

* Configure your AWS credentials --> `aws configure`
* Get your AWS Account Number --> `aws sts get-caller-identity`
* Bootstrap CDK so that you can build cdk assets --> `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`

##### Prepare your environment (Manual Setup)

1. Navigate to CDK Directory
2. Build the dependencies `npm ci`
3. Set `cdk.context.json` values --> The `cdk.context.json` file tells the CDK Toolkit the context and parameters for your app.
4. Select optional modules and visit their respective README.md files to review setup before you deploy
   - [Quicksight Module](carbonlake-quickstart/lib/quicksight/documentation/README.md) --> If you are deploying this you must follow the directions in the [README](carbonlake-quickstart/lib/quicksight/documentation/README.md)
   - [Amplify Web Application Module](carbonlake-quickstart/front-end/carbonlake-ui/README.md)
   - Forecast Module
   
   
**You will need to define:**

* `adminEmail`            The email address for the administrator of the app
* `quicksightUserName`    Required if deploying QuickSight stack. Username of user who will have access to the carbon emissions dataset and dashboard. Make sure you review [Quickstart setup instructions](carbonlake-quickstart/lib/quicksight/documentation/README.md)
* `repoBranch`            The branch name that you want to automatically deploy in your pipeline
* Then you will need to confirm `true` for the optional modules you are deploying and `false` for the optional modules you are NOT deploying. The default is false for all optional modules.

### Get Started Deploying the CDK App and Stacks

* `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"` --> If you are deploying only for local development this will deploy all of the CarbonLake stacks without the CI/CD pipeline.
* `cdk deploy --all` --> If you are deploying the full CI/CD pipeline will deploy the pipeline and you will have to connect your repo for automated deployment. Use the README for the gitlab mirroring component to get set up.

### The most common workflow is to:

1. Check out a branch
2. Work on the branch, deploying for local development via `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`
3. Merge your branch back into the development branch
4. This will trigger deployment in an automated test environment within the Isengard account: `carbonlake-quickstart+test@amazon.com`

## Reference & Resources

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

### Calculator Output Model

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

### GHG Protocol Emission factors

[GHG Protocol Lookup Table Model](carbonlake-quickstart/sample-data/emissions_factor_model_2022-04-26.json)


## End to End Integration Test

### Automated Test and Validation Instructions

TODO

### Manual Test Instructions

TODO

