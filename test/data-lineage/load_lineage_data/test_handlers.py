from moto import mock_dynamodb
import unittest
import os
import sys
import logging
import boto3
from boto3.dynamodb.conditions import Key

os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from load_lineage_data.handlers import DBHandler

@mock_dynamodb
class TestDBHandler(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.ddb = session.resource("dynamodb", region_name="us-east-1")
        self.table = self.create_mock_table()

        self.db_handler = DBHandler(session, self.table.table_name)
        self.db_handler.db = self.ddb
        self.db_handler.table = self.table
        return super().setUp()
    
    def tearDown(self) -> None:
        self.db_handler = None
        self.table.delete()
        self.ddb = None
        logging.disable(logging.NOTSET)
        return super().tearDown()

    def test_put_item(self):
        test_item = { "root_id": "ROOT_ID", "node_id": "NODE_ID" }
        status_code = self.db_handler.put(test_item)
        # check items are in the database
        response = self.table.get_item(Key=test_item)

        self.assertEqual(status_code, 200)
        self.assertDictEqual(test_item, response["Item"])

    def test_put_item_batch_single(self):
        test_items = [{ "root_id": "ROOT_ID", "node_id": "NODE_ID" }]
        self.db_handler.put_batch(test_items)
        response = self.table.query(KeyConditionExpression=Key("root_id").eq("ROOT_ID"))
        self.assertListEqual(test_items, response["Items"])
    
    def test_put_item_batch_small(self):
        test_items = [{ "root_id": "ROOT_ID", "node_id": f"NODE_{i}" } for i in range(5)]
        self.db_handler.put_batch(test_items)
        response = self.table.query(KeyConditionExpression=Key("root_id").eq("ROOT_ID"))
        self.assertListEqual(test_items, response["Items"])
    
    def test_put_item_batch_large(self):
        test_items = [{ "root_id": "ROOT_ID", "node_id": f"NODE_{i}" } for i in range(11)]
        self.db_handler.put_batch(test_items)
        response = self.table.query(KeyConditionExpression=Key("root_id").eq("ROOT_ID"))
        r_items = [ x["node_id"] for x in response["Items"]]

        self.assertListEqual(sorted([x["node_id"] for x in test_items]),sorted(r_items))
        self.assertEqual(len(test_items), len(response["Items"]))

    def create_mock_table(self):
        table_name = "Test"
        self.ddb.create_table(
            TableName=table_name,
            KeySchema= [
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
                }
            ],
            BillingMode="PAY_PER_REQUEST"
        )
        return self.ddb.Table(table_name)


if __name__ == '__main__':
    unittest.main()