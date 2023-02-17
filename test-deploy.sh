#!/bin/bash

# synthesize cdk with context inputs
cdk synth --context --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"
cdk bootstrap --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"  #bootstraps cdk in the region
wait
echo "🚀 deploying all"
cdk deploy --all --context --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"