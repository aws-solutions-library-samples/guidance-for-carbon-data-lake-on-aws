import logging
from datetime import datetime

import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

import datetime
import json

'''
gets emissions factor from ancillary database and returns a coefficient
input: activity
output: emissions factor coefficient
'''
def get_emissions_factor(emissions_factor_table_name, activity):
    print("getting emissions factor from database")
    coefficient = {
        "co2_factor": 0,
        "ch4_factor": 0,
        "n2o_factor": 0,
        "biofuel_co2": None,
        "AR4-kgco2e": 0,
        "AR5-kgco2e": 0,
        "units": "kWh"
    }
    return coefficient


def CALCULATE_CARBON(asset_id, geo, activity_id, source, raw_data, data_lineage):
    calculator_timestamp = datetime.datetime.now()
    emissions_factor = get_emissions_factor(geo,activity_id,raw_data,emissions_factor_database='carbonlak_ghg_emissionsfactor_comprehensive')
    carbon_emissions_total = raw_data * emissions_factor
    carbon_emissions_full_output = {
        'geo': geo,
        'asset_id': asset_id,
        'carbon_emissions_total': carbon_emissions_total,
        'activity_id': activity_id,
        'raw_data': raw_data,
        'emissions_factor': emissions_factor,
        'source': source, # EEIO, Industry Averages, Vendor Supplied, Direct Measurement

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
            'Content-Type': 'text/json'
        },
        'body': result
    }
    