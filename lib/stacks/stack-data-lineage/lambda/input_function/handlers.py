import json
import boto3
from typing import List
from aws_lambda_powertools.logging import Logger


class DataHandler:
    def __init__(self, queue_url) -> None:        
        self.session = boto3.Session()
        self.sqs = SQSHandler(self.session, queue_url)


class SQSHandler:
    def __init__(self, session, queue_url) -> None:
        self.logger = Logger("carbonlake.dbhandler", child=True)
        self.sqs = session.resource("sqs")
        self.queue = self.sqs.Queue(queue_url)
    
    def send_message(self, message: str):
        self.logger.debug("Sending message to topic: %s - %s" % (self.queue.url, message))
        response = self.queue.send_message(MessageBody=message)
        return response
    
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
