from typing import Dict

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.tracing import Tracer

logger = Logger(service="carbonlake", level="debug")
tracer = Tracer()

"""
INPUT: Blank SFN initiation event
PROCESS: 
    1. generate the initial hash id for the job (this will be the DL root_id for all child records)
    2. determine the file type of the input to choose the correct process / DQ workflow
OUTPUT: Return an array of child_id's for the next 
"""
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler()
def lambda_handler(event: Dict, context: Dict):

    return
