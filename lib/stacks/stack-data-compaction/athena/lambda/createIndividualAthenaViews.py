import time
import boto3
import logging
import os
from urllib.parse import urljoin, urlparse

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

# database/table/view names hardcoded for now. Partitions should not change. 
#GLUE_DATABASE_NAME = 'enriched-calculator-data'
GLUE_DATABASE_NAME = os.environ.get('GLUE_DATABASE_NAME')
GLUE_TODAY_TABLE_NAME = 'today'
GLUE_HISTORICAL_TABLE_NAME = 'historical'
FORMATTED_TODAY_VIEW_NAME = 'formatted_today_data'
FORMATTED_HISTORICAL_VIEW_NAME = 'formatted_historical_data'
ATHENA_QUERY_OUTPUT_LOCATION = 's3://' + os.environ.get('ATHENA_QUERY_OUTPUT_LOCATION') + '/'

# create the following Athena views:
# today_formatted flattens JSON structure and applies friendly names to columns
# historical_formatted applies friendly names to already flattened columns
create_today_formatted_view_query = f'CREATE OR REPLACE VIEW "formatted_today_data" AS SELECT activity_event_id, asset_id, geo, origin_measurement_timestamp, scope, category, activity, source, raw_data, units, emissions_output.calculated_emissions.co2.amount co2_amount, emissions_output.calculated_emissions.co2.unit co2_unit, emissions_output.calculated_emissions.ch4.amount ch4_amount, emissions_output.calculated_emissions.ch4.unit ch4_unit, emissions_output.calculated_emissions.n2o.amount n2o_amount, emissions_output.calculated_emissions.n2o.unit n2o_unit, emissions_output.calculated_emissions.co2e.ar4.amount co2e_ar4_amount, emissions_output.calculated_emissions.co2e.ar4.unit co2e_ar4_unit, emissions_output.calculated_emissions.co2e.ar5.amount co2e_ar5_amount, emissions_output.calculated_emissions.co2e.ar5.unit co2e_ar5_unit FROM {GLUE_DATABASE_NAME}.today'
create_historial_formatted_view_query = f'CREATE OR REPLACE VIEW "formatted_historical_data" AS SELECT activity_event_id, asset_id, geo, origin_measurement_timestamp, scope, category, activity, source, raw_data, units, "emissions_output.calculated_emissions.co2.amount" co2_amount, "emissions_output.calculated_emissions.co2.unit" co2_unit, "emissions_output.calculated_emissions.ch4.amount" ch4_amount, "emissions_output.calculated_emissions.ch4.unit" ch4_unit, "emissions_output.calculated_emissions.n2o.amount" n2o_amount, "emissions_output.calculated_emissions.n2o.unit" n2o_unit, "emissions_output.calculated_emissions.co2e.ar4.amount" co2e_ar4_amount, "emissions_output.calculated_emissions.co2e.ar4.unit" co2e_ar4_unit, "emissions_output.calculated_emissions.co2e.ar5.amount" co2e_ar5_amount, "emissions_output.calculated_emissions.co2e.ar5.unit" co2e_ar5_unit, date(partition_0) date FROM {GLUE_DATABASE_NAME}.historical'

client = boto3.client('athena')
print("##########################BOTO3 VERSION##########################")
print(boto3.__version__)
print("##########################BOTO3 VERSION##########################")

'''
Input:
- query: String
- database_name: String
- athena_query_output_location: String
Output: {
      "QueryExecutionId": "<QueryExecutionId>",
      "ResponseMetadata": {
        "RequestId": "<RequestId>",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
          "content-type": "application/x-amz-json-1.1",
          "date": "Thu, 12 May 2022 03:33:40 GMT",
          "x-amzn-requestid": "<x-amzn-requestid>",
          "content-length": "59",
          "connection": "keep-alive"
        },
        "RetryAttempts": 0
      }
    }
'''
def create_today_athena_view(query, database_name, athena_query_output_location):
    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={
            'Database': database_name
        },
        ExecutionParameters=[
          GLUE_DATABASE_NAME,
          GLUE_TODAY_TABLE_NAME
        ],
        ResultConfiguration={
            'OutputLocation': athena_query_output_location,
        }
    )
    return response

def create_historical_athena_view(query, database_name, athena_query_output_location):
    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={
            'Database': database_name
        },
        ResultConfiguration={
            'OutputLocation': athena_query_output_location,
        }
    )
    return response


'''
Input: Step Functions Glue Crawler output: {
  "Crawler": {<Glue Crawler Configuration Data>}
}
Output: {
  "statusCode": 200,
  "headers": {
    "Content-Type": "text/json"
  },
  "body": {
    "create_today_formatted_view_response": {
      "QueryExecutionId": "<QueryExecutionId>",
      "ResponseMetadata": {
        "RequestId": "<RequestId>",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
          "content-type": "application/x-amz-json-1.1",
          "date": "Thu, 12 May 2022 03:19:30 GMT",
          "x-amzn-requestid": "<x-amzn-requestid>",
          "content-length": "59",
          "connection": "keep-alive"
        },
        "RetryAttempts": 0
      }
    },
    "create_historical_formatted_view_response": {
      "QueryExecutionId": "<QueryExecutionId>",
      "ResponseMetadata": {
        "RequestId": "<RequestId>",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
          "content-type": "application/x-amz-json-1.1",
          "date": "Thu, 12 May 2022 03:19:31 GMT",
          "x-amzn-requestid": "<x-amzn-requestid>",
          "content-length": "59",
          "connection": "keep-alive"
        },
        "RetryAttempts": 0
      }
    }
  }
}
'''

def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)

    # create today formatted view in Athena
    today_formatted_view = create_today_athena_view(create_today_formatted_view_query, GLUE_DATABASE_NAME, ATHENA_QUERY_OUTPUT_LOCATION)
    print(today_formatted_view)

    # create historical formatted view in Athena
    historical_formatted_view = create_historical_athena_view(create_historial_formatted_view_query, GLUE_DATABASE_NAME, ATHENA_QUERY_OUTPUT_LOCATION)
    print(historical_formatted_view)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/json'
        },
        'body': {
            'create_today_formatted_view_response': today_formatted_view,
            'create_historical_formatted_view_response': historical_formatted_view
        }
    }