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
    "batch_location_dir": "<parent_id>"
}
PROCESS: Build a list of files in the provided input directory
OUTPUT: [
    "s3://<bucket_name>/part0_key.json",
    "s3://<bucket_name>/part1_key.json",
    "s3://<bucket_name>/part2_key.json",
    "s3://<bucket_name>/part3_key.json",
]
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    # setup data handler to manage communications with other AWS services
    data_handler = DataHandler(os.environ["TRANSFORMED_BUCKET_NAME"])

    # list objects in directory
    files = data_handler.s3.list_directory_files(event["batch_location_dir"])
    logger.info(f"Found {len(files)} files in directory {event['batch_location_dir']}")

    # build sanitised array of objects
    batches = [ { "node_id": generate_uid(), "storage_location": x } for x in files ]

    return batches

def generate_uid(length=8):
    # suppressing the bandit warning: random is not used for security/cryptographic purposes here. 
    # https://bandit.readthedocs.io/en/latest/blacklists/blacklist_calls.html?highlight=b311#b311-random
    return "".join(random.choices(ALPHABET, k=length)) #nosec 