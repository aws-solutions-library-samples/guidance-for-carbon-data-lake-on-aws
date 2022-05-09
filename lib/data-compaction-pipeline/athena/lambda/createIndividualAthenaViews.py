import time
import boto3
import logging
import os
from urllib.parse import urljoin, urlparse

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

# database/table/view names hardcoded for now. Partitions should not change. 
GLUE_DATABASE_NAME = 'enriched-calculator-data'
GLUE_TODAY_TABLE_NAME = 'today'
GLUE_HISTORICAL_TABLE_NAME = 'historical'
FORMATTED_TODAY_VIEW_NAME = 'formatted_today_data'
FORMATTED_HISTORICAL_VIEW_NAME = 'formatted_historical_data'
ATHENA_QUERY_OUTPUT_LOCATION = 's3://' + os.environ.get('ATHENA_QUERY_OUTPUT_LOCATION') + '/'

# create the following Athena views:
# today_formatted flattens JSON structure and applies friendly names to columns
# historical_formatted applies friendly names to already flattened columns
create_today_formatted_view_query = 'CREATE OR REPLACE VIEW "' + FORMATTED_TODAY_VIEW_NAME + '" AS SELECT record_id, asset_id, activity_id.activity activity, activity_id.category category, emissions_output.calculated_emissions.ch4.amount ch4_amount, emissions_output.calculated_emissions.ch4.unit ch4_unit, emissions_output.calculated_emissions.co2.amount co2_amount, emissions_output.calculated_emissions.co2.unit co2_unit, emissions_output.calculated_emissions.co2e.amount co2e_amount, emissions_output.calculated_emissions.co2e.unit co2e_unit, emissions_output.calculated_emissions.n20.amount n20_amount, emissions_output.calculated_emissions.n20.unit n20_unit, emissions_output.emissions_factor emissions_factor, emissions_output.emissions_factor_reference emissions_factor_reference, geo.lat latitude, geo.long longitude, origin_measurement_timestamp, raw_data, source, units FROM "' + GLUE_DATABASE_NAME + '"."' + GLUE_TODAY_TABLE_NAME + '"';
create_historial_formatted_view_query = 'CREATE OR REPLACE VIEW "' + FORMATTED_HISTORICAL_VIEW_NAME + '" AS SELECT record_id, asset_id, "activity_id.activity" activity, "activity_id.category" category, "activity_id.scope" scope, "emissions_output.calculated_emissions.ch4.amount" ch4_amount, "emissions_output.calculated_emissions.ch4.unit" ch4_unit, "emissions_output.calculated_emissions.co2.amount" co2_amount, "emissions_output.calculated_emissions.co2.unit" co2_unit, "emissions_output.calculated_emissions.co2e.amount" co2e_amount, "emissions_output.calculated_emissions.co2e.unit" co2e_unit, "emissions_output.calculated_emissions.n20.amount" n20_amount, "emissions_output.calculated_emissions.n20.unit" n20_unit, "emissions_output.emissions_factor" emissions_factor, "emissions_output.emissions_factor_reference" emissions_factor_reference, "geo.lat" latitude, "geo.long" longitude, origin_measurement_timestamp, raw_data, source, units, "date"(partition_0) date FROM "' + GLUE_DATABASE_NAME + '"."' + GLUE_HISTORICAL_TABLE_NAME + '"';

#output='s3://aws-athena-query-results-us-east-1-148257099368/'
client = boto3.client('athena')

'''
Input: TBD
Output: TBD
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
Input: TBD
Output: TBD
'''
def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)

    # create today formatted view in Athena
    today_formatted_view = create_athena_view(create_today_formatted_view_query, GLUE_DATABASE_NAME, ATHENA_QUERY_OUTPUT_LOCATION)
    print(today_formatted_view)

    # create historical formatted view in Athena
    historical_formatted_view = create_athena_view(create_historial_formatted_view_query, GLUE_DATABASE_NAME, ATHENA_QUERY_OUTPUT_LOCATION)
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