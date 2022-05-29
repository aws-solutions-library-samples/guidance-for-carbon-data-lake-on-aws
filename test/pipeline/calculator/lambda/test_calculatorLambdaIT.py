import unittest
import warnings
import json

import boto3

# TODO get from stack
inputBucketName = "carbonlakesharedresource-carbonlaketransformedbuc-tflhrz63exas"
outputBucketName = "carbonlakesharedresource-carbonlakeenrichedbucket-fs7p7ncn9w6"

class EmissionOutput:
    def __init__(self, co2, ch4, n2o, co2e_ar4, co2e_ar5, emissions_factor_ar4, emissions_factor_ar5):
        self.co2 = co2
        self.ch4 = ch4
        self.n2o = n2o
        self.co2e_ar4 = co2e_ar4
        self.co2e_ar5 = co2e_ar5
        self.emissions_factor_ar4 = emissions_factor_ar4
        self.emissions_factor_ar5 = emissions_factor_ar5

class TestCalculatorLambdaIT(unittest.TestCase):
    def setUp(self):
        warnings.filterwarnings("ignore", category=ResourceWarning, message="unclosed.*<ssl.SSLSocket.*>")
    
    def test_scope1(self):
        inputKey = "testscope1.json"
        inputBody = b'{"activity_event_id": "customer-carbonlake-12345", "asset_id": "vehicle-1234", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 103.45, "units": "gal"}'
        self.__test_calculator(inputKey, inputBody, [EmissionOutput(1.0562245000000001, 1.1638125000000002e-06, 2.3276250000000004e-06, 1.0569472275625, 1.056873907375, 10.21698625, 10.2162775)])
    
    def test_scope1_2lines(self):
        inputKey = "testscope1.json"
        inputBody = b'''{"activity_event_id": "customer-carbonlake-12345", "asset_id": "vehicle-1234", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 103.45, "units": "gal"}
        {"activity_event_id": "customer-carbonlake-12346", "asset_id": "vehicle-1235", "geo": { "lat": 45.5152, "long": 122.6784}, "origin_measurement_timestamp":"2022-06-26 02:31:29", "scope": 1, "category": "mobile-combustion", "activity": "Diesel Fuel - Diesel Passenger Cars", "source": "company_fleet_management_database", "raw_data": 13.5, "units": "gal"}'''
        self.__test_calculator(inputKey, inputBody, [EmissionOutput(1.0562245000000001, 1.1638125000000002e-06, 2.3276250000000004e-06, 1.0569472275625, 1.056873907375, 10.21698625, 10.2162775),
                                                     EmissionOutput(0.137835, 1.5187500000000003e-07, 3.0375000000000006e-07, 0.137929314375, 0.13791974625, 10.21698625, 10.2162775)])
    
    def test_scope2_location_based(self):
        inputKey = "testscope2_location.json"
        inputBody = b'{ "activity_event_id": "customer-carbonlake-12345", "supplier": "eversource", "scope": 2, "category": "grid-region-location-based", "activity": "Quebec", "raw_data": 453, "units": "kwH"}'
        self.__test_calculator(inputKey, inputBody, [EmissionOutput(0.0005436, 0.0, 4.5299999999999995e-08, 0.0005570994, 0.0005556045, 0.0012298, 0.0012265)])
    
    def test_scope2_market_based_residual_mix(self):
        inputKey = "testscope2_market.json"
        inputBody = b'{ "activity_event_id": "customer-carbonlake-12345", "supplier": "eversource", "scope": 2, "category": "egrid-subregion-residual-mix-market-based", "activity": "Quebec", "raw_data": 453, "units": "kwH"}'
        self.__test_calculator(inputKey, inputBody, [EmissionOutput(0.020414174106, 0.0, 0.0, 0.020414174106, 0.020414174106, 0.045064402, 0.045064402)])
    
    def __test_calculator(self, inputKey, inputBody, emissionOutputs):
        # Given
        s3 = boto3.resource('s3')
        s3.Object(inputBucketName, inputKey).put(Body=inputBody)
        # When
        client = boto3.client('lambda')
        payload = '{"storage_location": "s3://'+inputBucketName+'/'+inputKey+'" }'
        response = client.invoke(
            # TODO get from stack
            FunctionName='CarbonlakePipelineStack-C-carbonLakeCalculatorHand-Fy1vs61y4W8v',
            Payload=payload,
        )
        # Then
        outputKey = "today/"+inputKey
        responseJson = json.loads(response['Payload'].read().decode("utf-8"))
        self.assertEqual(len(responseJson), len(emissionOutputs))
        self.assertEqual(responseJson[0]['node_id'], "customer-carbonlake-12345")
        self.assertEqual(responseJson[0]['storage_location'], "s3://"+outputBucketName+"/"+outputKey)
        outputObject = s3.Object(outputBucketName, outputKey).get()
        outputBody = outputObject['Body'].read().decode("utf-8")
        outputActivityEvents = [json.loads(jline) for jline in outputBody.splitlines()]
        for index in range(len(emissionOutputs)):
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2']['amount'], emissionOutputs[index].co2)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2']['unit'], 'tonnes')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['ch4']['amount'], emissionOutputs[index].ch4)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['ch4']['unit'], 'tonnes')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['n2o']['amount'], emissionOutputs[index].n2o)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['n2o']['unit'], 'tonnes')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar4']['amount'], emissionOutputs[index].co2e_ar4)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar4']['unit'], 'tonnes')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar5']['amount'], emissionOutputs[index].co2e_ar5)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['calculated_emissions']['co2e']['ar5']['unit'], 'tonnes')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar4']['amount'], emissionOutputs[index].emissions_factor_ar4)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar4']['unit'], 'kgCO2e/unit')
            self.assertEqual(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar5']['amount'], emissionOutputs[index].emissions_factor_ar5)
            self.assertEqual(outputActivityEvents[index]['emissions_output']['emissions_factor']['ar5']['unit'], 'kgCO2e/unit')
        # Cleanup
        s3.Object(inputBucketName, inputKey).delete()
        s3.Object(outputBucketName, outputKey).delete()

if __name__ == '__main__':
    unittest.main()