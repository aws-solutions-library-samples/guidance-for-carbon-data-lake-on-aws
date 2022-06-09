from collections import namedtuple

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
        self.sqs = MockSQSHandler()

class MockSQSHandler:
    def send_message(self, _):
        return {
            'MD5OfMessageBody': 'string',
            'MD5OfMessageAttributes': 'string',
            'MD5OfMessageSystemAttributes': 'string',
            'MessageId': 'string',
            'SequenceNumber': 'string'
        }

    def send_batched_messages(self, messages):
        return {
            'Successful': [ self.send_message(message) for message in messages ],
            'Failed': []
        }