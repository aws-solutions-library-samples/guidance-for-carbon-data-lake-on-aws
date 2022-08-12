from cgi import test
from uuid import uuid4
from moto import mock_sqs, mock_stepfunctions
import unittest
import os
import sys
import boto3
import logging
import json

os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/pipeline/lambda"))
from pipeline_kickoff.handlers import SFNHandler

from .mock_helpers import SFN_DEFINITION

@mock_stepfunctions
class TestS3Handler(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.sfn_client = session.client("stepfunctions")
        self.sfn_arn = self.create_mock_statemachine()
        
        self.sfn_handler = SFNHandler(session, self.sfn_arn)
        self.sfn_handler.sfn = self.sfn_client
        self.sfn_handler.arn = self.sfn_arn
        return super().setUp()

    def tearDown(self) -> None:
        self.sfn_client.delete_state_machine(stateMachineArn=self.sfn_arn)
        self.arn = None
        self.sfn_client = None
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    def test_start_execution(self):
        test_payload = json.dumps({ "something": "else" })
        response = self.sfn_handler.start_execution(test_payload)
        md = response["ResponseMetadata"]
        self.assertEqual(md["HTTPStatusCode"], 200)

    def create_mock_statemachine(self):
        name = "test_state_machine"
        sm = self.sfn_client.create_state_machine(
            name=name,
            definition=str(SFN_DEFINITION),
            roleArn="arn:aws:iam::111111111111:role/unknown_sf_role"
        )
        return sm["stateMachineArn"]

if __name__ == '__main__':
    unittest.main()