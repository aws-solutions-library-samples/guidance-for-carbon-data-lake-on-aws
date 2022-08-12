# Carbonlake - Calculator service

Calculation is based on the [GHG Emissions Calculation Tool](https://ghgprotocol.org/ghg-emissions-calculation-tool).  
CO2e emissions are calculated based on Global warming potential from the IPPC Report v4 and v5.

## Trigger calculation
The calculator function
- reads input data from the Input S3 Bucket (defined by the environment variable `INPUT_S3_BUCKET_NAME`)
- calculates the emissions, based on the GHG Protocol Emissions factor table
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