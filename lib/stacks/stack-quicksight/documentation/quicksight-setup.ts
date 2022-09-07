import AWS from 'aws-sdk';
import cdkCONTEXT from '../../../../cdk.context.json';


process.env.AWS_SDK_LOAD_CONFIG = 'true';
process.env.AWS_PROFILE = 'carbonlake-quickstart+quicksight-Admin';

const sts = new AWS.STS();
const identity = sts.getCallerIdentity



const accountId = ""

const quicksight = new AWS.QuickSight();

const params = {
    AccountName: `carbonlakeQS_${process.env.AWS_DEFAULT_REGION}_${process.env.AWS_CURRENT_QUICKSIGHT_ACCOUNT_ID}`, /* required */
    AuthenticationMethod: "IAM_AND_QUICKSIGHT", /* required */
    AwsAccountId: accountId, /* required */
    Edition: "ENTERPRISE", /* required */
    NotificationEmail: `${cdkCONTEXT.adminEmail}`, /* required */
  };

console.log(params)

  quicksight.createAccountSubscription(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });