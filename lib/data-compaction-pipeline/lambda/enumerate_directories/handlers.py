import boto3
import json
from typing import Iterator, List

from aws_lambda_powertools import Logger


class DataHandler:
    def __init__(self, bucket, queue_url) -> None:        
        self.session = boto3.Session()
        self.s3 = S3Handler(self.session, bucket)
        self.sqs = SQSHandler(self.session, queue_url)

class SQSHandler:
    def __init__(self, session, queue_url) -> None:
        self.logger = Logger("carbonlake.dbhandler", child=True)
        self.sqs = session.resource("sqs")
        self.queue = self.sqs.Queue(queue_url)
    
    def send_batched_messages(self, messages: List) -> None:
        self.logger.info(f"Sending {len(messages)} message to queue - {self.queue.url}")
        MaxBatchSize = 10
        batches = [ messages[x:x+MaxBatchSize] for x in range(0, len(messages), MaxBatchSize)]

        for i, batch in enumerate(batches):
            entries = []
            for j, message in enumerate(batch):
                entries.append({
                    "Id": f"message-{i}-{j}",
                    "MessageBody": json.dumps(message)
                })

            self.queue.send_messages(Entries=entries)


class S3Handler:
    def __init__(self, session, bucket):
        self.logger = Logger("carbonlake.s3handler", child=True)
        self.s3_client = session.client("s3")
        self.bucket = bucket
    
    def list_directories(self, prefix="") -> Iterator[str]:
        self.logger.info("Fetching list of sub-directories under %s" % (prefix))
        paginator = self.s3_client.get_paginator("list_objects_v2")
        kwargs = { "Bucket": self.bucket, "Prefix": prefix, "Delimiter": "/" }
        files = []
        for page in paginator.paginate(**kwargs):
            try:
                full_prefixes = [x.get("Prefix") for x in page.get("CommonPrefixes")]
                [ files.append(x.split("/")[1]) for x in full_prefixes ]
            except:
                break
        return files
