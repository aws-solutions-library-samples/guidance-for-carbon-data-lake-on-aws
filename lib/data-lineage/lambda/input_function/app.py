import json
import os
import string
import random
import time
from typing import Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

"""
INPUT: Event from the central SFN workflow with records to be added to the queue for data lineage ledger
    {
        "root_id": "",
        "action_taken": "",
        "parent_id": "",
        "record": { # present if only single record requires processing
            "node_id": "OPTIONAL"
            "storage_location": ""
        }
        "records": [
            { "node_id": "<OPTIONAL>", "storage_location": "" }
        ]
    }
PROCESS: For each input record, generate a `node_id`, and send the record to the queue
OUTPUT: Return an array of node_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    # setup data handler to manage communications with other AWS services
    data_handler = DataHandler(os.environ["SQS_QUEUE_URL"])
    
    # alphabet used for generating uids randomly
    alphabet = string.ascii_letters + string.digits
    
    # timestamp attribute is used to rebuild the DL tree and set TTL on DDB
    recordedAt = int(time.time())
    ttl = recordedAt + 60 * 60 * 24 # ttl of 24 hours after creation
    
    record = {
        "root_id": event["root_id"],
        "parent_id": event["parent_id"],
        "action_taken": event["action_taken"],
        "ttl_expiry": ttl,
        "recordedAt": recordedAt
    }
    
    if "records" in event:
        records = []
        for raw_record in event["records"]:
            # need to handle batched records
            _record = record.copy()
            _record["storage_location"] = raw_record["storage_location"]

            if "node_id" not in raw_record:
                _record["node_id"] = "".join(random.choices(alphabet, k=8))
            else:
                _record["node_id"] = raw_record["node_id"]
            
            records.append(_record)
        
        data_handler.sqs.send_batched_messages(records)
        
        # record["records"] = [ { "node_id": x["node_id"], "storage_location": x["storage_location"] } for x in records ]
        
    else:
        record["storage_location"] = event["record"]["storage_location"]
        # if node_id not provided, need to generate one
        if "node_id" not in event["record"]:
            record["node_id"] = "".join(random.choices(alphabet, k=8))
        else:
            record["node_id"] = event["record"]["node_id"]
        
        # send to queue
        data_handler.sqs.send_message(json.dumps(record))
        
    # delete parent_id - future nodes to point to current node_id for future branches
    del record["parent_id"]

    return record