import json
import string
import random
from typing import Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

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

    # DATA LINEAGE
    data_lineage = {}
    ## alphabet used for generating uids randomly
    alphabet = string.ascii_letters + string.digits
    ## root_id is the origin for all data lineage requests for this job batch
    data_lineage["root_id"] = "".join(random.choices(alphabet, k=12))
    ## this is the first node in the graph, node is its own parent
    data_lineage["parent_id"] = data_lineage["root_id"]

    # INPUT FILE ATTRIBUTES
    # TODO: Actually do a check to determine file type in s3 - for now, assuming csv
    file_attributes = {
        "file_type": "csv",
        "storage_type": "s3",
        "storage_location": "s3://<landing_bucket>/csv/raw.csv" # will get this from input event
    }

    
    # START STEP FUNCTION EXECUTION
    sfn_payload = { "file": file_attributes, "data_lineage": data_lineage } 
    
    return json.dumps(sfn_payload)
