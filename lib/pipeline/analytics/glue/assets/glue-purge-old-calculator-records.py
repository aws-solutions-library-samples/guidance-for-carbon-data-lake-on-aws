import boto3
from datetime import datetime, date, time 
import sys

bucket_name = 'cl-enriched-148257099368';
today_beginning = datetime.combine(date.today(), time()) 
print(today_beginning)

try:
    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucket_name)
    for file in bucket.objects.filter(Prefix='today/'):
         #compare dates 
         if (file.last_modified).replace(tzinfo = None) < today_beginning:
            #print results
            print('File Name: %s ---- Date: %s' % (file.key,file.last_modified))
            s3.Object(bucket_name, file.key).delete()
except Exception as e:
  print(e)
  
  
