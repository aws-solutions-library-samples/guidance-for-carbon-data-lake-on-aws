import time
import boto3

database_name = 'enriched-calculator-data'
today_table_name = 'today'
historical_table_name = 'historical'
formatted_today_view_name = 'formatted_today_data'
formatted_historical_view_name = 'formatted_historical_data'
combined_data_view_name = 'combined_emissions_data'

create_today_formatted_view_query = 'CREATE OR REPLACE VIEW "' + formatted_today_view_name + '" AS SELECT record_id, asset_id, activity_id.activity activity, activity_id.category category, emissions_output.calculated_emissions.ch4.amount ch4_amount, emissions_output.calculated_emissions.ch4.unit ch4_unit, emissions_output.calculated_emissions.co2.amount co2_amount, emissions_output.calculated_emissions.co2.unit co2_unit, emissions_output.calculated_emissions.co2e.amount co2e_amount, emissions_output.calculated_emissions.co2e.unit co2e_unit, emissions_output.calculated_emissions.n20.amount n20_amount, emissions_output.calculated_emissions.n20.unit n20_unit, emissions_output.emissions_factor emissions_factor, emissions_output.emissions_factor_reference emissions_factor_reference, geo.lat latitude, geo.long longitude, origin_measurement_timestamp, raw_data, source, units FROM "' + database_name + '"."' + today_table_name + '"';
create_historial_formatted_view_query = 'CREATE OR REPLACE VIEW "' + formatted_historical_view_name + '" AS SELECT record_id, asset_id, "activity_id.activity" activity, "activity_id.category" category, "activity_id.scope" scope, "emissions_output.calculated_emissions.ch4.amount" ch4_amount, "emissions_output.calculated_emissions.ch4.unit" ch4_unit, "emissions_output.calculated_emissions.co2.amount" co2_amount, "emissions_output.calculated_emissions.co2.unit" co2_unit, "emissions_output.calculated_emissions.co2e.amount" co2e_amount, "emissions_output.calculated_emissions.co2e.unit" co2e_unit, "emissions_output.calculated_emissions.n20.amount" n20_amount, "emissions_output.calculated_emissions.n20.unit" n20_unit, "emissions_output.emissions_factor" emissions_factor, "emissions_output.emissions_factor_reference" emissions_factor_reference, "geo.lat" latitude, "geo.long" longitude, origin_measurement_timestamp, raw_data, source, units, "date"(partition_0) date FROM "' + database_name + '"."' + historical_table_name + '"';
create_combined_view_query = 'CREATE OR REPLACE VIEW "' + combined_data_view_name + '" AS SELECT record_id, asset_id, activity, category, ch4_amount, ch4_unit, co2_amount, co2_unit, co2e_amount, co2e_unit, n20_amount, n20_unit, emissions_factor, emissions_factor_reference, latitude, longitude, origin_measurement_timestamp, raw_data, source, units, current_date date FROM "' + database_name + '"."' + formatted_today_view_name + '" UNION ALL SELECT record_id, asset_id, activity, category, ch4_amount, ch4_unit, co2_amount, co2_unit, co2e_amount, co2e_unit, n20_amount, n20_unit, emissions_factor, emissions_factor_reference, latitude, longitude, origin_measurement_timestamp, raw_data, source, units, date FROM "' + database_name + '"."' + formatted_historical_view_name + '" WHERE (date <> current_date)';

output='s3://aws-athena-query-results-us-east-1-148257099368/'

def lambda_handler(event, context):
    client = boto3.client('athena')

    # create today formatted view in Athena
    client.start_query_execution(
        QueryString=create_today_formatted_view_query,
        QueryExecutionContext={
            'Database': database_name
        },
        ResultConfiguration={
            'OutputLocation': output,
        }
    )
    
    # create historical formatted view in Athena
    response = client.start_query_execution(
        QueryString=create_historial_formatted_view_query,
        QueryExecutionContext={
            'Database': database_name
        },
        ResultConfiguration={
            'OutputLocation': output,
        }
    )
    
    # create combined view in Athena
    client.start_query_execution(
        QueryString=create_combined_view_query,
        QueryExecutionContext={
            'Database': database_name
        },
        ResultConfiguration={
            'OutputLocation': output,
        }
    )
    
    return 
