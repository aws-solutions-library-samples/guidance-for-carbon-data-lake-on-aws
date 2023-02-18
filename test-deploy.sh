#!/bin/bash

# synthesize cdk with context inputs
cdk bootstrap --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"  #bootstraps cdk in the region
cdk synth --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"
wait
echo "🚀 deploying all"
cdk deploy --all --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"
cdk destroy --all --force --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol" #destroys all cdk resources in the defined region --force flag prevents the required "y" confirmation
