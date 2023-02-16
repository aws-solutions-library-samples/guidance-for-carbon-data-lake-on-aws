import logging
import os
import json
import boto3
import emissionFactorKey
from decimal import Decimal
from io import StringIO
import csv
import datetime

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

EMISSION_FACTORS_TABLE_NAME = os.environ.get('EMISSION_FACTORS_TABLE_NAME')
EMISSION_FACTORS_BUCKET_NAME = os.environ.get('EMISSION_FACTORS_BUCKET_NAME')

s3_client = boto3.client('s3')
s3_resource = boto3.resource('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(EMISSION_FACTORS_TABLE_NAME)

def __read_emission_factors_from_s3():
    response = s3_client.list_objects_v2(Bucket=EMISSION_FACTORS_BUCKET_NAME)
    contents = response['Contents']
    # loop over all available files in the S3 bucket
    for content in contents:
        object_key = content['Key']
        LOGGER.info('Loading file %s', object_key)
        obj = s3_resource.Object(EMISSION_FACTORS_BUCKET_NAME, object_key)
        emission_factors_st = obj.get()['Body'].read().decode('utf-8-sig')
        # parse CSV
        emission_factors = list(csv.DictReader(StringIO(emission_factors_st)))
    return emission_factors

def __save_to_dynamodb(emission_factors):
    LOGGER.info('Saving %s emission_factors in DynamoDB', len(emission_factors))
    processed_keys = set()
    today = datetime.datetime.today().strftime('%Y-%m-%d')
    with table.batch_writer() as batch:
        for emission_factor in emission_factors:
            hash_key = emissionFactorKey.hash_key(emission_factor)
            if hash_key in processed_keys:
                raise Exception('Duplicated Emission Factors found: ', emission_factor)
            processed_keys.add(hash_key)
            emission_factor['hash_key'] = hash_key
            emission_factor['last_updated'] = today
            batch.put_item(Item=emission_factor)

def __truncate_dynamodb_table():
    response = table.scan()
    # Loop through all items and delete each one
    with table.batch_writer() as batch:
        for item in response['Items']:
            batch.delete_item(Key={'hash_key': item['hash_key']})
    # Continue scanning through pages until all items have been deleted
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        with table.batch_writer() as batch:
            for item in response['Items']:
                batch.delete_item(Key={'hash_key': item['hash_key']})


def lambda_handler(event, context):
    request_type = event['RequestType']
    # if request_type == 'Detete', we don't need to update the Emission Factors DB
    if request_type == 'Create' or request_type == 'Update':
        emission_factors = __read_emission_factors_from_s3()
        __truncate_dynamodb_table()
        __save_to_dynamodb(emission_factors)
