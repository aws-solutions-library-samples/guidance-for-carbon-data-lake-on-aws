from collections import namedtuple
import datetime

SFN_DEFINITION = (
    '{"Comment": "An example of the Amazon States Language using a choice state.",'
    '"StartAt": "DefaultState",'
    '"States": '
    '{"DefaultState": {"Type": "Fail","Error": "DefaultStateError","Cause": "No Matches!"}}}'
)

def lambda_context():
    lambda_context = {
        "function_name": "test",
        "memory_limit_in_mb": 128,
        "invoked_function_arn": "arn:aws:lambda:eu-west-1:111111111111:function:test",
        "aws_request_id": "52fdfc07-2182-154f-163f-5f0f9a621d72",
    }

    return namedtuple("LambdaContext", lambda_context.keys())(*lambda_context.values())

class MockDataHandler:
    def __init__(self):
        self.sfn = MockSFNHandler()

class MockSFNHandler:
    def start_execution(self, _):
        return {
            'executionArn': 'string',
            'startDate': str(datetime.datetime.now())
        }
