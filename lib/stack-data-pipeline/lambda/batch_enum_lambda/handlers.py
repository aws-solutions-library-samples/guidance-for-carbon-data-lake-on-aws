import boto3
from typing import List

from aws_lambda_powertools import Logger


class DataHandler:
    def __init__(self, bucket) -> None:        
        self.session = boto3.Session()
        self.s3 = S3Handler(self.session, bucket)

class S3Handler:
    def __init__(self, session, bucket):
        self.logger = Logger("carbonlake.s3handler", child=True)
        self.s3_client = session.client("s3")
        self.bucket = bucket
    
    def list_directory_files(self, prefix="", suffix="") -> List:
        self.logger.info("Fetching child files in directory %s" % prefix)
        paginator = self.s3_client.get_paginator("list_objects_v2")
        kwargs = { "Bucket": self.bucket, "Prefix": prefix }
        files = []
        for page in paginator.paginate(**kwargs):
            try:
                keys = [ f"s3://{self.bucket}/{obj['Key']}" for obj in page["Contents"] if obj["Key"].endswith(suffix) ]
                files.extend(keys)
            except:
                break
        return files


