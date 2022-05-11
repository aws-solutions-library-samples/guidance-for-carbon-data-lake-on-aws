from typing import Dict
import boto3

from aws_lambda_powertools import Logger


class DataHandler:
    def __init__(self, table_name) -> None:        
        self.session = boto3.Session()
        self.db = DBHandler(self.session, table_name)

class DBHandler:
    def __init__(self, session, table_name) -> None:
        self.logger = Logger("hpc.dbhandler", child=True)
        self.db = session.resource("dynamodb")
        self.table = self.db.Table(table_name)

    def put(self, item: Dict) -> int:
        self.logger.info(f"Adding item '{item}' to table {self.table.name}")
        response = self.table.put_item(Item=item)
        return response["ResponseMetadata"]["HTTPStatusCode"]
    
    def put_batch(self, items) -> None:
        self.logger.info(f"Adding {len(items)} to table {self.table.name}")
        with self.table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)

