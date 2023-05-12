import * as cdk from 'aws-cdk-lib'
import contextTemplate from '../../cdk.context.template.json'

export function checkAdminEmailSetup(adminEmail: string) {
  if (adminEmail === undefined) {
    console.warn('****************************************************************')
    console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***')
    console.warn('*** you can do this by editing cdk.context.json 🚀            ***')
    console.warn('****************************************************************')
    console.error('🛑 No adminEmail entered. Please try again')
    process.exit(1)
  } else {
    console.info('✅ Successfully set up adminEmail')
  }
}

export function checkServerAccessLogsUseBucketPolicy(scope: cdk.App) {
  if(scope.node.tryGetContext('@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy') !== true) {
    throw new Error("@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy is not enforced, please switch it to true in your cdk.json");
  }
}

export function checkQuicksightSetup(scope: cdk.App) {
  console.log('Logging all quicksight stuff...')
  const templateQuicksightUsername = contextTemplate['quicksightUserName']
  const quicksightUsername = scope.node.tryGetContext("quicksightUserName")
  const deployQuicksightStack = scope.node.tryGetContext("deployQuicksightStack")
  console.log(templateQuicksightUsername)
  console.log(quicksightUsername)
  console.log(deployQuicksightStack)
  if (deployQuicksightStack === true && quicksightUsername === templateQuicksightUsername) {
    console.warn('**********************************************************************************')
    console.warn(
      `⛔️ WARNING: You are seeing this message because you have set deployQuicksightStack as true but you have not followed all steps to set up Quicksight. You seem to have set your quicksightUserName as ${quicksightUsername} \n\n`
    )
    console.warn(
      `Hmmmm 🧐 this is mysteriously similar to ${templateQuicksightUsername} -- which is the default email placeholder in our context file template. This seems like a clue that you may not have updated cdk.context.json 👀👀👀👀`
    )
    console.warn('You can fix this! 🛠  Read on for directions...\n\n')
    console.warn('##################################################################################')
    console.warn('*** First follow the directions for Quicksight module setup 👇   *****************')
    console.warn('*** lib/stacks/stack-quicksight/documentation/README.md          *****************')
    console.warn('*** 🚨 Please note that you MUST follow ALL directions IN ORDER  *****************')
    console.warn('*** ###################################################          *****************')
    console.warn('*** ❓ Did you set up a Quicksight account?                      *****************')
    console.warn('*** ❓ Did you create a Quicksight user with author privileges?   *****************')
    console.warn('*** ❓ Did you accept the email invite and log in as that user?   *****************')
    console.warn('*** ❓ Did you enter the email for that user in cdk context?      *****************')
    console.warn('*** do this at cdk.context.json under quicksightUserName         *****************')
    console.warn('**********************************************************************************')
    console.error('🛑 Quicksight module enabled, but not set up. Please follow directions above and try again')
    process.exit(1)
  } else {
    console.info('✅ Successfully set up quicksightUsername')
  }
}

export function checkContextFilePresent(scope: cdk.App) {
  for (const key in contextTemplate) {
    const context = scope.node.tryGetContext(key)
    if (context === undefined) {
      console.warn('****************************************************************************************')
      console.warn(`*** ⛔️ WARNING: You must provide a valid ${key} value in cdk.context.json ******`)
      console.warn('*** ❓ Did you make a copy of cdk.context.template.json?                    ************')
      console.warn('*** ❓ Did you fill in all the required values for cdk context?             ************')
      console.warn('*** 💻 you can do this by editing cdk.context.json 🚀                       ************')
      console.warn('****************************************************************************************')
      console.error(`🛑 No ${key} entered. Please try again`)
      console.error(`🛑 You may need to copy cdk.context.template.json and rename the copied file as cdk.context.json`)
      process.exit(1)
    } else {
      console.info(`✅ Successfully defined ${key} as ${context} in context 🎉`)
    }
  }
}
