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

