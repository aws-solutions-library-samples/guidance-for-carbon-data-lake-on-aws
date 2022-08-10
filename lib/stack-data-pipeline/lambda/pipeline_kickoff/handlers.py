import boto3

from aws_lambda_powertools import Logger


class DataHandler:
    def __init__(self, sfn_arn) -> None:        
        self.session = boto3.Session()
        self.sfn = SFNHandler(self.session, sfn_arn)

class SFNHandler:
    def __init__(self, session, arn):
        self.logger = Logger("hpc.sfnhandler", child=True)
        self.sfn = session.client("stepfunctions")
        self.arn = arn
    
    def start_execution(self, payload) -> dict:
        self.logger.info("Starting step function %s with payload: %s" % (self.arn, payload))
        response = self.sfn.start_execution(
            stateMachineArn=self.arn,
            input=payload
        )
        if "executionArn" not in response.keys():
            raise Exception("Error starting state machine: %s" % self.arn)
        return response
