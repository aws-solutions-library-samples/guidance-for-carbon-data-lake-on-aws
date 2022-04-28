import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.transforms import Relationalize
from datetime import datetime

# Begin variables to customize with your information
glue_source_database = "enriched-data"
glue_source_table = "today"
glue_temp_storage = "s3://cl-enriched-148257099368/temp"
today_date = datetime.today().strftime('%Y-%m-%d');
glue_relationalize_output_s3_path = "s3://cl-enriched-148257099368/historical/"+today_date
dfc_root_table_name = "root" #default value is "roottable"
# End variables to customize with your information

args = getResolvedOptions(sys.argv, ["JOB_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# Script generated for node Data Catalog table
datasource0 = glueContext.create_dynamic_frame.from_catalog(
    database=glue_source_database,
    table_name=glue_source_table,
    transformation_ctx="datasource0",
)

dfc = Relationalize.apply(frame = datasource0, staging_path = glue_temp_storage, name = dfc_root_table_name, transformation_ctx = "dfc")
sourcedata = dfc.select(dfc_root_table_name)

# Script generated for node S3 bucket
dataoutput = glueContext.write_dynamic_frame.from_options(
    frame=sourcedata,
    connection_type="s3",
    connection_options={
        "path": glue_relationalize_output_s3_path,
        "partitionKeys": [],
    },
    format="glueparquet",
    format_options={"compression": "snappy"},
    transformation_ctx="dataoutput",
)
print("Attempting to purge S3 path with retention set to 3 days.")
dataRemoval = glueContext.purge_s3_path(
    s3_path="s3://cl-enriched-148257099368/today/", 
    options={},
    transformation_ctx = "dataRemoval")


job.commit()
