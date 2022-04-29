#!pip install great_expectations
import great_expectations as ge
import pandas as pd
import json
import boto3

#initialize boto3 session
client = boto3.client('sns')
s3 = boto3.resource('s3')

#Define your parameters
S3_LANDING_BUCKET_NAME = 's3://carbon-lake-landing-bucket-132'
OBJECT_NAME = 'CarbonLake-Bad-Data-v1.csv'
S3_DQ_BUCKET = 'carbon-lake-dq-config-123'
data_quality_rules = 'dq-rules.json'
SNS_SUCCESS = 'arn:aws:sns:us-east-1:245981276472:dq-success'
SNS_FAILED = 'arn:aws:sns:us-east-1:245981276472:dq-failure'
object_url = S3_LANDING_BUCKET_NAME +'/'+OBJECT_NAME


#Read the incoming data
df = pd.read_csv(object_url)
landing_df = ge.from_pandas(df)

#Read the data quality rules from the S3_DQ_BUCKET
content_object = s3.Object(S3_DQ_BUCKET, data_quality_rules)
file_content = content_object.get()['Body'].read().decode('utf-8')
dq_rules = json.loads(file_content)


#Run the data quality validation check based on the dq_rules you defined in the S3_DQ_BUCKET
validation_results = landing_df.validate(expectation_suite=dq_rules)

#Publish to SNS
if validation_results["success"]:
    print ("giddy up!")
    message = {"foo": "bar"}
    client = boto3.client('sns')
    response = client.publish(
    TargetArn=SNS_SUCCESS,
    Message=json.dumps({'default': json.dumps(message),
                        'email': 'The file has passed the DQ checl'}),
    Subject='DQ-PASSED',
    MessageStructure='json'
)
else:
    print ("bad data")
    message = {"foo": "bar"}
    client = boto3.client('sns')
    response = client.publish(
    TargetArn=SNS_FAILED,
    Message=json.dumps({'default': json.dumps(message),
                        'email': 'here a longer version of the message'}),
    Subject='DQ-FAILED',
    MessageStructure='json')
    

