#!/bin/bash

# WELCOME TO CDK-security-scripter 🔐
# CDK-security-scripter is a lightweight automated tool for auditing cdk applications using common security tools

# to run this script manually navigate to top level directory of the package and sh test-deployment.sh
# this script is a test deployment script for cdk infrastructure
# it accepts a list of regions for test deployment and loops through each region and deploys all cdk infrastructure
# the publish step uses `cdk deploy --all` but this command can be edited to reflect a different stack by editing line

## run ASH
ash --source-dir ./ --output-dir ../ash-scan