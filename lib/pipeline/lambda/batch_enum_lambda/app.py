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
    data_handler = DataHandler(os.environ.get("TRANSFORMED_BUCKET_NAME"))

    # list objects in directory
    files = data_handler.s3.list_directory_files(event["batch_location_dir"])
    logger.info(f"Found {len(files)} files in directory {event['batch_location_dir']}")

    # build sanitised array of objects
    # return array
    return files
