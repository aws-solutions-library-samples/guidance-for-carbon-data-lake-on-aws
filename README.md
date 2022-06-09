# Welcome to CarbonLake Quickstart CDK Application

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

The `cdk.context.json` file tells the CDK Toolkit the context and parameters for your app. You will need to define:

* `adminEmail`            The email address for the administrator of the app
* `quicksightUserName`    Required if deploying QuickSight stack. Username of user who will have access to the carbon emissions dataset and dashboard
* `repoBranch`            The branch name that you want to automatically deploy in your pipeline

STOP! Before you proceed you also need to set up your quicksight account and user. This needs to be done manually in the console, so please open this link and follow the instructions [here](carbonlake-quickstart/lib/quicksight/README.md).

Deploying the Forecast stack? If you're an internal AWS Isengard user you will need to request a Sagemaker notebook limit increase at this link:

1. Go to [Sagemaker Tools](https://sagemaker-tools.corp.amazon.com/limits)
2. Select the resource type dropdown
3. Select `notebook instances`
4. Select `notebook-instance/ml.t2.large` and select 1 instance as the limit
5. Under justification required enter: Quickstart development.
6. Press enter

## Useful commands for reference only

* `npm run build`                          compile typescript to js
* `npm run watch`                          watch for changes and compile
* `npm run test`                           perform the jest unit tests\
* `cdk diff`                               compare deployed stack with current state
* `cdk synth`                              emits the synthesized CloudFormation template
* `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`     deploy this stack to your default AWS account/region w/o the CDK pipeline
* `cdk deploy --all`                       deploy this application CI/CD stack and then link your repo for automated pipeline

## To set up your environment

* Configure your AWS credentials --> `aws configure` or for internal AWS users `isengardcli assume <yourrole>`
* Install CDK if you haven't already --> `npm install -g aws-cdk`
* Get your AWS Account Number --> `aws sts get-caller-identity`
* Bootstrap CDK so that you can build cdk assets --> `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`

## To start deploying the CDK Stacks

* If you are deploying only for local development `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"` will deploy all of the CarbonLake stacks without the CI/CD pipeline
* If you are deploying the full CI/CD pipeline `cdk deploy --all` will deploy the pipeline and you will have to connect your repo for automated deployment

### The most common workflow is to:

1. Check out a branch
2. Work on the branch, deploying for local development via `cdk deploy "CarbonLakeQuickstartCiCdStack/Deploy/*"`
3. Merge your branch back into the development branch
4. This will trigger deployment in an automated test environment

## What you'll build

* Shared Resource Stack
* Data Pipeline Step Function Workflow
* Data Quality Module
* Event-Driven Carbon Emissions Calculator
* Data Lineage Module
* Forecasting Module
* BI and Analytics Module
* Web Application

## AWS Architecture

[See working architectural diagram here](https://design-inspector.a2z.com/?#ICarbonLake-QSV1-Simplified-Architecture)

## Calculator Input Model

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
