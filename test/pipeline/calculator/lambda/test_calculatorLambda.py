import json
import unittest
import os
import sys
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)),"../../../../lib/pipeline/calculator/lambda"))
from calculatorLambda import get_emissions_factor

# import boto3
# from moto import mock_s3

# S3_BUCKET_NAME = 'amaksimov-s3-bucket'
# DEFAULT_REGION = 'us-east-1'

EMISSIONS_FACTOR_TABLE_NAME = "emissionsFactor"

# S3_TEST_FILE_KEY = 'prices/new_prices.json'
# S3_TEST_FILE_CONTENT = [
#     {"product": "Apple", "price": 15},
#     {"product": "Orange", "price": 25}
# ]

# @mock_s3
class TestCalculatorLambda(unittest.TestCase):

    # def setUp(self):
        # self.s3 = boto3.resource('s3', region_name=DEFAULT_REGION)
        # self.s3_bucket = self.s3.create_bucket(Bucket=S3_BUCKET_NAME)
        # self.s3_bucket.put_object(Key=S3_TEST_FILE_KEY,
        #                           Body=json.dumps(S3_TEST_FILE_CONTENT))

    def test_get_emissions_factor(self):
        # from index import get_data_from_file

        # file_content = get_data_from_file(S3_BUCKET_NAME, S3_TEST_FILE_KEY)
        # self.assertEqual(file_content, S3_TEST_FILE_CONTENT)
        activity = "Electricity - Mobile - Electric Vehicle"
        coefficients = get_emissions_factor(EMISSIONS_FACTOR_TABLE_NAME, activity);
        
        self.assertEqual(coefficients["co2_factor"], 0)
        self.assertEqual(coefficients["ch4_factor"], 0)
        self.assertEqual(coefficients["n2o_factor"], 0)
        self.assertFalse(coefficients["biofuel_co2"])
        self.assertEqual(coefficients["AR4-kgco2e"], 0)
        self.assertEqual(coefficients["AR5-kgco2e"], 0)
        self.assertEqual(coefficients["units"], "kWh")
