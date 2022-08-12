from dataclasses import dataclass
import json
import os
from typing import Any, Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer
from aws_lambda_powertools.utilities.data_classes import SQSEvent, event_source

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

"""
INPUT: Event from SQS with records to be added to the data lineage ledger
PROCESS: For each input record, fetch additional metadata from CarbonLake and store in DDB
OUTPUT: None
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
@event_source(data_class=SQSEvent)
def lambda_handler(event: SQSEvent, context: Dict):
    data_handler = DataHandler(os.environ["OUTPUT_TABLE_NAME"])

    messages = []
    for record in event.records:
        message = json.loads(record.body)
        logger.info(f"Processing record - child id = {message['node_id']}")

        # [OPTIONALLY] Fetch additional metadata and support information for the data lineage record
        ## Line number?
        ## Schema information?
        ## Store the actual record?
        ## Sequence number?

        messages.append(message)

    data_handler.db.put_batch(messages)

    return
