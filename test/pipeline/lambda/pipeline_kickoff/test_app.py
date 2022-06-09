from typing import List
import unittest
from unittest import mock
import os
import sys
import logging

from aws_lambda_powertools.utilities.data_classes import S3Event


# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/pipeline/lambda"))
from pipeline_kickoff.app import lambda_handler

from .mock_helpers import lambda_context, MockDataHandler

class TestKickoffFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        return super().setUp()
    
    def tearDown(self) -> None:
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    @mock.patch('pipeline_kickoff.app.DataHandler')
    @mock.patch.dict(os.environ, { "STATEMACHINE_ARN": "something" })
    def test_single_record(self, dh_mock):
        test_input = { "Records": [{ "s3": {
            "bucket": { "name": "bucket" },
            "object": { "key": "key.csv" }
        }}]}
        record = test_input['Records'][0]['s3']
        expected_response = { "input": {
            "root_id": "RANDOM_STRING",
            "storage_location": f"s3://{record['bucket']['name']}/{record['object']['key']}"
        }}
        dh_mock.return_value = MockDataHandler()

        response = lambda_handler(test_input, lambda_context())
        # check storage location is correctly formed
        self.assertEqual(
            response["input"]["storage_location"],
            expected_response["input"]["storage_location"]
        )
        # check whether all required keys are present
        self.assertListEqual(
            sorted(response["input"].keys()),
            sorted(expected_response["input"].keys())
        )
    
    @mock.patch('pipeline_kickoff.app.DataHandler')
    @mock.patch.dict(os.environ, { "STATEMACHINE_ARN": "something" })
    def test_null_record(self, dh_mock):
        test_input = { }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())
    
    @mock.patch('pipeline_kickoff.app.DataHandler')
    def test_no_environment_variable(self, dh_mock):
        test_input = { "Records": [] }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())

if __name__ == "__main__":
    unittest.main()