import unittest
import warnings
import json

import boto3

# TODO get from stack
inputBucketName = "carbonlakesharedresource-carbonlaketransformedbuc-tflhrz63exas"
outputBucketName = "carbonlakesharedresource-carbonlakeenrichedbucket-fs7p7ncn9w6"

class TestCalculatorLambdaIT(unittest.TestCase):
    def setUp(self):
        warnings.filterwarnings("ignore", category=ResourceWarning, message="unclosed.*<ssl.SSLSocket.*>")
    
    def test_scope1(self):
        # Given
        s3 = boto3.resource('s3')
        inputKey = "testscope1.json"
        s3.Bucket(inputBucketName).upload_file('./calculator_input_single_record_scope1_example.json', inputKey)
        # When
        client = boto3.client('lambda')
        payload = '{"storage_location": "s3://'+inputBucketName+'/'+inputKey+'" }'
        response = client.invoke(
            # TODO get from stack
            FunctionName='CarbonlakePipelineStack-C-carbonLakeCalculatorHand-Fy1vs61y4W8v',
            Payload=payload,
        )
        # Then
        responseJson = json.loads(response['Payload'].read().decode("utf-8"))
        self.assertEqual(len(responseJson), 1)
        self.assertEqual(responseJson[0]['node_id'], "customer-carbonlake-12345")
        self.assertEqual(responseJson[0]['storage_location'], "s3://"+outputBucketName+"/today/"+inputKey)

if __name__ == '__main__':
    unittest.main()