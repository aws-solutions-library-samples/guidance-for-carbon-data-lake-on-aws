import logging
import os
import sys
from datetime import datetime

import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
#   Calculator function
#   say some stuff
# ---------------------------------------------------------------------------


import datetime
import json

'''
gets emissions factor from ancillary database and returns a coefficient
input: geo, activity_tag, raw_data
output: emissions factor coefficient
'''
def get_emissions_factor(geo,activity_id,raw_data, emissions_factor_database):
    print("getting emissions factor from database")
    coefficient = emissions_factor_database # search emissions factor database for coefficient
    return coefficient


def CALCULATE_CARBON(asset_id, geo, activity_id, source, raw_data, data_lineage):
    calculator_timestamp = datetime.datetime.now()
    emissions_factor = get_emissions_factor(geo,activity_id,raw_data,emissions_factor_database='carbonlak_ghg_emissionsfactor_comprehensive')
    carbon_emissions_total = raw_data * emissions_factor
    carbon_emissions_full_output = {
        'geo': geo,
        'asset_id': asset_id,
        'measurement_timestamp': measurement_timestamp,
        'carbon_emissions_total': carbon_emissions_total,
        'activity_id': activity_id,
        'raw_data': raw_data,
        'emissions_factor': emissions_factor,
        'source': source, # EEIO, Industry Averages, Vendor Supplied, Direct Measurement
        'data_lineage': data_lineage.append({'timestamp': calculator_timestamp, 'geo': geo, 'node': 'emissions_calculator_microservice'}) 

    },
    return json.dumps(carbon_emissions_full_output)

def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)
    result = CALCULATE_CARBON.process_query(event)
    LOGGER.info("result:")
    LOGGER.info(result)
    print('request: {}'.format(json.dumps(event)))
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': 'Hello, CDK! You have hit {}\n'.format(event['path'])
    }
    