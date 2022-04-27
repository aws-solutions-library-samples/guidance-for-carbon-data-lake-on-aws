import json
import os
import string
import random
import time
from typing import Dict, List
from dataclasses import dataclass, asdict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

@dataclass
class InputEvent:
  root_id: str
  parent_id: str
  action_taken: str
  storage_type: str
  storage_location: str

"""
INPUT: Event from the central SFN workflow with records to be added to the queue for data lineage ledger
PROCESS: For each input record, generate a `child_id`, and send the record to the queue
OUTPUT: Return an array of child_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
  event = InputEvent(**event)
  data_handler = DataHandler(os.environ["SQS_QUEUE_URL"])

  # generate uid - the child_id will become the parent_id for subsequent child nodes
  alphabet = string.ascii_letters + string.digits
  child_id = "".join(random.choices(alphabet, k=8))

  # timestamp attribute is used to restructure the tree and set TTL on DDB
  recordedAt = int(time.time())

  message = {
    **asdict(event),
    "child_id": child_id,
    "recordedAt": recordedAt
  }

  # publish record to queue
  data_handler.sqs.send_message(json.dumps(message))
  return