import unittest
from unittest import mock
import os
import sys
import logging

# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from input_function.app import lambda_handler

from .mock_helpers import MockDataHandler, lambda_context

class TestInputFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        return super().setUp()
    
    def tearDown(self) -> None:
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_single_record(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "parent_id": "PARENT_ID",
            "record": {
                "storage_location": "s3://<bucket>/<key>"
            }
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "ttl_expiry": 1653750819,
            "recordedAt": 1653664419,
            "storage_location": "s3://<bucket>/<key>",
            "node_id": "<some_random_id>"
        }
        dh_mock.return_value = MockDataHandler()
        response = lambda_handler(test_input, lambda_context())
        # check all required keys are in the response
        self.assertListEqual(sorted(expected_result.keys()), sorted(response.keys()))
        # check no values are None or empty
        self.assertNotIn(None, response.values())
        self.assertNotIn("", response.values())
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_single_record_with_node(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "parent_id": "PARENT_ID",
            "record": {
                "node_id": "NODE_ID",
                "storage_location": "s3://<bucket>/<key>"
            }
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "ttl_expiry": 1653750819,
            "recordedAt": 1653664419,
            "storage_location": "s3://<bucket>/<key>",
            "node_id": "<some_random_id>"
        }
        dh_mock.return_value = MockDataHandler()
        response = lambda_handler(test_input, lambda_context())
        # check all required keys are in the response
        self.assertListEqual(sorted(expected_result.keys()), sorted(response.keys()))
        # check no values are None or empty
        self.assertNotIn(None, response.values())
        self.assertNotIn("", response.values())
        # provided node_id and output node_id should be the same
        self.assertEqual(test_input["record"]["node_id"], response["node_id"])
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_multiple_records(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "parent_id": "PARENT_ID",
            "action_taken": "TEST_CASE",
            "records": [
                {
                    "storage_location": f"s3://<bucket>/<key_{i}>"
                } for i in range(5)
            ]
        }

        expected_result = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "ttl_expiry": 1653750942,
            "recordedAt": 1653664542,
            "records": []
        }
        dh_mock.return_value = MockDataHandler()
        response = lambda_handler(test_input, lambda_context())
        # check all required keys are in the response
        self.assertListEqual(sorted(expected_result.keys()), sorted(response.keys()))
        # check no values are None or empty
        self.assertNotIn(None, response.values())
        self.assertNotIn("", response.values())
        self.assertNotIn([], response.values())
        # check node_id has been generated for records
        self.assertIn("node_id", response["records"][0])
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_multiple_records_with_node(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "parent_id": "PARENT_ID",
            "action_taken": "TEST_CASE",
            "records": [
                {
                    "node_id": f"NODE_ID_{i}",
                    "storage_location": f"s3://<bucket>/<key_{i}>"
                } for i in range(5)
            ]
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "ttl_expiry": 1653750942,
            "recordedAt": 1653664542,
            "records": []
        }
        dh_mock.return_value = MockDataHandler()
        response = lambda_handler(test_input, lambda_context())
        # check all required keys are in the response
        self.assertListEqual(sorted(expected_result.keys()), sorted(response.keys()))
        # check no values are None or empty
        self.assertNotIn(None, response.values())
        self.assertNotIn("", response.values())
        self.assertNotIn([], response.values())
        # check test node_id has been assigned to each record
        self.assertEqual(
            response["records"][0]["node_id"],
            test_input["records"][0]["node_id"]
        )
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_multiple_records_with_global_location(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "parent_id": "PARENT_ID",
            "action_taken": "TEST_CASE",
            "storage_location": "OVERRIDE_LOCATION",
            "records": [
                {
                    "node_id": f"NODE_ID_{i}",
                    "storage_location": f"s3://<bucket>/<key_{i}>"
                } for i in range(5)
            ]
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "ttl_expiry": 1653750942,
            "recordedAt": 1653664542,
            "records": []
        }
        dh_mock.return_value = MockDataHandler()
        response = lambda_handler(test_input, lambda_context())
        # check all required keys are in the response
        self.assertListEqual(sorted(expected_result.keys()), sorted(response.keys()))
        # check no values are None or empty
        self.assertNotIn(None, response.values())
        self.assertNotIn("", response.values())
        self.assertNotIn([], response.values())
        # check global storage_location has been assigned to each record
        self.assertEqual(
            response["records"][0]["storage_location"],
            test_input["storage_location"]
        )
    
    @mock.patch('input_function.app.DataHandler')
    @mock.patch.dict(os.environ, {"SQS_QUEUE_URL": "something"})
    def test_empty_record(self, dh_mock):
        test_input = { }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())
    
    @mock.patch('input_function.app.DataHandler')
    def test_missing_environment_variable(self, dh_mock):
        test_input = {
            "root_id": "ROOT_ID",
            "action_taken": "TEST_CASE",
            "parent_id": "PARENT_ID",
            "record": {
                "node_id": "NODE_ID",
                "storage_location": "s3://<bucket>/<key>"
            }
        }
        dh_mock.return_value = MockDataHandler()
        self.assertRaises(KeyError, lambda_handler, test_input, lambda_context())

if __name__ == '__main__':
    unittest.main()