# Carbonlake - Data Processing Pipeline

Detailed below are the required inputs and the computed outputs of every main task within the workflow:

## Kickoff Lambda Function
Invoked by a PUT request on the `landing` S3 bucket, this function parses the input event, generates a unique id for the input file and starts the Step Functions pipeline.

```jsonc
{
    "input": "S3 PUT Event",
    "output": {
        "input": {
            "root_id": "Global unique identifier for the input file",
            "storage_location": "s3://<landing_bucket>/<key>.csv"
        }
    }
}
```

## Data Lineage Request: RAW_DATA_INPUT
Submit a data lineage request for the RAW_DATA_INPUT phase, indicating that a file has been created in the `landing` S3 bucket and is now being processed.

```jsonc
{
    "input": {
        "root_id": "the unique id for this input file",
        // as this is the first data lineage request, the parent_id is equal to the node_id
        "parent_id": "the unique id for this input file",
        "action_taken": "RAW_DATA_INPUT",
        "record": {
            "storage_location": "Full S3 URI for the input file in the landing S3 bucket"
        }
    },
    "output": {
        "data_lineage": {
            "root_id": "the unique id for this input file",
            "action_taken": "RAW_DATA_INPUT",
            "storage_location": "Full S3 URI for the input file in the landing S3 bucket",
            // this node_id is used in subsequent data lineage requests as a parent_id to construct a tree
            "node_id": "generated unique id for this data lineage 'node'"
        }
    }
}
```

## Data Quality Component

TODO: @armdiazg or @jangna to describe the data quality component

### Setup Lambda Function
Create all of the necessary DataBrew resources to profile the data -> dataset, ruleset and profile job.
```jsonc
{
    "input": {
        "event_type": "SETUP",
        "storage_location": "S3 URI of the file in the landing bucket",
        "root_id": "Unique identifier for results storage"
    },
    "output": {
        "data_quality": { // identifiers of all created databrew resources
            "dataset_name": "name of the created dataset",
            "dataset_arn": "arn of the created dataset",
            "ruleset_name": "name of the created ruleset",
            "ruleset_arn": "arn of the created ruleset",
            "job_name": "name of the created job",
            "job_arn": "arn of the created job",
        }
    }
}
```

### Run the Profile Job
Using the native Stepfunctions DataBrew integration, start a Glue DataBrew job
```jsonc
{
    "input": {
        "Name": "name of the profile job to run"
    },
    "output": {
        "data_quality": {
            "results": { "standard output from a DataBrew profile job" }
        }
    }
}
```

### Cleanup Lambda Function
Teardown all of the created DataBrew resources
```jsonc
{
    "input": {
        "event_type": "CLEANUP",
        "dataset_name": "name of the created dataset",
        "ruleset_name": "name of the created ruleset",
        "job_name": "name of the created job"
    },
    // no output required, whole event is passed to next task
}
```

### Check Results Lambda Function
Check the results of the DataBrew profile job and move the input file to the `raw` or `error` buckets as needed.
```jsonc
{
    "input": {
        "storage_location": "S3 Uri of the file in the landing bucket",
        "dq_results":  { "output from the databrew profile job, including `Location` of results file" }
    },
    "output": {
        "status": "true | false depending on the result of the profile job",
        "storage_location": "Updated S3 URI of the file in the `raw` or `error` bucket"
    }
}
```

## Data Lineage Request: DQ_CHECK_PASS
Submit a data lineage request for the DQ_CHECK_PASS phase, indicating that a file has passed the data quality checks.

```jsonc
{
    "input": {
        "root_id": "the unique id for this input file",
        "parent_id": "the node_id from the previous data lineage node",
        "action_taken": "DQ_CHECK_PASS",
        "record": {
            "storage_location": "Full S3 URI for the input file in the `raw` S3 bucket"
        }
    },
    "output": {
        "data_lineage": {
            "root_id": "the unique id for this input file",
            "action_taken": "DQ_CHECK_PASS",
            "storage_location": "Full S3 URI for the input file in the `raw` S3 bucket",
            "node_id": "generated unique id for this data lineage 'node'"
        }
    }
}
```

## Data Lineage Request: DQ_CHECK_FAIL
Submit a data lineage request for the DQ_CHECK_FAIL phase, indicating that a file has failed the data quality checks.

```jsonc
{
    "input": {
        "root_id": "the unique id for this input file",
        "parent_id": "the node_id from the previous data lineage node",
        "action_taken": "DQ_CHECK_FAIL",
        "record": {
            "storage_location": "Full S3 URI for the input file in the `error` S3 bucket"
        }
    },
    "output": {
        "data_lineage": {
            "root_id": "the unique id for this input file",
            "action_taken": "DQ_CHECK_FAIL",
            "storage_location": "Full S3 URI for the input file in the `error` S3 bucket",
            "node_id": "generated unique id for this data lineage 'node'"
        }
    }
}
```

## Error Notification - SNS
Send an email to the carbonlake administrator via SNS if a file has failed the data quality checks.

```jsonc
{
    "input": {
        "subject": "Data Quality check failed",
        "message": "Your Carbonlake Data Quality job has failed. Please review your dataset: {`s3 uri to file in landing bucket`}",
    },
    // no output required, whole event is passed to next task
}
```


## Glue Synchronous Transform
Use AWS Glue to break up a potentially large input CSV file into smaller chunks for downstream processing via the calculator.

```jsonc
{
    "input": {
        "JobName": "Name of the AWS Glue job to invoke",
        "Arguments": {
            // files will be batched and dumped into this prefix in the transformed S3 bucket
            "--UNIQUE_DIRECTORY": "The unique identifier generated by the kickoff function"
        }
    },
    "output": {
        "job_name": "Name of the invoked AWS Glue job",
        "job_id": "ID of the specific Glue job run",
        "job_state": "SUCCEEDED | FAILED | ERROR"
    }
}
```

## Enumerate Batches Lambda Function
Build an array of all the s3 keys created in the previous Glue transform step, each key is a different file containing a constant number of records.
```jsonc
{
    "input": {
        // batch_location_dir should be the same as the unique id created by the kickoff function
        "batch_location_dir": "The directory name of where files are stored in the transformed s3 bucket"
    },
    "output": {
        // array of s3_keys and generated node_ids for each file in the provided directory
        "batches": [
            {
                // node_id is generated here and used for the subsequent data lineage requests
                "node_id": "<generated_id>",
                "storage_location": "s3://transformed_bucket/<uid>/part_n.json"
            },
            {}, {}, // ...
        ],
    }
}
```

## Data Lineage Request: GLUE_BATCH_SPLIT
Submit a data lineage request for the GLUE_BATCH_SPLIT phase, indicating that a file has been successfully split into smaller chunks by AWS Glue. Each split file is a separate data lineage request added to the ledger, with the same prior node as `parent_id`.

```jsonc
{
    "input": {
        "root_id": "the unique id for this input file",
        "parent_id": "the node_id from the previous data lineage node",
        "action_taken": "GLUE_BATCH_SPLIT",
        "records": [ "the batches array from the previous enumerate files lambda function" ]
    },
    "output": {
        "data_lineage": {
            "root_id": "the unique id for this input file",
            "action_taken": "GLUE_BATCH_SPLIT",
            "records": {
                "node_id": "<generated_id> for this data lineage request",
                "storage_location": "s3://transformed_bucket/<uid>/part_n.json"
            }
        }
    }
}
```

## Dynamic Map State (Iterate through batches)
Step Functions uses a [map](https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-map-state.html) state to run a series of tasks for each object provided in the `batches` array, with a parameterised maximum parallelism. For every `storage_location` in the array, a new parallel execution is started with only the required information for the internal tasks to complete, not the full payload.

```jsonc
{
    "input": {
        "storage_location": "The full S3 URI of the split file in the transformed s3 bucket",
        "data_lineage": {
            "root_id": "The unique identifier for this process",
            "parent_id": "The unique identifier of the previous data lineage node"
        }
    },
    // output is discarded from the map state to reduce payload size as much as possible
}
```

## Calculate CO2e Lambda Function
Calculate the CO2 equivalent value for each record in the provided input file, store that value in DynamoDb and save the results to the enriched S3 bucket.

```jsonc
{
    "input": {
        "storage_location": "S3 URI of where to find the JSON records file in the transformed bucket"
    },
    "output": {
        "calculations": {
            "storage_location": "S3 URI of the file in the enriched S3 bucket",
            "records": [
                // an array of each emission_id within the original input dataset
                { "node_id": "unique id of an individual record" },
                { "node_id": "unique id of an individual record" },
                { "node_id": "unique id of an individual record" }, // ...
            ]
        }
    }
}
```

## Data Lineage Request: CALCULATION_COMPLETE
Submit a data lineage request for the CALCULATION_COMPLETE phase, indicating that a file has been successfully processed by the calculation lambda function and the record has been moved to the enriched S3 bucket.

```jsonc
{
    "input": {
        "root_id": "the unique id for this input file",
        "parent_id": "the node_id from the previous data lineage node",
        "action_taken": "CALCULATION_COMPLETE",
        "storage_location": "S3 URI of this batch of records in the enriched bucket",
        "records": [ "the records array from the calculation lambda function, with unique node_id's" ]
    },
    "output": {
        "data_lineage": {
            "root_id": "the unique id for this input file",
            "action_taken": "CALCULATION_COMPLETE",
            "storage_location": "S3 URI of this batch of records in the enriched bucket",
            "records": [
                // an array of each emission_id within the original input dataset
                { "node_id": "unique id of an individual record" },
                { "node_id": "unique id of an individual record" },
                { "node_id": "unique id of an individual record" }, // ...
            ]
        }
    }
}
```