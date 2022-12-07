"""
original author: @jangna
modified by: @awsford
"""
import os
import boto3
import json
import logging
from urllib.parse import urlparse

s3_resource = boto3.resource("s3")
logger = logging.getLogger()
logger.setLevel(logging.INFO)

INPUT_BUCKET_NAME = os.environ["INPUT_BUCKET_NAME"]
ERROR_BUCKET_NAME = os.environ["ERROR_BUCKET_NAME"]
OUTPUT_BUCKET_NAME = os.environ["OUTPUT_BUCKET_NAME"]

def get_dq_results(bucket, key):
    """
    Get the data quality results from the S3 bucket.
    """
    s3_object = s3_resource.Object(bucket, key)
    dq_results = s3_object.get()["Body"].read().decode("utf-8")
    dict_results = json.loads(dq_results)

    return dict_results


def dq_check_passfail(rule_results):
    """
    Check the data quality results. All-or-nothing 
    pass or fail based on all rules in the ruleset.
    """
    list_of_status = [x["status"] for x in rule_results]

    # True if all rules pass, False if any rule fails
    return all(x == "SUCCEEDED" for x in list_of_status)


def extract_validation_results(event):
    """
    Extract the validation results from the step function event
    """
    for output in event["Outputs"]:
        if "validation-report.json" in output["Location"]["Key"]:
            return output["Location"]
        else:
            continue
    
""" original function written by @chateauv """
def move_s3_object(object_key, status):
    logger.info('copy_s3_object: %s', object_key)
    copy_source = {
        'Bucket': INPUT_BUCKET_NAME,
        'Key': object_key
    }
    output_bucket = s3_resource.Bucket(OUTPUT_BUCKET_NAME) \
        if status \
        else s3_resource.Bucket(ERROR_BUCKET_NAME)
    
    output_obj = output_bucket.Object(object_key)
    output_obj.copy(copy_source)
    # delete the source copy
    input_bucket = s3_resource.Bucket(INPUT_BUCKET_NAME)
    input_source = input_bucket.Object(object_key)
    input_source.delete()
    # Return s3 URL
    return "s3://"+OUTPUT_BUCKET_NAME+"/"+object_key


def lambda_handler(event, context):
    location = extract_validation_results(event["dq_results"])
    bucket = location["Bucket"]
    key = location["Key"]
    logger.info(f"Location: {location}")

    dq_results = get_dq_results(bucket, key)
    logger.info(f"DQ Results: {dq_results}")

    dq_passfail = dq_check_passfail(dq_results["rulesetResults"])
    logger.info(f"DQ Pass/Fail: {dq_passfail}")

    input_s3_key = urlparse(event["storage_location"], allow_fragments=False).path
    input_s3_key = input_s3_key.split("/")[-1]
    output_object_url = move_s3_object(input_s3_key, dq_passfail)

    return {"status": dq_passfail, "storage_location": output_object_url}