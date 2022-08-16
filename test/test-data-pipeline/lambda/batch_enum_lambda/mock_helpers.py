from collections import namedtuple
import random
import os

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
        self.s3 = MockS3Handler()

class MockS3Handler:
    def list_directory_files(self, prefix=""):
        return [ "s3://<bucket>/<key>" for _ in range(random.SystemRandom.randrange(2, 5)) ]
