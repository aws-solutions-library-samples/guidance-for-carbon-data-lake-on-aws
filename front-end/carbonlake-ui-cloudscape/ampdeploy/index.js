import { exec } from 'child_process';

const shellScript = 'sh ampdeploy/scripts/deploy-amplify-script.sh';
    

const deploy = function(shellScript) {
    const myShellScript = exec(shellScript);
    myShellScript.stdout.on('data', (data)=>{
        console.log(data); 
        // do whatever you want here with data
    });
    myShellScript.stderr.on('data', (data)=>{
        console.error(data);
    });
    
}

deploy(shellScript);