# Carbonlake - Calculator service

This calculator is built to manage individual and batch calculations using the sample emissions factor model provided for development purposes. We recommend modifying this data structure to reflect your own emissions factor reporting requirements. To bring your own emissions factor model:

1. Modify and/or replace the existing [emissions factor sample document](../../../../lib/stacks/stack-data-pipeline/construct-calculator/emissions_factor_model_2022-05-22.json)
2. Alternatively make a copy and point the emissions factor lookup table component to the new filename by editing the [Calculator Construct](../../../../lib/stacks/stack-data-pipeline/construct-calculator/construct-calculator.ts#L86)
3. If you are making substantial changes beyond category and/or emissions factor coefficients you may have to edit the Calculator Microservice stack to reflect changes in input category headers. This will include editing the `generateItem` method and the `IDdbEmissionFactor` interface found in the [Calculator Construct](../../../../lib/stacks/stack-data-pipeline/construct-calculator/construct-calculator.ts#L86)

## Trigger calculation
The calculator function
- reads input data from the Input S3 Bucket (defined by the environment variable `INPUT_S3_BUCKET_NAME`)
- calculates the emissions, based on the Emissions factor table
- writes output data in the Output S3 Bucket (defined by the environment variable `OUTPUT_S3_BUCKET_NAME`)
- writes output data in the Output DynamoDB table (defined by the environment variable `OUTPUT_DYNAMODB_TABLE_NAME`)

This function is invoked as the last step of the [data processing pipeline](../README.md):
- The Input S3 Bucket is the `TransformedBucket`
- The Output S3 Bucket is the `EnrichedBucket`

Notes:
- Input data is **NOT** deleted from the Input S3 Bucket after it has been processed

### Input
The request to invoke the calculator Lambda function contains the key of the inpout object.
```jsonc
{ "storage_location": "calculator_input_example.jsonl" }
```

### Output
The calculator Lambda function returns the key of the outpout object and an array of all the processed events.
```jsonc
{
    "storage_location": "s3://<output_bucket>/<key>",
    "records": [ 
        { "node_id": "<activity_event_id>" }, 
        {}, 
        {}
        ...
    ]
}
```

## Sample files
### Sample Input
```jsonc
{"activity_event_id": "customer-carbonlake-12345", "asset_id": "vehicle-1234", "geo": {"lat": 45.5152, "long": 122.6784 }, "origin_measurement_timestamp": "2022-06-26 02:31:29",  "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 103.45, "units": "gal"}
{"activity_event_id": "customer-carbonlake-12346", "asset_id": "vehicle-1235", "geo": {"lat": 45.5152, "long": 122.6784 }, "origin_measurement_timestamp": "2022-06-26 03:31:29",  "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 254.12, "units": "gal"}
```

### Sample Output
```jsonc
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