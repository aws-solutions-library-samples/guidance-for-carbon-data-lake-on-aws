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
INPUT: S3 PUT Event from the Landing S3 bucket
PROCESS: 
    1. generate the initial hash id for the job (this will be the DL root_id for all child records)
    2. determine the file type of the input to choose the correct process / DQ workflow
    3. start the step function to orchestrate to CO2e calculation job workflow
OUTPUT: None
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):
    event = S3Event(event)

    # setup data handler tp manage communication with other AWS services
    data_handler = DataHandler(os.environ["STATEMACHINE_ARN"])

    # alphabet used for generating uids randomly
    alphabet = string.ascii_letters + string.digits

    for record in event.records:

        s3uri = f"s3://{event.bucket_name}/{record.s3.get_object.key}"
        # TODO: Actually do a check to determine file type in s3 - for now, assuming csv
        logger.info(f"Processing file: {s3uri}")

        # root_id is the origin for all data lineage requests for this job batch
        # since this is the first node in the graph, node is its own parent
        root_id = "".join(random.choices(alphabet, k=12))

        data_input = {
            "root_id": root_id,
            "storage_location": s3uri
        }
        
        # START STEP FUNCTION EXECUTION
        sfn_payload = { "input": data_input } 
        data_handler.sfn.start_execution(json.dumps(sfn_payload))
    
    return sfn_payload
