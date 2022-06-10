from uuid import uuid4
from moto import mock_s3, mock_dynamodb
import unittest
import os
import sys
import boto3
import logging
import json


os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from rebuild_trace.handlers import S3Handler, InputDBHandler


@mock_s3
class TestS3Handler(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.s3 = session.resource("s3", region_name="us-east-1")
        self.bucket = self.create_mock_bucket()

        self.s3_handler = S3Handler(session, self.bucket.name)
        self.s3_handler.s3 = self.s3
        self.s3_handler.bucket = self.bucket
        return super().setUp()

    def tearDown(self) -> None:
        self.s3_handler = None
        self.bucket.objects.all().delete()
        self.bucket.delete()
        self.s3 = None
        logging.disable(logging.NOTSET)
        return super().tearDown()

    def test_put_item(self):
        test_key = "items.jsonl"
        test_items = [
            {"record_id": "RECORD_ID_1", "root_id": "ROOT_ID", "lineage": []},
            {"record_id": "RECORD_ID_2", "root_id": "ROOT_ID", "lineage": []}
        ]
        self.s3_handler.put_item_jsonl(test_items, test_key)
        object = self.bucket.Object(test_key)
        # check that the object actual exists in S3
        self.assertIn(object.key, [x.key for x in self.bucket.objects.all()])

        raw_data = object.get()["Body"].read().decode("utf-8")
        # verify that the data is line-separated json
        self.assertIn("\n", raw_data)
        # check the data is the same as the input once decoded
        data = [ json.loads(x) for x in raw_data.splitlines() ]
        self.assertListEqual(data, test_items)

    def create_mock_bucket(self):
        bucket_name = "Test"
        self.s3.create_bucket(Bucket=bucket_name)
        return self.s3.Bucket(bucket_name)


@mock_dynamodb
class TestDBHandler(unittest.TestCase):
    def setUp(self) -> None:
        session = boto3.Session()
        self.ddb = session.resource("dynamodb", region_name="us-east-1")
        self.table = self.create_mock_table()

        self.db_handler = InputDBHandler(session, self.table.table_name)
        self.db_handler.db = self.ddb
        self.db_handler.table = self.table

        self.populate_mock_table(os.path.join(os.path.dirname(__file__), "sample_data_small.json"))
        self.populate_mock_table(os.path.join(os.path.dirname(__file__), "sample_data_large.json"))

        self.TERMINUS_ACTIONS = [
            "CALCULATION_COMPLETE",
            "DQ_CHECK_FAIL"
        ]
        return super().setUp()

    def tearDown(self) -> None:
        self.db_handler = None
        self.table.delete()
        self.ddb = None
        return super().tearDown()

    def test_query_by_action(self):
        """
        load small dataset, expecting:
         - 1 records for RAW_DATA_INPUT
         - 1 records for DQ_CHECK_PASS
         - 1 records for GLUE_BATCH_SPLIT
         - 2 records for CALCULATION_COMPLETE
        """
        root_id = "ROOT_ID"

        response = self.db_handler.query_by_action(root_id, "RAW_DATA_INPUT")
        self.assertEqual(len(response["Items"]), 1)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)

        response = self.db_handler.query_by_action(root_id, "DQ_CHECK_PASS")
        self.assertEqual(len(response["Items"]), 1)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)

        response = self.db_handler.query_by_action(root_id, "GLUE_BATCH_SPLIT")
        self.assertEqual(len(response["Items"]), 1)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)

        response = self.db_handler.query_by_action(root_id, "CALCULATION_COMPLETE")
        self.assertEqual(len(response["Items"]), 2)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)
    
    def test_query_by_incorrect_action(self):
        # expecting 0 records returned with incorrect action, but suitable root_id
        root_id = "ROOT_ID"

        response = self.db_handler.query_by_action(root_id, "TEST_ACTION")
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)
        self.assertEqual(len(response["Items"]), 0)
    
    def test_query_by_action_incorrect_root(self):
        # expecting 0 records returned with incorrect root_id, but suitable action
        root_id = "FALSE_ROOT_ID"

        response = self.db_handler.query_by_action(root_id, "RAW_DATA_INPUT")
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)
        self.assertEqual(len(response["Items"]), 0)
    
    def test_query_by_action_pgn(self):
        """
        load large dataset, expecting:
         - 1 records for RAW_DATA_INPUT
         - 1 records for DQ_CHECK_PASS
         - 5 records for GLUE_BATCH_SPLIT
         - 100 records for CALCULATION_COMPLETE
        """
        root_id = "ROOT_ID_LARGE"

        items = self.db_handler.query_by_action_pgn(root_id, "RAW_DATA_INPUT")
        self.assertEqual(len(items), 1)
        items = self.db_handler.query_by_action_pgn(root_id, "DQ_CHECK_PASS")
        self.assertEqual(len(items), 1)
        items = self.db_handler.query_by_action_pgn(root_id, "GLUE_BATCH_SPLIT")
        self.assertEqual(len(items), 5)
        items = self.db_handler.query_by_action_pgn(root_id, "CALCULATION_COMPLETE")
        self.assertEqual(len(items), 100)
    
    def test_conditionally_query_by_root(self):
        """
        for small dataset, expecting 3 non-terminus records
        """
        root_id = "ROOT_ID"
        response = self.db_handler.conditionally_query_by_root(root_id, self.TERMINUS_ACTIONS)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)
        self.assertEqual(len(response["Items"]), 3)
    
    def test_conditionally_query_by_incorrect_root(self):
        """
        for small dataset, expecting 3 non-terminus records
        """
        root_id = "FALSE_ROOT_ID"
        response = self.db_handler.conditionally_query_by_root(root_id, self.TERMINUS_ACTIONS)
        self.assertEqual(response["ResponseMetadata"]["HTTPStatusCode"], 200)
        self.assertEqual(len(response["Items"]), 0)
    
    def test_conditionally_query_by_root_pgn(self):
        """
        for large dataset, expecting 7 non-terminus records
        """
        root_id = "ROOT_ID_LARGE"
        items = self.db_handler.conditionally_query_by_root_pgn(root_id, self.TERMINUS_ACTIONS)
        self.assertEqual(len(items), 7)
    
    def test_conditionally_query_by_incorrect_root_pgn(self):
        """
        for large dataset, expecting 7 non-terminus records
        """
        root_id = "FALSE_ROOT_ID"
        items = self.db_handler.conditionally_query_by_root_pgn(root_id, self.TERMINUS_ACTIONS)
        self.assertEqual(len(items), 0)

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
