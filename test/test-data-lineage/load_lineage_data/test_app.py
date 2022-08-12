from uuid import uuid4
from moto import mock_dynamodb
import unittest
from unittest import mock
import os
import sys
import boto3
import json
import logging

# disable lambda powertools tracing
os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from load_lineage_data.app import lambda_handler

from .mock_helpers import MockDataHandler, lambda_context

@mock_dynamodb
class TestLoadDataFunction(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.ddb = session.resource("dynamodb", region_name="us-east-1")
        self.table = self.create_mock_table()
        return super().setUp()
    
    def tearDown(self) -> None:
        self.table.delete()
        self.ddb = None
        logging.disable(logging.NOTSET)
        return super().tearDown()

    @mock.patch('load_lineage_data.app.DataHandler')
    @mock.patch.dict(os.environ, {"OUTPUT_TABLE_NAME": "something"})
    def test_single_record(self, dh_mock):
        test_record = {"root_id": "ROOT_ID", "parent_id": "PARENT_ID", "action_taken": "TEST_ACTION", "ttl_expiry": 1653750961, "recordedAt": 1653664561, "storage_location": "s3://<bucket>/<key>", "node_id": "NODE_ID"}
        test_payload = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps(test_record),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table)
        
        response = lambda_handler(test_payload, lambda_context())
        # no response expected from Lambda
        self.assertIsNone(response)

        # check item has been added to ddb
        db_item = self.table.get_item(Key=test_record)
        self.assertDictEqual(test_record, db_item["Item"])
        
    
    @mock.patch('load_lineage_data.app.DataHandler')
    @mock.patch.dict(os.environ, {"OUTPUT_TABLE_NAME": "something"})
    def test_multiple_records_small(self, dh_mock):
        BATCH_SIZE = 5
        test_record = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({"root_id": "ROOT_ID", "parent_id": "PARENT_ID", "action_taken": "TEST_ACTION", "ttl_expiry": 1653750961, "recordedAt": 1653664561, "storage_location": "s3://<bucket>/<key>", "node_id": f"NODE_{i}"}),
                    "awsRegion": "eu-west-1"
                } for i in range(BATCH_SIZE)
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table)
        response = lambda_handler(test_record, lambda_context())
        # no response expected from Lambda
        self.assertIsNone(response)
        # verify number of items in DB equal to payload
        num_items = self.table.item_count
        self.assertEqual(num_items, BATCH_SIZE)
    
    @mock.patch('load_lineage_data.app.DataHandler')
    @mock.patch.dict(os.environ, {"OUTPUT_TABLE_NAME": "something"})
    def test_multiple_records_large(self, dh_mock):
        BATCH_SIZE = 11
        test_record = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps({"root_id": "ROOT_ID", "parent_id": "PARENT_ID", "action_taken": "TEST_ACTION", "ttl_expiry": 1653750961, "recordedAt": 1653664561, "storage_location": "s3://<bucket>/<key>", "node_id": f"NODE_{i}"}),
                    "awsRegion": "eu-west-1"
                } for i in range(BATCH_SIZE)
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table)
        response = lambda_handler(test_record, lambda_context())
        # no response expected from Lambda
        self.assertIsNone(response)
        # verify number of items in DB equal to payload
        num_items = self.table.item_count
        self.assertEqual(num_items, BATCH_SIZE)
    
    @mock.patch('load_lineage_data.app.DataHandler')
    @mock.patch.dict(os.environ, {"OUTPUT_TABLE_NAME": "something"})
    def test_null_record(self, dh_mock):
        test_record = {}
        test_payload = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps(test_record),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table)
        self.assertRaises(KeyError, lambda_handler, test_payload, lambda_context())
    

    @mock.patch('load_lineage_data.app.DataHandler')
    def test_missing_environment_variable(self, dh_mock):
        test_record = {"root_id": "ROOT_ID", "parent_id": "PARENT_ID", "action_taken": "TEST_ACTION", "ttl_expiry": 1653750961, "recordedAt": 1653664561, "storage_location": "s3://<bucket>/<key>", "node_id": "NODE_ID"}
        test_payload = {
            "Records": [
                {
                    "messageId": uuid4(),
                    "body": json.dumps(test_record),
                    "awsRegion": "eu-west-1"
                }
            ]
        }
        dh_mock.return_value = MockDataHandler(self.table)
        self.assertRaises(KeyError, lambda_handler, test_payload, lambda_context())


    def create_mock_table(self):
        table_name = "Test"
        self.ddb.create_table(
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
        return self.ddb.Table(table_name)
    
    def populate_mock_table(self, path):
        with open(path) as f:
            items = json.load(f)

        with self.table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)



if __name__ == '__main__':
    unittest.main()