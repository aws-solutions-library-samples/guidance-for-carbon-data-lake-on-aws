import json
from typing import Dict, List
from dataclasses import dataclass

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer
from aws_lambda_powertools.utilities.data_classes import SQSEvent

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

@dataclass
class InputEvent:
  root_id: str
  parent_id: str
  action: str

"""
INPUT: Event from the central SFN workflow with records to be added to the queue for data lineage ledger
PROCESS: For each input record, generate a `child_id`, and send the record to the queue
OUTPUT: Return an array of child_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
  event = InputEvent(**event)
  return