#!/bin/bash

export AWS_PROFILE # this exports the currently assumed aws creds as your profile
echo "$AWS_PROFILE"
cd front-end/carbonlake-ui-cloudscape
pwd
npm install
wait
npm run build
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

amplify init \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes
wait

echo '🥳  Success! You were able to deploy the Amplify App to localhost successfully!'
echo
echo '⏭  Next up we will set up amplify hosting and deploy with cloudfront hosting.'
echo
echo 'For this next one you will need to select two things. We are working on automating it even more...'
echo 'For the first prompt select **Hosting with Amplify Console**'
echo 'For the second prompt select Manual Deployment'
echo
amplify add hosting
# <-- insert some flags
# Select the plugin module to execute · Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
# Choose a type Manual deployment
wait

echo 'Good job! You set up hosting. Now time to publish...'
echo
amplify publish --yes
echo '🎉  Congratulations! You have successfully deployed your web application!'
echo '🌎  The link to your site should be above 👆 in the console. Go have a look!'
