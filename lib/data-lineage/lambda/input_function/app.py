import json
import os
import string
import random
import time
from dataclasses import dataclass
from typing import Dict, List, Optional

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

@dataclass
class Record:
    storage_location: Optional[str]
    node_id: Optional[str] # if a node_id is not provided, one will be generated

@dataclass
class SingleRecord: # expected JSON payload input for a single record
    root_id: str
    parent_id: str
    action_taken: str
    record: Record

@dataclass
class MultiRecord: # expected JSON payload input for multiple records
    root_id: str
    parent_id: str
    action_taken: str
    records: List[Record]
    # if global storage location is provided, override any storage locations within the records array
    storage_location: Optional[str] = ""

# alphabet used for generating uids randomly
ALPHABET = string.ascii_letters + string.digits

"""
INPUT: Event from the central SFN workflow with records to be added to the queue for data lineage ledger
PROCESS: For each input record, generate a `node_id`, and send the record to the queue
OUTPUT: Return an array of node_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    # setup data handler to manage communications with other AWS services
    data_handler = DataHandler(os.environ["SQS_QUEUE_URL"])
    
    # timestamp attribute is used to rebuild the DL tree and set TTL on DDB
    recordedAt = int(time.time())
    ttl = recordedAt + 60 * 60 * 24 # ttl of 24 hours after creation
    
    # record template used to prepopulate common attributes across records
    record_template = {
        "root_id": event["root_id"],
        "parent_id": event["parent_id"],
        "action_taken": event["action_taken"],
        "ttl_expiry": ttl,
        "recordedAt": recordedAt
    }

    record = handle_multiple_records(event, record_template, data_handler) \
        if "records" in event \
        else handle_single_record(event, record_template, data_handler)
    

    # delete parent_id - future nodes to point to current node_id for future branches
    del record["parent_id"]

    return record

def handle_single_record(event: Dict, record_template: Dict, dh: DataHandler):
    event = SingleRecord(**event)

    # no global storage location attribute for single records
    record_template["storage_location"] = event.record["storage_location"]

    # if no predefined node_id, generate one
    record_template["node_id"] = event.record["node_id"] \
        if "node_id" in event.record \
        else "".join(random.choices(ALPHABET, k=8))
    
    # send to queue
    dh.sqs.send_message(json.dumps(record_template))

    return record_template

def handle_multiple_records(event: Dict, record_template: Dict, dh: DataHandler):
    event = MultiRecord(**event)

    records = []
    for input_record in event.records:
        record = record_template.copy()

        # check if a global storage location has been provided
        record["storage_location"] = event.storage_location \
            if event.storage_location != "" \
            else input_record["storage_location"]
        
        # if no predefined node_id, generate one
        record["node_id"] = input_record["node_id"] \
            if "node_id" in input_record \
            else "".join(random.choices(ALPHABET, k=8))
        
        records.append(record)
    
    # send all records to queue
    dh.sqs.send_batched_messages(records)
    
    # keep node_id and storage_location in records for next node
    if event.storage_location != "":
        record_template["storage_location"] = event.storage_location
        record_template["records"] = [{ "node_id": x["node_id"] } for x in records ]
    else:
        record_template["records"] = [
            {
                "node_id": x["node_id"],
                "storage_location": x["storage_location"]
            } for x in records
        ]

    return record_template
