import unittest
from unittest import mock
from uuid import uuid4
import os
import sys
import json
import logging
import boto3
from moto import mock_s3, mock_dynamodb

# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from rebuild_trace.app import lambda_handler

from .mock_helpers import lambda_context, MockDataHandler

@mock_s3
@mock_dynamodb
class TestRebuildTraceFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.s3 = session.resource("s3", region_name="us-east-1")
        self.db = session.resource("dynamodb", region_name="us-east-1")
        self.bucket = self.create_mock_bucket()
        self.table = self.create_mock_table()

        self.populate_mock_table(os.path.join(os.path.dirname(__file__), "sample_data_small.json"))

        return super().setUp()
    
    def tearDown(self) -> None:
        self.bucket.objects.all().delete()
        self.bucket.delete()
        self.table.delete()
        self.db = None
        self.s3 = None
        logging.disable(logging.NOTSET)
        return super().tearDown()

    @mock.patch("rebuild_trace.app.DataHandler")
    @mock.patch.dict(os.environ, {"INPUT_TABLE_NAME": "something", "OUTPUT_BUCKET_NAME": "something"})
    def test_single_record(self, dh_mock):
        test_event = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({ "root_id": "ROOT_ID" }),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "total_records": 0
        }
        dh_mock.return_value = MockDataHandler(self.table, self.bucket)
        response = lambda_handler(test_event, lambda_context())
        self.assertEqual(response.keys(), expected_result.keys())

    @mock.patch("rebuild_trace.app.DataHandler")
    @mock.patch.dict(os.environ, {"INPUT_TABLE_NAME": "something", "OUTPUT_BUCKET_NAME": "something"})
    def test_multiple_records(self, dh_mock):
        # for multiple records, only the first should be processed.
        test_event = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({ "root_id": "ROOT_ID_{i}" }),
                    "awsRegion": "eu-west-1"
                } for i in range(3)
            ]
        }
        expected_result = {
            "root_id": "ROOT_ID",
            "total_records": 0
        }
        dh_mock.return_value = MockDataHandler(self.table, self.bucket)
        response = lambda_handler(test_event, lambda_context())
        self.assertEqual(response.keys(), expected_result.keys())
    
    @mock.patch("rebuild_trace.app.DataHandler")
    @mock.patch.dict(os.environ, {"INPUT_TABLE_NAME": "something", "OUTPUT_BUCKET_NAME": "something"})
    def test_null_record(self, dh_mock):
        test_event = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({}),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table, self.bucket)
        self.assertRaises(KeyError, lambda_handler, test_event, lambda_context())
    
    @mock.patch("rebuild_trace.app.DataHandler")
    @mock.patch.dict(os.environ, {"INPUT_TABLE_NAME": "something", "OUTPUT_BUCKET_NAME": "something"})
    def test_invalid_record(self, dh_mock):
        test_event = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({ "root_id": "SOMETHING_INVALID" }),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        expected_response = { "root_id": "SOMETHING_INVALID", "total_records": 0 }
        dh_mock.return_value = MockDataHandler(self.table, self.bucket)
        response = lambda_handler(test_event, lambda_context())
        self.assertDictEqual(response, expected_response)
    
    @mock.patch('load_lineage_data.app.DataHandler')
    def test_missing_environment_variable(self, dh_mock):
        test_event = {
            "Records": [{
                "messageId": uuid4(),
                "body": json.dumps({ "root_id": "ROOT_ID" }),
                "awsRegion": "eu-west-1"
            }]
        }
        dh_mock.return_value = MockDataHandler(self.table, self.bucket)
        self.assertRaises(KeyError, lambda_handler, test_event, lambda_context())
    
    def create_mock_bucket(self):
        bucket_name = "Test"
        self.s3.create_bucket(Bucket=bucket_name)
        return self.s3.Bucket(bucket_name)
    
    def create_mock_table(self):
        table_name = "Test"
        self.db.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    "AttributeName": "root_id",
                    "KeyType": "HASH"
                },
                {
                    "AttributeName": "node_id",
                    "KeyType": "RANGE"
                }
            ],
            AttributeDefinitions=[
                {
                    "AttributeName": "root_id",
                    "AttributeType": "S"
                },
                {
                    "AttributeName": "node_id",
                    "AttributeType": "S"
                },
                {
                    "AttributeName": "action_taken",
                    "AttributeType": "S"
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "node-index",
                    "KeySchema": [
                        {
                            "AttributeName": "node_id",
                            "KeyType": "HASH"
                        }
                    ],
                    "Projection": {
                        "ProjectionType": "ALL"
                    }
                }
            ],
            LocalSecondaryIndexes=[
                {
                    "IndexName": "action-index",
                    "KeySchema": [
                        {
                            "AttributeName": "root_id",
                            "KeyType": "HASH"
                        },
                        {
                            "AttributeName": "action_taken",
                            "KeyType": "RANGE"
                        }
                    ],
                    "Projection": {
                        "ProjectionType": "ALL"
                    }
                }
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        return self.db.Table(table_name)
    
    def populate_mock_table(self, path):
        with open(path) as f:
            items = json.load(f)

        with self.table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)


if __name__ == '__main__':
    unittest.main()