import logging
import json
import boto3
import os
from emission_output import EmissionOutput
from assertions import assert_equals
import inspect

logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.resource('s3')
client = boto3.client('lambda')

INPUT_BUCKET_NAME = os.environ['INPUT_BUCKET_NAME']
OUTPUT_BUCKET_NAME = os.environ['OUTPUT_BUCKET_NAME']
CALCULATOR_FUNCTION_NAME = os.environ['CALCULATOR_FUNCTION_NAME']

def test_scope1():
    payload = {
        "items": [
            {"activity_event_id": "customer-carbonlake-12345", "asset_id": "vehicle-1234", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 103.45, "units": "gal"}
        ],
        "execution_id": "1",
        "root_id": "1",
        "parent_id": "1"
    }
    __test_calculator(payload, [EmissionOutput("customer-carbonlake-12345", 1.0562245000000001, 1.1638125000000002e-06, 2.3276250000000004e-06, 1.0569472275625, 1.056873907375, 10.21698625, 10.2162775)])

def test_scope1_2lines():
    payload = {
        "items": [
            {"activity_event_id": "customer-carbonlake-12345", "asset_id": "vehicle-1234", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 103.45, "units": "gal"},
            {"activity_event_id": "customer-carbonlake-12346", "asset_id": "vehicle-1235", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 13.5, "units": "gal"}
        ],
        "execution_id": "1",
        "root_id": "2",
        "parent_id": "1"
    }
    __test_calculator(payload, [EmissionOutput("customer-carbonlake-12345", 1.0562245000000001, 1.1638125000000002e-06, 2.3276250000000004e-06, 1.0569472275625, 1.056873907375, 10.21698625, 10.2162775),
                                                    EmissionOutput("customer-carbonlake-12346", 0.137835, 1.5187500000000003e-07, 3.0375000000000006e-07, 0.137929314375, 0.13791974625, 10.21698625, 10.2162775)])

def test_scope2_location_based():
    payload = {
        "items": [
            { "activity_event_id": "customer-carbonlake-12345", "supplier": "eversource", "scope": 2, "category": "grid-region-location-based", "activity": "Quebec", "raw_data": 453, "units": "kwH"}
        ],
        "execution_id": "1",
        "root_id": "3",
        "parent_id": "1"
    }
    __test_calculator(payload, [EmissionOutput("customer-carbonlake-12345", 0.0005436, 0.0, 4.5299999999999995e-08, 0.0005570994, 0.0005556045, 0.0012298, 0.0012265)])

def test_scope2_market_based_residual_mix():
    payload = {
        "items": [
            { "activity_event_id": "customer-carbonlake-12345", "supplier": "eversource", "scope": 2, "category": "egrid-subregion-residual-mix-market-based", "activity": "Quebec", "raw_data": 453, "units": "kwH"}
        ],
        "execution_id": "1",
        "root_id": "3",
        "parent_id": "1"
    }
    __test_calculator(payload, [EmissionOutput("customer-carbonlake-12345", 0.020414174106, 0.0, 0.0, 0.020414174106, 0.020414174106, 0.045064402, 0.045064402)])

def __test_calculator(payload, emissionOutputs):
    print("Testing", inspect.stack()[1][3])
    objectKey = f"{payload['root_id']}/{payload['execution_id']}.jsonl"
    outputKey = "today/"+objectKey
    try:
        # Given
        # When
        response = client.invoke(
            FunctionName=CALCULATOR_FUNCTION_NAME,
            Payload=json.dumps(payload),
        )
        # Then
        responseJson = json.loads(response['Payload'].read().decode("utf-8"))
        assert_equals(len(responseJson['records']), len(emissionOutputs), 'expected '+str(len(emissionOutputs))+' but got '+str(len(responseJson['records']))+': '+json.dumps(responseJson))
        assert_equals(responseJson['storage_location'], "s3://"+OUTPUT_BUCKET_NAME+"/"+outputKey)
        assert_equals(responseJson['records'][0]['node_id'], "customer-carbonlake-12345")
        outputObject = s3.Object(OUTPUT_BUCKET_NAME, outputKey).get()
        outputBody = outputObject['Body'].read().decode("utf-8")
        outputActivityEvents = [json.loads(jline) for jline in outputBody.splitlines()]
        for index in range(len(emissionOutputs)):
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2']['amount'], emissionOutputs[index].co2)
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2']['unit'], 'tonnes')
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['ch4']['amount'], emissionOutputs[index].ch4)
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['ch4']['unit'], 'tonnes')
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['n2o']['amount'], emissionOutputs[index].n2o)
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['n2o']['unit'], 'tonnes')
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar4']['amount'], emissionOutputs[index].co2e_ar4)
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar4']['unit'], 'tonnes')
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar5']['amount'], emissionOutputs[index].co2e_ar5)
            assert_equals(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar5']['unit'], 'tonnes')
            assert_equals(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar4']['amount'], emissionOutputs[index].emissions_factor_ar4)
            assert_equals(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar4']['unit'], 'kgCO2e/unit')
            assert_equals(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar5']['amount'], emissionOutputs[index].emissions_factor_ar5)
            assert_equals(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar5']['unit'], 'kgCO2e/unit')
    finally:
        # Cleanup
        s3.Object(OUTPUT_BUCKET_NAME, outputKey).delete()

def lambda_handler(event, context):
  logger.info('EVENT:')
  logger.info(json.dumps(event, indent=4, sort_keys=True))

  test_scope1()
  test_scope1_2lines()
  test_scope2_location_based()
  test_scope2_market_based_residual_mix()

  return 'Success'