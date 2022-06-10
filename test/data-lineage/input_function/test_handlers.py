from uuid import uuid4
from moto import mock_sqs
import unittest
import os
import sys
import boto3
import logging
import json

os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-lineage/lambda"))
from input_function.handlers import SQSHandler

@mock_sqs
class TestSQSHandler(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        sqs = session.resource("sqs", region_name="us-east-1")
        self.queue = sqs.create_queue(QueueName=str(uuid4())[0:6])

        self.sqs_handler = SQSHandler(session, self.queue.url)
        # override queue config created by default SQS handler
        self.sqs_handler.session = sqs
        self.sqs_handler.queue = self.queue
        return super().setUp()
    
    def tearDown(self) -> None:
        self.sqs_handler = None
        self.queue.delete()
        self.sqs = None
        logging.disable(logging.NOTSET)
        return super().tearDown()

    def test_send_message(self):
        msg = "some_test_message"
        self.sqs_handler.send_message(msg)

        messages = self.queue.receive_messages()
        self.assertEqual(len(messages), 1)
    
    def test_send_batched_messages_single(self):
        test_messages = [ "test_message_1" ]
        self.sqs_handler.send_batched_messages(test_messages)
        messages = self.queue.receive_messages()
        self.assertEqual(len(messages), 1)
        self.assertListEqual([json.loads(x.body) for x in messages], test_messages)
    
    def test_send_batched_messages_multiple(self):
        test_messages = [ "test_message_1", "test_message_2", "test_message_3" ]
        self.sqs_handler.send_batched_messages(test_messages)
        messages = self.queue.receive_messages(MaxNumberOfMessages=10)
        self.assertEqual(len(messages), 3)
    
    def test_send_batched_messages_many(self):
        test_messages = [ f"test_message_{str(x)}" for x in range(25) ]
        self.sqs_handler.send_batched_messages(test_messages)
        messages = []
        # max number of messages === 10, so check for 3 batches
        for _ in range(3):
            messages.extend(self.queue.receive_messages(MaxNumberOfMessages=10))
        
        self.assertEqual(len(messages), 25)


if __name__ == '__main__':
    unittest.main()