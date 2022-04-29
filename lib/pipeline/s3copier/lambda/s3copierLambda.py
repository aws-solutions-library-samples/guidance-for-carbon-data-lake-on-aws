import logging
import os
import json
import boto3
from urllib.parse import urljoin, urlparse

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

INPUT_S3_BUCKET_NAME = os.environ.get('INPUT_S3_BUCKET_NAME')
OUTPUT_S3_BUCKET_NAME = os.environ.get('OUTPUT_S3_BUCKET_NAME')

s3 = boto3.resource('s3')

def copy_s3_object(object_key):
    LOGGER.info('copy_s3_object: %s', object_key)
    copy_source = {
        'Bucket': INPUT_S3_BUCKET_NAME,
        'Key': object_key
    }
    bucket = s3.Bucket(OUTPUT_S3_BUCKET_NAME)
    obj = bucket.Object(object_key)
    obj.copy(copy_source)
    # Return s3 URL
    return "s3://"+OUTPUT_S3_BUCKET_NAME+"/"+object_key

'''
Input: {"location": "calculator_input_example.jsonl"}
Output: {"location": "calculator_output_example.jsonl"}
'''
def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)
    object_key = urlparse(event['location'], allow_fragments=False).path
    output_object_url = copy_s3_object(object_key)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/json'
        },
        'body': {'location': output_object_url}
    }
    