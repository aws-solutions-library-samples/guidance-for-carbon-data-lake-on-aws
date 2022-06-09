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

sys.path.insert(1, os.path.join(os.getcwd(), "lib/pipeline/lambda"))
from batch_enum_lambda.handlers import S3Handler

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
    
    def test_list_directory_files_prefix(self):
        # upload files to prefix directory and list prefix directory
        prefix = "ROOT_ID"
        test_keys = [ "a.txt", "b.txt", "c.txt", "d.txt" ]
        expected_output = [ f"s3://{self.bucket.name}/{prefix}/{key}" for key in test_keys ]
        
        for key in test_keys:
            path = os.path.join(prefix, key)
            self.bucket.Object(path).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))

        response = self.s3_handler.list_directory_files(prefix=prefix)
        self.assertListEqual(response, expected_output)
    
    def test_list_directory_files_null(self):
        # upload no files and list root - expect none
        prefix = "ROOT_ID"
        expected_output = []

        response = self.s3_handler.list_directory_files(prefix=prefix)
        self.assertListEqual(response, expected_output)
    
    def test_list_directory_files_no_prefix(self):
        # upload all files to root and list root directory
        test_keys = [ "a.txt", "b.txt", "c.txt", "d.txt" ]
        expected_output = [ f"s3://{self.bucket.name}/{key}" for key in test_keys ]
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))

        response = self.s3_handler.list_directory_files(prefix="")
        self.assertListEqual(response, expected_output)
    

    def test_list_directory_files_suffix(self):
        # fetch only the .csv files from the root directory
        suffix=".csv"
        test_keys = [ "a.txt", "b.txt", "c.txt", "d.csv" ]
        expected_output = [ f"s3://{self.bucket.name}/d.csv" ]
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))

        response = self.s3_handler.list_directory_files(suffix=suffix)
        self.assertListEqual(response, expected_output)

    def test_list_directory_files_prefix_suffix(self):
        # fetch only the .csv files from the prefix directory
        prefix = "ROOT_ID"
        suffix = ".csv"
        test_keys = [ "a.txt", "b.txt", "c.txt", "d.csv" ]
        expected_output = [ f"s3://{self.bucket.name}/{prefix}/d.csv" ]
        
        for key in test_keys:
            path = os.path.join(prefix, key)
            self.bucket.Object(path).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))

        response = self.s3_handler.list_directory_files(prefix=prefix, suffix=suffix)
        self.assertListEqual(response, expected_output)
    
    def test_list_directory_files_incorrect_prefix(self):
        # upload files to root, but list files in subfolder - expecting empty list
        prefix = "ROOT_ID"
        test_keys = [ "a.txt", "b.txt", "c.txt" ]
        expected_output = []
        
        for key in test_keys:
            self.bucket.Object(key).upload_file(os.path.join(
                os.path.dirname(__file__),
                "test.txt"
            ))

        response = self.s3_handler.list_directory_files(prefix=prefix)
        print(response)
        self.assertListEqual(response, expected_output)


    def create_mock_bucket(self):
        bucket_name = "Test"
        self.s3.create_bucket(Bucket=bucket_name)
        return self.s3.Bucket(bucket_name)

if __name__ == '__main__':
    unittest.main()