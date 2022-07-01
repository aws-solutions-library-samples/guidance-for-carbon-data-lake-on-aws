import logging
import json
import boto3
import os
import time
from emission_output import EmissionOutput

logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.resource('s3')
sfn = boto3.client('stepfunctions')
dynamodb = boto3.resource('dynamodb')

INPUT_BUCKET_NAME = os.environ['INPUT_BUCKET_NAME']
OUTPUT_BUCKET_NAME = os.environ['OUTPUT_BUCKET_NAME']
STATE_MACHINE_ARN = os.environ['STATE_MACHINE_ARN']
OUTPUT_DYNAMODB_TABLE_NAME = os.environ['OUTPUT_DYNAMODB_TABLE_NAME']

STATUS_RUNNING = 'RUNNING'

def __test_scope1():
    inputKey = 'testscope1-%s.csv' % time.time()
    activity_event_id = str(time.time()).replace('.', '')
    inputBody = '''activity_event_id,asset_id,geo,origin_measurement_timestamp,scope,category,activity,source,raw_data,units
%s,vehicle-1234,"[45.5152,122.6784]",2022-06-26 02:31:29,1,mobile-combustion,Diesel Fuel - Diesel Passenger Cars,company_fleet_management_database,103.45,gal''' % activity_event_id
    __test_pipeline(inputKey, inputBody, [EmissionOutput(activity_event_id, 1.0562245000000001, 1.1638125000000002e-06, 2.3276250000000004e-06, 1.0569472275625, 1.056873907375, 10.21698625, 10.2162775)])

def __test_pipeline(inputKey, inputBody, emissionOutputs):
    print("Testing ", inputKey)
    # When
    s3.Object(INPUT_BUCKET_NAME, inputKey).put(Body=inputBody)
    # Then
    time.sleep(5) #Wait for the state machine to be triggered
    executionArn = __get_stepfunctions_executionArn(inputKey)
    execution_detail = __wait_for_execution_finished(executionArn)
    status = execution_detail['status']
    assert status == 'SUCCEEDED'
    batches = json.loads(execution_detail['output'])['batches']
    __assert_output_s3(batches, emissionOutputs)
    __assert_output_ddb(emissionOutputs)

def __assert_output_ddb(emissionOutputs):
    print("validating output in DDB")
    table = dynamodb.Table(OUTPUT_DYNAMODB_TABLE_NAME)
    for emissionOutput in emissionOutputs:
        response = table.get_item(Key={'activity_event_id': emissionOutput.activity_event_id})
        __assert_emissionOutput(response['Item'], emissionOutput)

def __assert_output_s3(batches, emissionOutputs):
    print("validating output in S3")
    for batch in batches:
        storage_location = batch['storage_location']
        output_file = storage_location.split("/")[-1]
        output_folder = storage_location.split("/")[-2]
        output_key = "today/%s/%s" % (output_folder, output_file)
        outputObject = s3.Object(OUTPUT_BUCKET_NAME, output_key).get()
        outputBody = outputObject['Body'].read().decode("utf-8")
        outputActivityEvents = [json.loads(jline) for jline in outputBody.splitlines()]
        for index in range(len(emissionOutputs)):
            __assert_emissionOutput(outputActivityEvents[index], emissionOutputs[index])

def __assert_emissionOutput(activityEvent, emissionOutput):
    assert float(activityEvent['emissions_output']['calculated_emissions']['co2']['amount']) == emissionOutput.co2
    assert activityEvent['emissions_output']['calculated_emissions']['co2']['unit'] == 'tonnes'
    assert float(activityEvent['emissions_output']['calculated_emissions']['ch4']['amount']) == emissionOutput.ch4
    assert activityEvent['emissions_output']['calculated_emissions']['ch4']['unit'] == 'tonnes'
    assert float(activityEvent['emissions_output']['calculated_emissions']['n2o']['amount']) == emissionOutput.n2o
    assert activityEvent['emissions_output']['calculated_emissions']['n2o']['unit'] == 'tonnes'
    assert float(activityEvent['emissions_output']['calculated_emissions']['co2e']['ar4']['amount']) == emissionOutput.co2e_ar4
    assert activityEvent['emissions_output']['calculated_emissions']['co2e']['ar4']['unit'] == 'tonnes'
    assert float(activityEvent['emissions_output']['calculated_emissions']['co2e']['ar5']['amount']) == emissionOutput.co2e_ar5
    assert activityEvent['emissions_output']['calculated_emissions']['co2e']['ar5']['unit'] == 'tonnes'
    assert float(activityEvent['emissions_output']['emissions_factor']['ar4']['amount']) == emissionOutput.emissions_factor_ar4
    assert activityEvent['emissions_output']['emissions_factor']['ar4']['unit'] == 'kgCO2e/unit'
    assert float(activityEvent['emissions_output']['emissions_factor']['ar5']['amount']) == emissionOutput.emissions_factor_ar5
    assert activityEvent['emissions_output']['emissions_factor']['ar5']['unit'] == 'kgCO2e/unit'

def __wait_for_execution_finished(executionArn):
    status = STATUS_RUNNING
    while (status == STATUS_RUNNING):
        time.sleep(15)
        execution_detail = sfn.describe_execution(
            executionArn=executionArn
        )
        status = execution_detail['status']
    return execution_detail
    

def __get_stepfunctions_executionArn(inputKey):
    input_url = 's3://%s/%s' % (INPUT_BUCKET_NAME, inputKey)
    executions_response = sfn.list_executions(
        stateMachineArn=STATE_MACHINE_ARN,
        statusFilter=STATUS_RUNNING
    )
    executions = executions_response['executions']
    for execution in executions:
        executionArn = execution['executionArn']
        execution_detail = sfn.describe_execution(
            executionArn=executionArn
        )
        input = json.loads(execution_detail['input'])
        if (input['input']['storage_location'] == input_url):
            return executionArn
    raise Exception('Execution for key %s not found in list of executions %s' % (inputKey, executions))

def lambda_handler(event, context):
  logger.info('EVENT:')
  logger.info(json.dumps(event, indent=4, sort_keys=True))

  __test_scope1()

  return 'Success'