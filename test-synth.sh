#!/bin/bash

# synthesize cdk with context inputs
cdk synth --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol"
