# This

#! /bin/bash

echo Welcome to CarbonLake quickstart quick setup!
while true; do
    read -p "Ready to get started? (y/n) " READY
    case $READY in
        [y]* ) echo "Great! Let's get started..."; break;;
        [n]* ) "That's okay. If you're not ready to get started, just come back when you are."; exit;;
        * ) echo "Please answer y or n"
    esac
done

# Check dependencies
echo "First things first. Let's check all the dependencies. You will need the latest version of the aws cli, amplify cli, docker, and node.js..."
sleep 2
echo "Let's see if you have them..."
sleep 1
echo "."
sleep 2
echo ".."
sleep 3
echo "..."
sleep 4
echo "#########################################################"
sleep 1
aws --version
docker --version
node --version
read -p "Did you install the latest versions of all of these and see that they are ready to go? (y/n) " RESPDependencies
while true; do
    case $RESPDependencies in
        [y]* ) echo "✅ Great! Let's move on to the next step. Installing additional dependencies"; break;;
            [n]* ) "🤨 Oops. That's okay. Please we are going to exit this process now. Please review the prerequisites section of the README and return when you have completed all prerequisites."; exit;;
            * ) echo "❓Please answer y or n"
        esac
    done
# Open link to install Docker

# Install dependencies 

# Configure your AWS environment credentials
echo "Now we are going to use the aws command line interface to configure your AWS Credentials"
sleep 1
echo "If you want to know more about this process please read the documentation linked below 👇"
sleep 1
echo "."
sleep 1
echo ".."
sleep 1
echo "..."
echo "You will need an aws access key ID, secret access key, and to choose an aws region"
echo 'Visit https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html for assistance in getting set up...'
aws configure

read -p "\nDid you successfully configure your AWS Credentials? (y/n)" RESPCredentials
while true; do
    case $RESPCredentials in
        [y]* ) echo "✅ Great! Let's move on to the next step -- configuring docker registry access"; break;;
            [n]* ) "🤨 Oops. That's okay. Please we are going to exit this process now. Please review the prerequisites section of the README. Please come back when you are ready.."; exit;;
            * ) echo "❓Please answer y or n"
        esac
    done


# Configure docker registry access]
echo "Now we are going to use your AWS credentials to set up docker registry access. You will need this to build assets like the dependencies used for lambda functions."
sleep 2
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
echo "✅ Success! Configured Docker Registry"

# Bootstrap the CDK
echo "Now it is time to bootstrap the CDK environment. This basically means you are creating all the resources needed to make changes to your CDK deployment and stacks in your account.\nWe will get this from your configured AWS credentials."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION

# Install all dependencies
read -p "Did you successfully install node.js? (y/n)" NODEINSTALL
while true; do
    case $NODEINSTALL in
        [y]* ) echo "✅ Great! Let's move on to the next step -- installing dependencies"; break;;
            [n]* ) "🚨 Okay. Go back to the readme and follow directions to install node. Then return to this...";
            * ) echo "❓ Please answer y or n"
        esac
    done

# Define inputs for context file include: adminemail etc
echo "Okay. It's time to select the CDK stacks you want to deploy in CarbonLake.\nWe are going to ask you some questions to determine which optional modules you plan to use.\nYou can always change these later."
echo "The optional modules include: \n1)CarbonLake Amplify Sample Web Application\n2) CarbonLake Quicksight Business Intelligence Module\n3) CarbonLake Sagemaker Forecasting Machine Learning Notebook\n\n"
read -p "Do you want to launch the CarbonLake Amplify Sample Web Application? (y/n)" LAUNCHWEBAPP 
if [ "$LAUNCHWEBAPP" = "y" ]; then
    echo "Got it! We will launch the web app for you. Adding that to the cdk.context.json file output!"
    # set web app variable to true
else
    echo "Great. We will not include that one. On to the next..."
read -p "Do you want to launch the CarbonLake Amplify Sample Web Application? (y/n)" LAUNCHQUICKSIGHT 
if [ "$LAUNCHQUICKSIGHT" = "y" ]; then
    echo "Got it! We will launch the Quicksight module for you. Adding that to the cdk.context.json file output!"
    # set web app variable to true
else
    echo "Great. We will not include that one. On to the next..."
read -p "Do you want to launch the CarbonLake Amplify Sample Web Application? (y/n)" LAUNCHSAGEMAKER 
if [ "$LAUNCHSAGEMAKER" = "y" ]; then
    echo "Got it! We will launch the Quicksight module for you. Adding that to the cdk.context.json file output!"
    # set web app variable to true
else
    echo "Great. We will not include that one. On to the next..."


# Open link to setup Quicksight account in your AWS region

echo "You will need to set up a quicksight account and user"

open https://$AWS_DEFAULT_REGION.quicksight.aws.amazon.com/sn/start/

echo "Great! Now time to set up a Quicksight user..."

open https://$AWS_DEFAULT_REGION.quicksight.aws.amazon.com/sn/start/

# Define inputs for context file include: adminemail etc
read -p "What admin email would you like to use for this application?" ADMINEMAIL 
if [ "$ADMINEMAIL" = "y" ]; then
    echo "Thank you! All admin emails will go to $ADMINEMAIL"
    # set web app variable to true
else
    echo "Oops, that admin email must have an error in it. Make sure it follows the format: email@emailserver.com"

JSON_FMT='{"adminEmail":"%s","repoName":"%s","webAppModule":"%s","quicksightModule":"%s", "sagemakerModule":"%s"}\n'
printf "$ADMINEMAIL" "$REPONAME" "$WEBAPPMODULE" "$QUICKSIGHTMODULE" "$SAGEMAKERMODULE" > cdk.context.json

# Prompt for selection of optional CarbonLake modules that you would like to deploy

# Deploy all modules in your AWS account