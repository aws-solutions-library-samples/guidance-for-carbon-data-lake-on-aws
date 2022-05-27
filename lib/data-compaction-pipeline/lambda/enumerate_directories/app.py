import json
import os
import string
import random
from typing import Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer
from aws_lambda_powertools.utilities.data_classes import S3Event

from handlers import DataHandler

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

ALPHABET = string.ascii_letters + string.digits

"""
INPUT: Payload from Amazon Step Function - {
    "dir_location": "today"
}
PROCESS: Build a list of directories in the provided input directory, each directory name is the root_id of a data lineage tree
OUTPUT: publish a message to the SQS queue per root_id to be processed
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    # setup data handler to manage communications with other AWS services
    data_handler = DataHandler(
        bucket=os.environ.get("BUCKET_NAME"),
        queue_url=os.environ.get("SQS_QUEUE_URL")
    )

    # list objects in directory
    prefixes = data_handler.s3.list_directories(event["dir_location"] + "/")
    logger.info(f"Found {len(prefixes)} sub-directories in directory: {event['dir_location']}/")
    
    # standardise format for dl trace request
    messages = [ { "root_id": x } for x in prefixes];

    # send prefixes to queue
    data_handler.sqs.send_batched_messages(messages);

    return messages
