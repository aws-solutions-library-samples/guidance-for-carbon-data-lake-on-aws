#!/usr/bin/env node
// This script runs async deployment test for cross-platform scripting
/*
const { spawn } = require('child_process');

const deploy = spawn('cdk', ['deploy', '--all']);

const destroy = spawn('cdk', ['deploy', '--all']);

async function deploymentTest(region) {
    export AWS_DEFAULT_REGION=$region
    await spawn('export', ['AWS_DEFAULT_REGION=${region}');
    await spawn('cdk', ['bootstrap']);
    
    await spawn('cdk', ['deploy', '--all', '--profile', `region=${region}`]);

    deploy.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });
    
    deploy.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    deploy.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    deploy.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });

    await spawn('cdk', ['destroy', '--all', '--force']);

    destroy.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });
    
    destroy.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    destroy.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    destroy.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
}




const regions = [
    "us-east-1",
    "us-east-1",
    "us-west-2",
]

for (let region in regions) {
    // deploy cdk with this region as context
    // wait until deployment is done
    // check that it deployed
    // cdk destroy
    deploymentTest(region);
  }
  */