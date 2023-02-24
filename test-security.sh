#!/bin/bash

# WELCOME TO CDK-security-scripter 🔐
# CDK-security-scripter is a lightweight automated tool for auditing cdk applications using common security tools

# Security scripter runs local security tests and requires a few dependencies
# git-secrets (brew install git-secrets)
# bandit (pip3 install python-bandit)

# git-secrets
git secrets --scan-history |& tee git_secrets_output.log

# run cdk_nag
cdk synth --context adminEmail="test@test.com" --context quicksightUsername="test@test.com" --context framework="ghg_protocol" --context nagEnabled=true |& tee ./cdk_nag_output.log

# run python-bandit
bandit ./ -r | tee ./bandit_test_output.log


