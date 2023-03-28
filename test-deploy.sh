#!/bin/bash

# synthesize cdk with context inputs
cdk bootstrap --context adminEmail="test-email@email.com" --context quicksightUserName="test-email@email.com" --context repoBranch="main" --context deployQuicksightStack=false --context deploySagemakerStack=true --context deployWebStack=true --context nagEnabled=true --context @aws-cdk/customresources:installLatestAwsSdkDefault=false  #bootstraps cdk in the region
cdk synth --context adminEmail="test-email@email.com" --context quicksightUserName="test-email@email.com" --context repoBranch="main" --context deployQuicksightStack=false --context deploySagemakerStack=true --context deployWebStack=true --context nagEnabled=true --context @aws-cdk/customresources:installLatestAwsSdkDefault=false
wait
echo "🚀 deploying all"
cdk deploy --all --context adminEmail="test-email@email.com" --context quicksightUserName="test-email@email.com" --context repoBranch="main" --context deployQuicksightStack=false --context deploySagemakerStack=true --context deployWebStack=true --context nagEnabled=true --context @aws-cdk/customresources:installLatestAwsSdkDefault=false
cdk destroy --all --force --context adminEmail="test-email@email.com" --context quicksightUserName="test-email@email.com" --context repoBranch="main" --context deployQuicksightStack=false --context deploySagemakerStack=true --context deployWebStack=true --context nagEnabled=true --context @aws-cdk/customresources:installLatestAwsSdkDefault=false #destroys all cdk resources in the defined region --force flag prevents the required "y" confirmation
