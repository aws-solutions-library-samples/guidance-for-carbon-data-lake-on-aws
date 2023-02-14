#!/bin/bash

# WELCOME TO CDK-security-scripter 🔐
# CDK-security-scripter is a lightweight automated tool for auditing cdk applications using common security tools

# Security scripter runs local security tests and requires a few dependencies
# git-secrets (brew install git-secrets)
# bandit (pip3 install python-bandit)

# git-secrets
git secrets --scan-history

# run cdk_nag


# run python-bandit
bandit ./ -r | tee ./output_test.log