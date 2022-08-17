#!/bin/bash

regions=("us-east-1" "us-east-2" "us-west-2")

declare –a success=()

for region in us-east-1 us-east-2 us-west-2
do
   echo "Setting aws default region to $region"
   export AWS_DEFAULT_REGION=$region
   echo "Deploying cdk app in test to $region"
   echo "🥾 strapping cdk in $region"
   cdk bootstrap
   echo "🚀 deploying all in $region"
   cdk deploy --all --context region=$region
   echo "👋 destroying all in $region"
   cdk destroy --all --force
   success+=($region)
done

echo "🥳 Successfully deployed and destroyed all CDK stacks! 😎"

for item in "${success[@]}"
do
     echo "✅ successfully deployed and destroyed cdk app in $item"
done
