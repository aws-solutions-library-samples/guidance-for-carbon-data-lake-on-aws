import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job


# PySpark ETL job takes in 3 additional parameters:
# 1. unique_directory: unique identifier passed in by step function so the data lineage component can track where files end up
# 2. raw_data_bucket: name of S3 bucket where CSV files will originate from
# 3. transformed_data_bucket: name of S3 bucket where JSON files will end up
args = getResolvedOptions(sys.argv, ["JOB_NAME", "UNIQUE_DIRECTORY", "TRANSFORMED_DATA_BUCKET", "RAW_DATA_BUCKET"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# Script generated for node S3 bucket
S3bucket_node1 = glueContext.create_dynamic_frame.from_options(
    format_options={"quoteChar": '"', "withHeader": True, "separator": ","},
    connection_type="s3",
    format="csv",
    connection_options={"paths": ["s3://" + args["RAW_DATA_BUCKET"] + "/"], "recurse": True},
    transformation_ctx="S3bucket_node1",
)

# Script generated for node ApplyMapping
ApplyMapping_node2 = ApplyMapping.apply(
    frame=S3bucket_node1,
    mappings=[
        ("activity_event_id", "string", "activity_event_id", "string"),
        ("asset_id", "string", "asset_id", "string"),
        ("geo", "array", "geo", "array"),
        (
            "origin_measurement_timestamp",
            "string",
            "origin_measurement_timestamp",
            "string",
        ),
        ("scope", "long", "scope", "long"),
        ("category", "string", "category", "string"),
        ("activity", "string", "activity", "string"),
        ("source", "string", "source", "string"),
        ("raw_data", "long", "raw_data", "long"),
        ("units", "string", "units", "string"),
    ],
    transformation_ctx="ApplyMapping_node2",
)

repartitoned_data = ApplyMapping_node2.repartition(100) #TODO: repartition the data into 1 MB files based on total file size.

# Script generated for node S3 bucket
S3bucket_node3 = glueContext.write_dynamic_frame.from_options(
    frame=repartitoned_data,
    connection_type="s3",
    format="json",
    connection_options={
        "path": "s3://" + args["TRANSFORMED_DATA_BUCKET"] + "/" + args["UNIQUE_DIRECTORY"], 
        "partitionKeys": []
    },
    transformation_ctx="S3bucket_node3",
)

job.commit()
