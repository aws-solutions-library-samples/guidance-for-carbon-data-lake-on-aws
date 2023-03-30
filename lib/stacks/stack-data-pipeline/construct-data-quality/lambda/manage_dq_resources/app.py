"""
this file is a modified version of the functions within this existing repo (https://github.com/shafkevi/cdk-databrew-dynamic-job)
created by @shafkevi. Re-written into python3 by @awsford with small variations.
"""
import os
import json
import boto3
import logging
from typing import Dict, List
from urllib.parse import urlparse
from uuid import uuid4

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

databrew = boto3.client('databrew')
def lambda_handler(event: Dict[str, str], context: Dict) -> Dict:
    logger.info(json.dumps(event))

    if event["event_type"] == "SETUP":
        # generate a unique id shared amongst dq resources
        job_id = uuid4()

        # separate out s3key from full s3 uri
        s3_key = urlparse(event["storage_location"], allow_fragments=False).path.strip("/")

        # create a dataset for the provided s3 key
        dataset = create_databrew_dataset(f"dataset-{job_id}", s3_key)
        # get the arn of the newly created dataset
        dataset_arn = describe_databrew_dataset(dataset)

        # load validation rules from local file
        with open("./dq_rules.json", "r") as f:
            rules = json.load(f)
        
        # create ruleset to run as part of profile job
        ruleset = create_databrew_ruleset(f'ruleset-{job_id}', dataset_arn, rules)
        # get the arn of the newly created ruleset
        ruleset_arn = describe_databrew_ruleset(ruleset)

        # create the profile job
        job = create_databrew_profile_job(
            name=f'profile-job-{job_id}',
            dataset_name=dataset,
            ruleset_arn=ruleset_arn,
            results_key=event["root_id"]
        )
        # get the arn of the newly created profile job
        job_arn = describe_databrew_profile_job(job)

        # returned parameters are used to start the profile job and delete
        # the resources within the step functions workflow
        return {
            "dataset_name": dataset,
            "dataset_arn": dataset_arn,
            "ruleset_name": ruleset,
            "ruleset_arn": ruleset_arn,
            "job_name": job,
            "job_arn": job_arn
        }

    elif event["event_type"] == "CLEANUP":
        # delete the dataset, ruleset and profile job
        delete_databrew_profile_job(event["job_name"])
        delete_databrew_ruleset(event["ruleset_name"])
        delete_databrew_dataset(event["dataset_name"])
        return event
    else:
        raise Exception(f"{event['event_type']} : event_type is unknown")


def create_databrew_dataset(name: str, s3_key: str) -> str:
    response = databrew.create_dataset(
        Name=name,
        Format='CSV',
        Input={
            'S3InputDefinition': {
                'Bucket': os.environ["INPUT_BUCKET_NAME"],
                'Key': s3_key
            }
        }
    )
    return response["Name"]

def describe_databrew_dataset(name: str) -> str:
    response = databrew.describe_dataset(Name=name)
    return response["ResourceArn"]

def delete_databrew_dataset(name: str) -> str:
    response = databrew.delete_dataset(Name=name)
    return response["Name"]

def create_databrew_ruleset(name: str, arn: str, rules: List) -> str:
    response = databrew.create_ruleset(
        Name=name,
        Description="AWS Carbonlake Data Quality Ruleset",
        TargetArn=arn,
        Rules=rules
    )
    return response["Name"]

def describe_databrew_ruleset(name: str) -> str:
    response = databrew.describe_ruleset(Name=name)
    return response["ResourceArn"]

def delete_databrew_ruleset(name: str) -> str:
    response = databrew.delete_ruleset(Name=name)
    return response["Name"]

def create_databrew_profile_job(name: str, dataset_name: str, ruleset_arn: str, results_key: str) -> str:
    response = databrew.create_profile_job(
        Name=name,
        RoleArn=os.environ["PROFILE_JOB_ROLE"],
        DatasetName=dataset_name,
        ValidationConfigurations=[
            { 'RulesetArn': ruleset_arn }
        ],
        OutputLocation={
            "Bucket": os.environ["RESULTS_BUCKET_NAME"],
            'Key': results_key
        },
        MaxCapacity=5,
        MaxRetries=0,
        EncryptionMode="SSE-S3",
        LogSubscription="ENABLE",
        Timeout=2880,
        JobSample={
            'Mode': 'CUSTOM_ROWS',
            'Size': 20_000
        }
        
    )
    return response["Name"]

def describe_databrew_profile_job(name: str) -> str:
    response = databrew.describe_job(Name=name)
    return response["ResourceArn"]

def delete_databrew_profile_job(name: str) -> str:
    response = databrew.delete_job(Name=name)
    return response["Name"]