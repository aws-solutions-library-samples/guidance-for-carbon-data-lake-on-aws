from typing import List
import unittest
from unittest import mock
import os
import sys
import logging

# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-compaction-pipeline/lambda"))
from enumerate_directories.app import lambda_handler

from .mock_helpers import lambda_context, MockDataHandler

class TestInputFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        return super().setUp()
    
    def tearDown(self) -> None:
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    @mock.patch('enumerate_directories.app.DataHandler')
    @mock.patch.dict(os.environ, { "BUCKET_NAME": "something", "SQS_QUEUE_URL": "something"})
    def test_normal_input(self, dh_mock):
        test_input = { "dir_location": "today" }
        dh_mock.return_value = MockDataHandler()

        response = lambda_handler(test_input, lambda_context())
        self.assertIsInstance(response, List)
    
    @mock.patch('enumerate_directories.app.DataHandler')
    @mock.patch.dict(os.environ, { "BUCKET_NAME": "something", "SQS_QUEUE_URL": "something"})
    def test_false_input(self, dh_mock):
        test_input = {  }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())
