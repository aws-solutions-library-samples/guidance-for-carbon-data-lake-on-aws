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
PROCESS: For each input record, generate a `child_id`, and send the record to the queue
OUTPUT: Return an array of child_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    # setup data handler to manage communications with other AWS services
    data_handler = DataHandler(os.environ["SQS_QUEUE_URL"])

    # alphabet used for generating uids randomly
    alphabet = string.ascii_letters + string.digits

    # generate uid - the child_id will become the parent_id for subsequent child nodes
    child_id = "".join(random.choices(alphabet, k=8))

    # timestamp attribute is used to rebuilt the DL tree and set TTL on DDB
    recordedAt = int(time.time())

    message = { **event, "child_id": child_id, "recordedAt": recordedAt }

    # publish record to queue
    data_handler.sqs.send_message(json.dumps(message))
    
    response = {
        "root_id": event["root_id"],
        "parent_id": child_id,
        "action": event["action"],
        "storage_type": event["storage_type"],
        "storage_location": event["storage_location"]
    }

    return response
