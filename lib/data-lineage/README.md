# Carbonlake - Data Lineage Component

The Data Lineage component maintains a complete and verifiable history of data changes in the pipeline. Every operation conducted on a record is catalogued in a secure DynamoDB table to provide an auditable list of transactions; every 24 hours, the lineage tree is traversed and stored in Amazon S3 for interactive search and archive.

## Input Function

INPUT:

- Single or batched data lineage requests from the step functions pipeline
- At a minimum, requests must contain `root_id`, `parent_id`, `action_taken` and `storage_location`

```jsonc
{
  "root_id": "",
  "action_taken": "",
  "parent_id": "",
  "record": { // present if only single record requires processing
      "node_id": "<OPTIONAL>",
      "storage_location": "s3://<bucket>/<key>"
  },
  "records": [
      { "node_id": "<OPTIONAL>", "storage_location": "" }
  ]
}
```
PROCESS:
- Take Data Lineage requests from the pipeline, transform into standard format and publish to SQS

OUTPUT:
- Published records in the SQS queue
```jsonc
{
  "root_id": "<ROOT_ID>",
  "parent_id": "<PARENT_ID>",
  "action_taken": "<ACTION_TAKEN>",
  "recordedAt": "<CURRENT_UTC_TIME>",
  "storage_location": "s3://<bucket>/<key>",
  "node_id": "<NODE_ID>"
}
```

## Records SQS Queue

- Ephemeral storage of Data Lineage records to decouple the Data Lineage component from the core pipeline
- As records are published to the queue, the load records function takes a batch of records to add to DynamoDB
- The default batching window is set to 1 minute or 100 records.

## Load Records Function

INPUT:
- Function is invoked by new records landing in the SQS Queue
- Function payload is a standard SQS event with Data Lineage records available in the json `body`
```jsonc
{
  "Records": [
    {
      "messageId": "",
      "receiptHandle": "",
      "body": "{\"root_id\": \"<ROOT_ID>\", \"parent_id\": \"<PARENT_ID>\", \"action_taken\": \"<ACTION_TAKEN>\", \"recordedAt\": 0, \"storage_location\": \"s3://<bucket>/<key>\", \"node_id\": \"<NODE_ID>\"}",
      "attributes": {}
      "messageAttributes": {},
      "md5OfBody": "",
      "eventSource": "aws:sqs",
      "eventSourceARN": "",
      "awsRegion": ""
    }
  ]
  }
```
PROCESS:
- Take incoming records from the SQS Queue and add them to the DynamoDB table
- This function is mostly included for extensibility, any operations to include additional metadata in the data lineage record would be added here.

OUTPUT:
- Data lineage records stored in DynamoDB
- no repsonse returned from function.

## DynamoDB

- Every item in the table has a TTL of 24 hours
- All records are archived to S3 via the Trace Function

SCHEMA:
```jsonc
{
  "MAIN_INDEX": {
    // Every record has global root_id and local node_id
    "partition_key": "root_id",
    "sort_key": "node_id",
    "ttl_attribute": "ttl_expiry"
  },
  "GLOBAL_SECONDARY_INDEXES": [
    { // Allow querying by specific node_id
      "name": "node-index",
      "partition_key": "node_id",
      "projection_type": "ALL"
    }
  ],
  "LOCAL_SECONDARY_INDEXES": [
    { // Allow querying by root_id and by action_taken
      "name": "action-index",
      "partition_key": "root_id",
      "sort_key": "action_taken",
      "projection_type": "ALL"
    }
  ]
}
```

## Trace SQS Queue

- Adding a message with a `root_id` to this queue invokes the Trace function to rebuild the data lineage tree for that root
- There is no batching enabled on this integration, as a message enters the queue, the function is invoked.

## Trace Function

INPUT:
- Function is invoked by the daily compaction statemachine adding a message into the Trace SQS Queue
```jsonc
{ "root_id": "<root_id_to_trace>" }
```

PROCESS:
- Fetch lineage data from dynamodb and retrace the lineage tree back to the original `root_id`
- Correlate these lineage records together to create a record-wise structure.
- Add this data compaction trace step as the last node of the lineage array.
- Save the record to Amazon S3 for archive and search

OUTPUT:
```jsonc
{
  "record_id": "<record_id>",
  "root_id": "<root_id_to_trace>",
  "lineage": []
}
```
