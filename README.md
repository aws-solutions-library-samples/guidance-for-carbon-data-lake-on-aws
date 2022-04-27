# Welcome to your CDK TypeScript project

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

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
    "record_id": "customer-carbonlake-12345",
    "asset_id": "vehicle-1234", 
    "geo": [45.5152, 122.6784],
    "origin_measurement_timestamp":"2022-06-26 02:31:29", 
    "activity_id":{
        "scope": 1,
        "category": "mobile-combustion",
        "activity": "Diesel Fuel - Diesel Passenger Cars"
        }, 
    "source": "company_fleet_management_database", 
    "raw_data": 103.45,
    "units": "gal"
}
```

## Calculator Output Model
[Calculator Output Model](carbonlake-quickstart/sample-data/calculator_output_single_record_example.json)
```json
{
    "record_id": "customer-carbonlake-12345",
    "asset_id": "vehicle-1234",
    "activity_id": {
        "activity": "Diesel Fuel - Diesel Passenger Cars",
        "category": "mobile-combustion",
        "scope": 1
    },
    "emissions_output": {
        "calculated_emissions": {
            "ch4": {
                "amount": 0.00001,
                "unit": "tonnes"
            },
            "co2": {
                "amount": 0.024,
                "unit": "tonnes"
            },
            "co2e": {
                "amount": 0.2333,
                "unit": "tonnes"
            },
            "n20": {
                "amount": 0.00201,
                "unit": "tonnes"
            }
        },
        "emissions_factor": 8.812,
        "emissions_factor_reference": "ghg_protocol"
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
