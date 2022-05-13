# Welcome to your CDK TypeScript project

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`                          compile typescript to js
* `npm run watch`                          watch for changes and compile
* `npm run test`                           perform the jest unit tests
* `cdk deploy --context adminEmail=value`  deploy this stack to your default AWS account/region w/ a pre-created admin user
* `cdk diff`                               compare deployed stack with current state
* `cdk synth`                              emits the synthesized CloudFormation template

## To set up your environment

* `aws configure`
* `npm install -g aws-cdk`
* `aws sts get-caller-identity`
* `cdk bootstrap aws://ACCOUNT-NUMBER/REGION`

# What you'll build

* Pipeline
* Calculator
* Data Lineage
* Web Application

# AWS Architecture

[See working architectural diagram here](https://design-inspector.a2z.com/?#ICarbonLake-QSV1-Simplified-Architecture)

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
