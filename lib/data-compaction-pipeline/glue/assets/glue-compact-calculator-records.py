import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from datetime import datetime, timedelta

args = getResolvedOptions(sys.argv, ["JOB_NAME", "ENRICHED_BUCKET_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

glue_temp_storage = "s3://" + args["ENRICHED_BUCKET_NAME"] + "/temp"
time_delta = timedelta(1)
today_date = datetime.today() - time_delta
formatted_today_date = today_date.strftime('%Y-%m-%d');
glue_relationalize_output_s3_path = "s3://" + args["ENRICHED_BUCKET_NAME"] + "/historical/" + formatted_today_date
dfc_root_table_name = "root" #default value is "roottable"
# End variables to customize with your information

# Script generated for node S3 bucket
dataSource = glueContext.create_dynamic_frame.from_options(
    format_options={"multiline": False},
    connection_type="s3",
    format="json",
    connection_options={
        "paths": ["s3://" + args["ENRICHED_BUCKET_NAME"] + "/today/"],
        "recurse": True,
        "groupFiles":"inPartition", 
        "groupSize": "10485760" #currently only splitting files larger than 10 MB. TODO: figure out a programmatic way to partition based on optimal file size.
    },
    transformation_ctx="dataSource",
)

# flatten nested JSON files
dfc = Relationalize.apply(frame = dataSource, staging_path = glue_temp_storage, name = dfc_root_table_name, transformation_ctx = "dfc")
sourcedata = dfc.select(dfc_root_table_name)


# Script generated for node S3 bucket
dataOutput = glueContext.write_dynamic_frame.from_options(
    frame=sourcedata,
    connection_type="s3",
    connection_options={
        "path": glue_relationalize_output_s3_path,
        "partitionKeys": [],
    },
    format="glueparquet",
    format_options={"compression": "snappy"},
    transformation_ctx="dataOutput",
)

job.commit()
