from cgi import test
from uuid import uuid4
from moto import mock_sqs, mock_s3
import unittest
import os
import sys
import boto3
import logging
import json

os.environ["POWERTOOLS_TRACE_DISABLED"] = "true"

sys.path.insert(1, os.path.join(os.getcwd(), "lib/data-compaction-pipeline/lambda"))
from enumerate_directories.handlers import SQSHandler, S3Handler

@mock_s3
class TestS3Handler(unittest.TestCase):
    def setUp(self) -> None:
        logging.disable(logging.CRITICAL)
        session = boto3.Session()
        self.s3 = session.resource("s3", region_name="us-east-1")
        self.bucket = self.create_mock_bucket()

        self.s3_handler = S3Handler(session, self.bucket.name)
        self.s3_handler.s3_client = self.s3.meta.client
        self.s3_handler.bucket = self.bucket.name
        return super().setUp()

    def tearDown(self) -> None:
        self.s3_handler = None
        self.bucket.objects.all().delete()
        self.bucket.delete()
        self.s3 = None
        logging.disable(logging.NOTSET)
        return super().tearDown()
    
    def test_list_directories_null(self):
        parent_directory = "today/"
        test_keys = [ "a.txt", "b.txt", "c.txt", "d.txt" ]
        expected_output = []
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))
        
        response = self.s3_handler.list_directories(prefix=parent_directory)
        self.assertListEqual(response, expected_output)
    
    def test_list_directories_no_parent(self):
        parent_directory = "today/"
        test_keys = [ "today/a.txt", "today/b.txt", "today/c.txt", "today/d.txt" ]
        expected_output = []
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))
        
        response = self.s3_handler.list_directories(prefix=parent_directory)
        self.assertListEqual(response, expected_output)
    
    def test_list_directories_actual(self):
        parent_directory = "today/"
        test_keys = [
            "today/a/a.txt",
            "today/b/b.txt",
            "today/c/c.txt",
            "today/d/d.txt"
        ]
        expected_output = [ "a", "b", "c", "d" ]
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))
        
        response = self.s3_handler.list_directories(prefix=parent_directory)
        self.assertListEqual(response, expected_output)
    
    def test_list_directories_nested(self):
        parent_directory = "today/"
        test_keys = [
            "today/a/1/a.txt",
            "today/b/2/b.txt",
            "today/c/3/c.txt",
            "today/d/4/d.txt"
        ]
        expected_output = [ "a", "b", "c", "d" ]
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))
        
        response = self.s3_handler.list_directories(prefix=parent_directory)
        self.assertListEqual(response, expected_output)
        self.bucket.objects.all().delete()

    def create_mock_bucket(self):
        bucket_name = "Test"
        self.s3.create_bucket(Bucket=bucket_name)
        return self.s3.Bucket(bucket_name)

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