import boto3
import json
import logging

s3_resouce = boto3.resource("s3")
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_dq_results(bucket, key):
    """
    Get the data quality results from the S3 bucket.
    """
    s3_object = s3_resouce.Object(bucket, key)
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


def handler(event, context):
    location = extract_validation_results(event)
    bucket = location["Bucket"]
    key = location["Key"]
    logger.info(f"Location: {location}")

    dq_results = get_dq_results(bucket, key)
    logger.info(f"DQ Results: {dq_results}")

    dq_passfail = dq_check_passfail(dq_results["rulesetResults"])
    logger.info(f"DQ Pass/Fail: {dq_passfail}")

    return {"status": dq_passfail}