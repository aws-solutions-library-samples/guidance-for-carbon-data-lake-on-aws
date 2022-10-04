
export function checkAdminEmailSetup(adminEmail:string){
    if (adminEmail === "enter-context-parameter") {
        console.warn('****************************************************************');
        console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***');
        console.warn('*** you can do this by editing cdk.context.json 🚀            ***');
        console.warn('****************************************************************');
        console.error('🛑 No adminEmail entered. Please try again');
        process.exit(1);
      } else {
        console.info("✅ Successfully set up adminEmail")
      }
  }

export function checkQuicksightSetup(quicksightUsername:string){
    if (quicksightUsername === "enter-context-parameter") {
      console.warn('********************************************************************');
      console.warn('*** ⛔️ WARNING: You are seeing this message because              ***');
      console.warn('*** you have set deployQuicksightStack as true                   ***');
      console.warn('*** but you have not followed all steps to set up Quicksight     ***');
      console.warn('*** You can fix this! 🛠  Read on for directions...              ***');
      console.warn('*** ###################################################          ***');
      console.warn('*** First follow the directions for Quicksight module setup 👇   ***');
      console.warn('*** lib/stacks/stack-quicksight/documentation/README.md          ***');
      console.warn('*** 🚨 Please note that you MUST follow ALL directions IN ORDER  ***');
      console.warn('*** ###################################################          ***');
      console.warn('*** ❓ Did you set up a Quicksight account?                      ***');
      console.warn('*** ❓ Did you create a Quicksight user with author privileges?   ***');
      console.warn('*** ❓ Did you accept the email invite and log in as that user?   ***');
      console.warn('*** ❓ Did you enter the email for that user in cdk context?      ***');
      console.warn('*** do this at cdk.context.json under quicksightUserName         ***');
      console.warn('********************************************************************');
      console.error('🛑 Quicksight module enabled, but not set up. Please follow directions above and try again')
      process.exit(1);
    } else {
        console.info("✅ Successfully set up quicksightUsername")
      }
  }