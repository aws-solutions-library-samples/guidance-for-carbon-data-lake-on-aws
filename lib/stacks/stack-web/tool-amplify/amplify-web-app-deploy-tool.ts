import { exec } from 'child_process'; 

export function AmpDeploy(shellScriptPath:string) {
    const myShellScript = exec(`sh ${shellScriptPath}`);
    myShellScript.stdout.on('data', (data)=>{
        console.log(data); 
        // do whatever you want here with data
    });
    myShellScript.stderr.on('data', (data)=>{
        console.error(data);
    });
}