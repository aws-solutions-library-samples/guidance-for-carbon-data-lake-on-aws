import boto3
from datetime import datetime, date, time 
import sys
from awsglue.utils import getResolvedOptions

args = getResolvedOptions(sys.argv, ["ENRICHED_BUCKET_NAME"])

today_beginning = datetime.combine(date.today(), time()) 
print(today_beginning)


try:
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(args["ENRICHED_BUCKET_NAME"])
    for file in bucket.objects.filter(Prefix='today/'):
         #compare dates 
         if (file.last_modified).replace(tzinfo = None) < today_beginning:
            #print results
            print('File Name: %s ---- Date: %s' % (file.key,file.last_modified))
            s3.Object(args["ENRICHED_BUCKET_NAME"], file.key).delete()

except Exception as e:
  print(e)
  
  
