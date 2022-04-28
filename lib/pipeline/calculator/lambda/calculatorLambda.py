import logging
import os
import json
import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

EMISSION_FACTORS_TABLE_NAME = os.environ.get('EMISSIONS_FACTOR_TABLE_NAME')

dynamodb = boto3.resource('dynamodb')

'''
gets emissions factor from ancillary database and returns a coefficient
input: activity
output: emissions factor coefficient
'''
def get_emissions_factor(activity_id):
    LOGGER.info("getting emissions factor from database")
    table = dynamodb.Table(EMISSION_FACTORS_TABLE_NAME)
    coefficient = table.get_item(
        Key={
            'category': activity_id['category'],
            'activity': activity_id['activity'],
        }
    )
    return coefficient


def calculate_carbon(activity_event):
    emissions_factor = get_emissions_factor(activity_event['activity_id'])
    coefficients = emissions_factor['Item']['emissions_factor_standards']['ghg']['coefficients']
    LOGGER.info('coefficients: %s', coefficients)
    emissions_output = {
        "emissions_output": {
            # "calculated_emissions": {
            #     "co2": {
            #         "amount": 0.024,
            #         "unit": "tonnes"
            #     },
            #     "ch4": {
            #         "amount": 0.00001,
            #         "unit": "tonnes"
            #     },
            #     "n20": {
            #         "amount": 0.00201,
            #         "unit": "tonnes"
            #     },
            #     "co2e": {
            #         "ar4": {
            #             "amount": 0.2333,
            #             "unit": "tonnes"
            #         },
            #         "ar5": {
            #             "amount": 0.2334,
            #             "unit": "tonnes"
            #         }
            #     }
            # },
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
    activity_event.update(emissions_output)
    return activity_event

def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)
    result = calculate_carbon(event)
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
    