import logging
import os
import json
import boto3
from enum import Enum

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

EMISSION_FACTORS_TABLE_NAME = os.environ.get('EMISSIONS_FACTOR_TABLE_NAME')
INPUT_S3_BUCKET_NAME = os.environ.get('INPUT_S3_BUCKET_NAME')
# Versions of the IPPC Report used for CO2e calculation
class IPCC_AR(Enum):
    AR4 = 4
    AR5 = 5

class Gas(Enum):
    CO2 = 1
    CH4 = 2
    N2O = 3
    NF3 = 4
    SF6 = 5

GWP = {
    IPCC_AR.AR4: {
        Gas.CO2: 1,
        Gas.CH4: 25,
        Gas.N2O: 298,
        Gas.NF3: 17200,
        Gas.SF6: 22800,
    },
    IPCC_AR.AR5: {
        Gas.CO2: 1,
        Gas.CH4: 28,
        Gas.N2O: 265,
        Gas.NF3: 16100,
        Gas.SF6: 23500,
    }
}

dynamodb = boto3.resource('dynamodb')
s3 = boto3.resource('s3')

'''
gets emissions factor from ancillary database and returns a coefficient
input: activity
output: emissions factor coefficient
TODO Add a cache
'''
def get_emissions_factor(activity, category):
    LOGGER.info("getting emissions factor from database")
    table = dynamodb.Table(EMISSION_FACTORS_TABLE_NAME)
    coefficient = table.get_item(
        Key={
            'category': category,
            'activity': activity,
        }
    )
    return coefficient

def calculate_emission(raw_data, factor):
    return float(raw_data) * float(factor) / 1000

def calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, ar_version):
    result  = co2_emissions * GWP[ar_version][Gas.CO2]
    result += ch4_emissions * GWP[ar_version][Gas.CH4]
    result += n2o_emissions * GWP[ar_version][Gas.N2O]
    return result


def append_emissions_output(activity_event):
    emissions_factor = get_emissions_factor(activity_event['activity'], activity_event['category'])
    coefficients = emissions_factor['Item']['emissions_factor_standards']['ghg']['coefficients']
    LOGGER.debug('coefficients: %s', coefficients)

    raw_data = activity_event['raw_data']
    co2_emissions = calculate_emission(raw_data, coefficients['co2_factor'])
    ch4_emissions = calculate_emission(raw_data, coefficients['ch4_factor'])
    n2o_emissions = calculate_emission(raw_data, coefficients['n2o_factor'])
    co2e_ar4      = calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, IPCC_AR.AR4)
    co2e_ar5      = calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, IPCC_AR.AR5)
    emissions_output = {
        "emissions_output": {
            "calculated_emissions": {
                "co2": {
                    "amount": co2_emissions,
                    "unit": "tonnes"
                },
                "ch4": {
                    "amount": ch4_emissions,
                    "unit": "tonnes"
                },
                "n2o": {
                    "amount": n2o_emissions,
                    "unit": "tonnes"
                },
                "co2e": {
                    "ar4": {
                        "amount": co2e_ar4,
                        "unit": "tonnes"
                    },
                    "ar5": {
                        "amount": co2e_ar5,
                        "unit": "tonnes"
                    }
                }
            },
            "emissions_factor": {
                "ar4": {
                    "amount": coefficients['AR4_kgco2e'],
                    "unit": "kgCO2e/unit",
                },
                "ar5": {
                    "amount": coefficients['AR5_kgco2e'],
                    "unit": "kgCO2e/unit"
                }
            }
        }
    }
    return activity_event.update(emissions_output)

def read_events_from_s3(bucketname, object_key):
    obj = s3.Object(bucketname, object_key)
    return obj.get()['Body'].read().decode('utf-8')

def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)
    activity_events_s3_key = event
    activity_events = read_events_from_s3(INPUT_S3_BUCKET_NAME, activity_events_s3_key)
    LOGGER.info('activity_events: %s', activity_events)
    # activity_event_with_emissions = append_emissions_output(activity_event)
    # LOGGER.info("result:")
    # LOGGER.info(result)
    print('request: {}'.format(json.dumps(event)))
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/json'
        },
        # 'body': result
    }
    