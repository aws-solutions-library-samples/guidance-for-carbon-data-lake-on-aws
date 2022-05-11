import json
import os
from typing import Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

# terminus actions are those actions taken that result in an edge node being created
TERMINUS_ACTIONS = [
    "CALCULATION_COMPLETE",
    "DQ_CHECK_FAIL"
]

"""
INPUT: Payload from SFN with a root_id
PROCESS: For the provided root_id, query all records in the data lineage DDB table and rebuild the record lineage trace
OUTPUT: Reconstructed trace saved to DDB trace tabel and S3 as .jsonl
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    dh = DataHandler(
        input_table=os.environ.get("INPUT_TABLE_NAME"),
        output_table=os.environ.get("OUTPUT_TABLE_NAME"),
        output_bucket=os.environ.get("OUTPUT_BUCKET_NAME")
    )
    
    trace = []

    # query per action taken - this gets all terminus records
    terminus_records = []

    for action in TERMINUS_ACTIONS:
        records = dh.input_db.query_by_action_pgn(event["root_id"], action)
        terminus_records.extend(records)
    
    logger.info(f"Fetched {len(terminus_records)} total terminus records from DDB")

    # get all non-terminus records per root_id
    all_other_records = dh.input_db.conditionally_query_by_root_pgn(event["root_id"], TERMINUS_ACTIONS)
    all_other_records = { record["node_id"]:record for record in all_other_records }

    logger.info(f"Fetched {len(all_other_records)} non-terminus records from DDB")

    # for every terminus_record, trace back the branch to the root
    for record in terminus_records:
        lineage = []
        lineage.append(record)

        parent_id = record["parent_id"]

        # when parent_id === root_id, the full lineage for a record has been captured
        while parent_id != record["root_id"]:
            parent_node = all_other_records[parent_id]
            parent_id = parent_node["parent_id"]
            lineage.append(parent_node)
        
        # reverse the lineage to build in correct time series order
        lineage.reverse()
        # add lineage to full trace object
        trace.append({
            "record_id": record["node_id"],
            "root_id": record["root_id"],
            "lineage": lineage
        })

    # save output to ddb
    dh.output_db.batch_put_item(trace)
    # save output to s3

    return { "root_id": event["root_id"], "total_records": len(trace) }
