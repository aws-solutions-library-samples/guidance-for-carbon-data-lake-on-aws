import time
import json
import os
from typing import Dict
from datetime import datetime

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer
from aws_lambda_powertools.utilities.data_classes import SQSEvent, event_source

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

# terminus actions are those actions taken that result in an edge node being created
TERMINUS_ACTIONS = [
    "CALCULATION_COMPLETE",
    "CALCULATION_FAILED",
    "DQ_CHECK_FAIL"
]


"""
INPUT: Payload from SFN with a root_id
PROCESS: For the provided root_id, query all records in the data lineage DDB table and rebuild the record lineage trace
OUTPUT: Reconstructed trace saved to DDB trace tabel and S3 as .jsonl
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler(capture_response=False) # set capture_response as false to prevent message size limits from causing function failure
@event_source(data_class=SQSEvent)
def lambda_handler(event: SQSEvent, context: Dict):
    _record = json.loads(next(event.records).body) # function only takes one message from SQS

    dh = DataHandler(
        input_table=os.environ["INPUT_TABLE_NAME"],
        output_bucket=os.environ["OUTPUT_BUCKET_NAME"]
    )
    
    trace = []

    # query per action taken - this gets all terminus records
    terminus_records = []

    for action in TERMINUS_ACTIONS:
        records = dh.input_db.query_by_action_pgn(_record["root_id"], action)
        terminus_records.extend(records)
    
    logger.info(f"Fetched {len(terminus_records)} total terminus records from DDB")

    # get all non-terminus records per root_id
    all_other_records = dh.input_db.conditionally_query_by_root_pgn(_record["root_id"], TERMINUS_ACTIONS)
    all_other_records = { record["node_id"]:record for record in all_other_records }
    logger.info(f"Fetched {len(all_other_records)} non-terminus records from DDB")

    recordedAt = int(time.time())

    # for every terminus_record, trace back the branch to the root
    for record in terminus_records:
        lineage = []
        lineage.append(record)

        parent_id = record["parent_id"]
        bucket = record["storage_location"].split("/today/")[0]

        # when parent_id === root_id, the full lineage for a record has been captured
        while parent_id != record["root_id"]:
            parent_node = all_other_records[parent_id]
            parent_id = parent_node["parent_id"]
            lineage.append(parent_node)
        
        # reverse the lineage to build in correct time series order
        lineage.reverse()
        # add data compaction event that triggered this function to the lineage
        lineage.append({
            "action_taken": "DATA_COMPACTION",
            "node_id": "FINISHED",
            "parent_id": record["node_id"], # parent is the carbon record itself
            "root_id": record["root_id"],
            "recordedAt": recordedAt,
            "storage_location": f"{bucket}/{time.strftime('%Y-%m-%d')}/{record['root_id']}/"
        })
        # add lineage to full trace object
        trace.append({
            "record_id": record["node_id"],
            "root_id": record["root_id"],
            "lineage": lineage
        })

    # save output to s3
    now = datetime.now()
    prefix = f"{str(now.year)}/{datetime.strftime(now, '%m')}/{datetime.strftime(now, '%d')}" # /year/month/day
    dh.s3.put_item_jsonl(trace, f"{prefix}/{_record['root_id']}.jsonl")

    return { "root_id": _record["root_id"], "total_records": len(trace) }
