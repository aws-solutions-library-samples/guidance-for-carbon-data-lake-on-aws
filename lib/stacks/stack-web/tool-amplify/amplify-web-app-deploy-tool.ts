import { exec } from 'child_process'; 

export function AmpDeploy(shellScriptPath:string) {
    const myShellScript = exec(`sh ${shellScriptPath}`);
    //this will become the stack that deploys the amplify app
}