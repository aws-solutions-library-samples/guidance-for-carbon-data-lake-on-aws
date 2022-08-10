from collections import namedtuple
from boto3.dynamodb.conditions import Key

def lambda_context():
    lambda_context = {
        "function_name": "test",
        "memory_limit_in_mb": 128,
        "invoked_function_arn": "arn:aws:lambda:eu-west-1:111111111111:function:test",
        "aws_request_id": "52fdfc07-2182-154f-163f-5f0f9a621d72",
    }

    return namedtuple("LambdaContext", lambda_context.keys())(*lambda_context.values())


class MockDataHandler:
    def __init__(self, table, bucket):
        self.input_db = MockDBHandler(table)
        self.s3 = MockS3Handler(bucket)

class MockS3Handler:
    def __init__(self, bucket):
        self.bucket = bucket

    def put_item_jsonl(self, data, key):
        return f"s3://{self.bucket.name}/{key}"

class MockDBHandler:
    def __init__(self, table):
        self.table = table

    def query_by_action_pgn(self, root_id, action):
        response = self.table.query(
            IndexName="action-index",
            KeyConditionExpression=Key("root_id").eq(root_id) & Key("action_taken").eq(action),
            Limit=1000
        )
        return response["Items"]
    
    def conditionally_query_by_root_pgn(self, root_id, actions):
        expression = {}
        for index, action in enumerate(actions):
            action_str = f":action{index}"
            expression[action_str] = action

        response = self.table.query(
            KeyConditionExpression=Key("root_id").eq(root_id),
            FilterExpression=f"not( action_taken in ({', '.join(expression.keys())}) )",
            ExpressionAttributeValues=expression,
            Limit=1000
        )
        return response["Items"]