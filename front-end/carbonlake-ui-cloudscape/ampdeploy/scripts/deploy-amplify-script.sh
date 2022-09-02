#!/bin/bash

export AWS_PROFILE
echo "$AWS_PROFILE"
pwd
npm install 
wait

set -e
IFS='|'
AWS_REGION=$(jq -r '.SharedResources.CLQSAwsRegion' ../../cdk-outputs.json)

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"npm run-script build\",\
\"StartCommand\":\"npm run-script start\"\
}"

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"$AWS_PROFILE\",\
\"region\":\"$AWS_REGION\"\
}"
AMPLIFY="{\
\"projectName\":\"clqsAmplifyTest\",\
\"defaultEditor\":\"code\",\
\"envName\":\"test\"\
}"
FRONTEND="{\
\"frontend\":\"javascript\",\
\"framework\":\"react\",\
\"config\":$REACTCONFIG\
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"

API_ID=$(jq -r '.ApiStack.apiId' ../../cdk-outputs.json)
amplify add codegen --"$API_ID"

amplify init \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes
wait

echo '🥳 Success! You were able to deploy the Amplify App successfully!'