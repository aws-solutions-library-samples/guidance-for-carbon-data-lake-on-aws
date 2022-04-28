import unittest
import os
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)),"../../../../lib/pipeline/calculator/lambda"))
from calculatorLambda import get_emissions_factor, calculate_carbon

import boto3
from moto import mock_dynamodb

UNIT_TONNES = "tonnes"

@mock_dynamodb
class TestCalculatorLambda(unittest.TestCase):

    def setUp(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.table = self.create_movie_table(self.dynamodb)
    
    def tearDown(self):
        self.table.delete()
        self.dynamodb=None

    def test_get_emissions_factor(self):
        activity = "Electricity - Mobile - Electric Vehicle"
        coefficients = get_emissions_factor(activity);
        
        self.assertEqual(coefficients["co2_factor"], 0)
        self.assertEqual(coefficients["ch4_factor"], 0)
        self.assertEqual(coefficients["n2o_factor"], 0)
        self.assertFalse(coefficients["biofuel_co2"])
        self.assertEqual(coefficients["AR4-kgco2e"], 0)
        self.assertEqual(coefficients["AR5-kgco2e"], 0)
        self.assertEqual(coefficients["units"], "kWh")
    
    def test_calculate_carbon(self):
        # Given
        activity_event = {
            "record_id": "customer-carbonlake-12345",
            "asset_id": "vehicle-1234", 
            "geo": {
                "lat": 45.5152,
                "long": 122.6784
            },
            "origin_measurement_timestamp":"2022-06-26 02:31:29", 
            "activity_id":{
                "scope": 1,
                "category": "mobile-combustion",
                "activity": "Diesel Fuel - Diesel Passenger Cars"
                }, 
            "source": "company_fleet_management_database", 
            "raw_data": 103.45,
            "units": "gal"
        }
        # When
        enriched_activity_event = calculate_carbon(activity_event);
        # Then
        # Test original data is preserved
        assert enriched_activity_event['record_id'] is activity_event['record_id']
        assert enriched_activity_event['asset_id'] is activity_event['asset_id']
        assert enriched_activity_event['geo']['lat'] is activity_event['geo']['lat']
        assert enriched_activity_event['geo']['long'] is activity_event['geo']['long']
        assert enriched_activity_event['origin_measurement_timestamp'] is activity_event['origin_measurement_timestamp']
        assert enriched_activity_event['activity_id']['scope'] is activity_event['activity_id']['scope']
        assert enriched_activity_event['activity_id']['category'] is activity_event['activity_id']['category']
        assert enriched_activity_event['activity_id']['activity'] is activity_event['activity_id']['activity']
        assert enriched_activity_event['source'] is activity_event['source']
        assert enriched_activity_event['raw_data'] is activity_event['raw_data']
        assert enriched_activity_event['units'] is activity_event['units']
        # Test calculated data is appended
        assert enriched_activity_event['emissions_output']['calculated_emissions']['co2']['amount'] is 1.056
        assert enriched_activity_event['emissions_output']['calculated_emissions']['co2']['unit'] is UNIT_TONNES
    
    def create_movie_table(dynamodb):
        table = dynamodb.create_table(
            TableName='Movies',
            # KeySchema=[
            #     {
            #         'AttributeName': 'year',
            #         'KeyType': 'HASH'
            #     },
            #     {
            #         'AttributeName': 'title',
            #         'KeyType': 'RANGE'
            #     }
            # ],
            # AttributeDefinitions=[
            #     {
            #         'AttributeName': 'year',
            #         'AttributeType': 'N'
            #     },
            #     {
            #         'AttributeName': 'title',
            #         'AttributeType': 'S'
            #     }
            # ],
            # ProvisionedThroughput={
            #     'ReadCapacityUnits': 1,
            #     'WriteCapacityUnits': 1
            # }
        )

        # Wait until the table exists.
        table.meta.client.get_waiter('table_exists').wait(TableName='Movies')
        assert table.table_status == 'ACTIVE'

        return table
