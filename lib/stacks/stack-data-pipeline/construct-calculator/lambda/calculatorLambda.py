import logging
import os
import json
import boto3
from enum import Enum
from urllib.parse import urljoin, urlparse
from decimal import Decimal
import emissionFactorKey

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

EMISSION_FACTORS_TABLE_NAME = os.environ.get('EMISSION_FACTORS_TABLE_NAME')
INPUT_S3_BUCKET_NAME = os.environ.get('TRANSFORMED_BUCKET_NAME')
OUTPUT_S3_BUCKET_NAME = os.environ.get('ENRICHED_BUCKET_NAME')
OUTPUT_DYNAMODB_TABLE_NAME = os.environ.get('CALCULATOR_OUTPUT_TABLE_NAME')

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

# Global warming potential
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
def __get_emissions_factor(activity_event):
    LOGGER.info("getting emissions factor from database")
    table = dynamodb.Table(EMISSION_FACTORS_TABLE_NAME)
    emissions_factor = table.get_item(
        Key={'hash_key': emissionFactorKey.hash_key(activity_event)}
    )
    # HACK: hotfix for records without matched emissions_factor in DDB - fix this.
    if 'Item' not in emissions_factor: return None
    return emissions_factor['Item']

def __calculate_emission(raw_data, factor):
    return float(raw_data) * float(0 if factor=='' else factor) / 1000

def __calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, ar_version):
    result  = co2_emissions * GWP[ar_version][Gas.CO2]
    result += ch4_emissions * GWP[ar_version][Gas.CH4]
    result += n2o_emissions * GWP[ar_version][Gas.N2O]
    return result

'''
Input: Python Dictionary
Output: Python Dictionary
'''
def __append_emissions_output(activity_event):
    LOGGER.info('appending emissions for: %s', activity_event)
    emissions_factor = __get_emissions_factor(activity_event)
    print("emissions_factor :", emissions_factor)

    raw_data = activity_event['raw_data']
    co2_emissions = __calculate_emission(raw_data, emissions_factor['co2_factor'])
    ch4_emissions = __calculate_emission(raw_data, emissions_factor['ch4_factor'])
    n2o_emissions = __calculate_emission(raw_data, emissions_factor['n2o_factor'])
    co2e_ar4      = __calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, IPCC_AR.AR4)
    co2e_ar5      = __calculate_co2e(co2_emissions, ch4_emissions, n2o_emissions, IPCC_AR.AR5)
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
                    "amount": float(emissions_factor['AR4_kgco2e']),
                    "unit": "kgCO2e/unit",
                },
                "ar5": {
                    "amount": float(emissions_factor['AR5_kgco2e']),
                    "unit": "kgCO2e/unit"
                }
            }
        }
    }
    activity_event.update(emissions_output)
    return activity_event

def __read_events_from_s3(object_key):
    # Read activity_events object
    obj = s3.Object(INPUT_S3_BUCKET_NAME, object_key)
    activity_events_string = obj.get()['Body'].read().decode('utf-8')
    # split into individual activity_events
    activity_events = [json.loads(jline) for jline in activity_events_string.splitlines()]
    return activity_events

'''
Input:
    object_key:
    activity_events: list
Output: object_key
'''
def __save_enriched_events_to_s3(object_key, activity_events):
    # generate the payload as string
    body = "\n".join(map(json.dumps, activity_events))
    LOGGER.info('output body: %s', "\n"+body)
    # Write to S3
    output_object_key = "today/"+object_key
    obj = s3.Object(OUTPUT_S3_BUCKET_NAME, output_object_key)
    obj.put(Body=body)
    # Return s3 URL
    return "s3://"+OUTPUT_S3_BUCKET_NAME+"/"+output_object_key

def __save_enriched_events_to_dynamodb(activity_events):
    table = dynamodb.Table(OUTPUT_DYNAMODB_TABLE_NAME)
    LOGGER.info('Saving %s activity_events in DynamoDB', len(activity_events))
    with table.batch_writer() as batch:
        for activity_event in activity_events:
            # DynamoDB expects decimals instead of floats
            activity_event_with_decimal = json.loads(json.dumps(activity_event), parse_float=Decimal)
            batch.put_item(Item=activity_event_with_decimal)

'''
Input: {"storage_location": "calculator_input_example.jsonl" }
Output: {
    "storage_location": "s3://<output_bucket>/<key>",
    "records": [ { "node_id": "<activity_event_id>" }, {}, {} ... ]
}
'''
def lambda_handler(event, context):
    LOGGER.info('Event: %s', event)
    # Load input activity_events
    object_key = urlparse(event['storage_location'], allow_fragments=False).path.strip("/")
    activity_events = __read_events_from_s3(object_key)
    LOGGER.info('activity_events: %s', activity_events)
    # Enrich activity_events with calculated emissions
    activity_events_with_emissions = list(map(__append_emissions_output, activity_events))
    # TODO: Do something with records that can't be resolved
    activity_events_with_emissions = [ x for x in activity_events_with_emissions if x is not None ]
    # Save enriched activity_events to S3
    output_object_url = __save_enriched_events_to_s3(object_key, activity_events_with_emissions)
    # Save enriched activity_events to DynamoDB
    __save_enriched_events_to_dynamodb(activity_events_with_emissions)

    activity_ids = [ { "node_id": x["activity_event_id"] } for x in activity_events_with_emissions ] 
    return { "storage_location": output_object_url, "records": activity_ids }
