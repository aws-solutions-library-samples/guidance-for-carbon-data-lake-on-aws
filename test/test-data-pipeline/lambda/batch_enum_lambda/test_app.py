from typing import List
import unittest
from unittest import mock
import os
import sys
import logging

# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/pipeline/lambda"))
from batch_enum_lambda.app import lambda_handler

from .mock_helpers import lambda_context, MockDataHandler

class TestEnumFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        return super().setUp()
    
    def tearDown(self) -> None:
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    @mock.patch('batch_enum_lambda.app.DataHandler')
    @mock.patch.dict(os.environ, { "TRANSFORMED_BUCKET_NAME": "something" })
    def test_normal_input(self, dh_mock):
        test_input = { "batch_location_dir": "PARENT_ID" }
        dh_mock.return_value = MockDataHandler()

        expected_response = [ 
            { "node_id": "_", "storage_location": "s3://<bucket>/<key>" }
        ]

        response = lambda_handler(test_input, lambda_context())
        self.assertIsInstance(response, List)
        # check correct object keys are present in output
        self.assertListEqual(
            sorted(response[0].keys()),
            sorted(expected_response[0].keys())
        )
    
    @mock.patch('batch_enum_lambda.app.DataHandler')
    @mock.patch.dict(os.environ, { "TRANSFORMED_BUCKET_NAME": "something" })
    def test_false_input(self, dh_mock):
        test_input = {  }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())

    @mock.patch('batch_enum_lambda.app.DataHandler')
    def test_no_environment_variable(self, dh_mock):
        test_input = { "batch_location_dir": "PARENT_ID" }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())
