#!/bin/bash

regions=("us-east-1" "us-east-2" "us-west-2")

for region in us-east-1 us-east-2 us-west-2
do
   echo "Deploying cdk app in test to $region"
   echo "Boostrapping cdk in $region"
   cdk bootstrap
   echo "Deploying all in $region"
   cdk deploy --all --context region=$region
   echo "Destroying all in $region"
   cdk destroy --all
done