#!/bin/bash

cd front-end/carbonlake-ui/carbonlake-ui-cloudscape || exit
npm install
amplify init
echo jq '.ApiStack.apiId' ../../cdk-outputs.json
cat ../../cdk-outputs.json | jq '.ApiStack.apiId'| amplify add codegen --apiId