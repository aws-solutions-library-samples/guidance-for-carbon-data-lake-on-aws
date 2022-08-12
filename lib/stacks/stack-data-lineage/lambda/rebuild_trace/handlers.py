import json
from decimal import Decimal
from typing import Dict, List

import boto3
from boto3.dynamodb.conditions import Key

from aws_lambda_powertools import Logger

class DataHandler:
    def __init__(self, input_table, output_bucket) -> None:        
        self.session = boto3.Session()
        self.input_db = InputDBHandler(self.session, input_table)
        self.s3 = S3Handler(self.session, output_bucket)
    
class S3Handler:
    def __init__(self, session, bucket) -> None:
        self.logger = Logger("s3handler", child=True)
        self.s3 = session.resource("s3")
        self.bucket = self.s3.Bucket(bucket)
    
    def put_item_jsonl(self, data: List, key: str) -> None:
        self.logger.info(f"Adding {len(data)} records to s3")
        body = "\n".join([ json.dumps(x, cls=DecimalEncoder) for x in data ])
        self.bucket.put_object(Body=body, Key=key)
        return f"{self.bucket.name}/{key}"

class InputDBHandler:
    def __init__(self, session, table_name) -> None:
        self.logger = Logger("dbhandler", child=True)
        self.db = session.resource("dynamodb")
        self.table = self.db.Table(table_name)
    
    def query_by_action(self, root_id, action, last_eval_key=None) -> Dict:
        # if last_eval_key is provided, further records exist in DDB
        if last_eval_key is not None:
            response = self.table.query(
                IndexName="action-index",
                KeyConditionExpression=Key("root_id").eq(root_id) & Key("action_taken").eq(action),
                ExclusiveStartKey=last_eval_key,
                Limit=1000
            )
        else:
            response = self.table.query(
                IndexName="action-index",
                KeyConditionExpression=Key("root_id").eq(root_id) & Key("action_taken").eq(action),
                Limit=1000
            )
        return response
    
    def query_by_action_pgn(self, root_id, action) -> List:
        response = self.query_by_action(root_id, action)
        items = response["Items"]
        
        # iterate queries until all records have been retrieved
        # if "LastEvaluatedKey" exists in the response, further records exist in DDB
        while "LastEvaluatedKey" in response:
            response = self.query_by_action(
                root_id,
                action,
                last_eval_key=response["LastEvaluatedKey"]
            )
            items.extend(response["Items"])

        return items
    
    def conditionally_query_by_root(self, root_id, actions, last_eval_key=None):
        expression = {}
        for index, action in enumerate(actions):
            action_str = f":action{index}"
            expression[action_str] = action
        
        if last_eval_key is not None:
            response = self.table.query(
                KeyConditionExpression=Key("root_id").eq(root_id),
                FilterExpression=f"not( action_taken in ({', '.join(expression.keys())}) )",
                ExpressionAttributeValues=expression,
                ExclusiveStartKey=last_eval_key,
                Limit=1000
            )
        else:
            response = self.table.query(
                KeyConditionExpression=Key("root_id").eq(root_id),
                FilterExpression=f"not( action_taken in ({', '.join(expression.keys())}) )",
                ExpressionAttributeValues=expression,
                Limit=1000
            )
        return response
    
    def conditionally_query_by_root_pgn(self, root_id, actions):
        response = self.conditionally_query_by_root(root_id, actions)
        items = response["Items"]

        while "LastEvaluatedKey" in response:
            response = self.conditionally_query_by_root(root_id, actions, last_eval_key=response["LastEvaluatedKey"])
            items.extend(response["Items"])
        
        return items

class DecimalEncoder(json.JSONEncoder):
  def default(self, o):
    if isinstance(o, Decimal):
      if o % 1 > 0:
        return float(o)
      else:
        return int(o)
    return super(DecimalEncoder, self).default(o)
