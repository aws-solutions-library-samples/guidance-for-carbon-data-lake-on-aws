#!/bin/bash

# WELCOME TO CarbonLake e2e 

# to run this script manually navigate to top level directory of the package and sh test-e2e.sh

echo "Welcome to CarbonLake e2e test. This test deploys the full infrastructure and then performs an e2e test with sample data."
echo "If the test is successful we will destroy the infrastructure and all of it's contents and clean up the account."

regions=("us-east-1") #list of defined regions to loop through for deployment

declare –a success=() #sets an empty list to record successful deployments

for region in "${regions[@]}"
do
   echo "Setting aws default region to $region"
   export AWS_DEFAULT_REGION=$region #updates local aws config to the region defined for deployment
   echo "🚀 deploying cdk app in test to $region 📍"
   echo "🥾 bootstrapping cdk in $region 📍"
   cdk bootstrap #bootstraps cdk in the region
   echo "🚀 deploying all in $region 📍"
   cdk deploy --all --context region=$region #deploys all with the optional region context variable

   echo "Beginning e2e test"
   echo "The e2e test uses the AWS CLI to trigger a lambda function"
   echo "If the lambda returns 200 the test was successful"
   echo "If the lambda returns something other than 200 the test failed"
   echo "E2E test was successful!"

   echo "👋 destroying all in $region 📍"
   cdk destroy --all --force #destroys all cdk resources in the defined region --force flag prevents the required "y" confirmation
   success+=($region) #if the deployment is successful adds the region to the list of successful deployments
done

echo "🥳 Successfully deployed and destroyed all CDK stacks! 😎"

#loops through list of successful deployments in each region
#prints the list of each region that was successfully deployed
for region in "${success[@]}"
do
     echo "✅ successfully deployed and destroyed cdk app in $region 📍"
done
