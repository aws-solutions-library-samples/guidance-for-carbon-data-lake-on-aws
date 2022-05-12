import time
import boto3
import logging
import os
from urllib.parse import urljoin, urlparse

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

# database/table/view names hardcoded for now. Top level partitions should not change. 
GLUE_DATABASE_NAME = 'enriched-calculator-data'
FORMATTED_TODAY_VIEW_NAME = 'formatted_today_data'
FORMATTED_HISTORICAL_VIEW_NAME = 'formatted_historical_data'
COMBINED_DATA_VIEW_NAME = 'combined_emissions_data'
ATHENA_QUERY_OUTPUT_LOCATION = 's3://' + os.environ.get('ATHENA_QUERY_OUTPUT_LOCATION') + '/'

# create the following Athena views:
# combined_emissions_data unions historical and latest emissions data
create_combined_view_query = 'CREATE OR REPLACE VIEW "' + COMBINED_DATA_VIEW_NAME + '" AS SELECT activity_event_id, asset_id, geo, origin_measurement_timestamp, scope, category, activity, source, raw_data, units, co2_amount, co2_unit, ch4_amount, ch4_unit, n2o_amount, n2o_unit, co2e_ar4_amount, co2e_ar4_unit, co2e_ar5_amount, co2e_ar5_unit, current_date date FROM "' + GLUE_DATABASE_NAME + '"."' + FORMATTED_TODAY_VIEW_NAME + '" UNION ALL SELECT activity_event_id, asset_id, geo, origin_measurement_timestamp, scope, category, activity, source, raw_data, units, co2_amount, co2_unit, ch4_amount, ch4_unit, n2o_amount, n2o_unit, co2e_ar4_amount, co2e_ar4_unit, co2e_ar5_amount, co2e_ar5_unit, date FROM "' + GLUE_DATABASE_NAME + '"."' + FORMATTED_HISTORICAL_VIEW_NAME + '" WHERE (date <> current_date)'

client = boto3.client('athena')

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
def create_athena_view(query, database_name, athena_query_output_location):
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
Input: Step Functions Lambda output: {
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
Output: {
  "statusCode": 200,
  "headers": {
    "Content-Type": "text/json"
  },
  "body": {
    "create_combined_formatted_view_response": {
      "QueryExecutionId": "<QueryExecutionId>",
      "ResponseMetadata": {
        "RequestId": "<RequestId>",
        "HTTPStatusCode": 200,
        "HTTPHeaders": {
          "content-type": "application/x-amz-json-1.1",
          "date": "Thu, 12 May 2022 03:19:32 GMT",
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
    
    # create combined view in Athena
    combined_formatted_view = create_athena_view(create_combined_view_query, GLUE_DATABASE_NAME, ATHENA_QUERY_OUTPUT_LOCATION)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/json'
        },
        'body': {
            'create_combined_formatted_view_response': combined_formatted_view
        }
    }