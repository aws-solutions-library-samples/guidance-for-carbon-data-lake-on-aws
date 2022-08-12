import { commandInput } from './command.js'
import chalk from 'chalk'
import inquirer from 'inquirer'

export async function launchConfiguration() {
  const answers = await inquirer.prompt([
    {
      name: 'appName',
      type: 'input',
      message: 'Enter a name for your CarbonLake Application (you can change this later):',
      validate: function (value) {
        if (value.length) {
          return true
        } else {
          return 'Please enter an application name'
        }
      },
    },
    {
      name: 'adminEmail',
      type: 'email',
      message: 'Enter the email address for the application admin:',
      validate: function (answer) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(answer)) {
          return 'You have to provide a valid email address!'
        }
        return true
      },
    },
    {
      type: 'checkbox',
      name: 'optionalModules',
      message: 'Select the optional CarbonLake modules you wish to deploy:',
      choices: optionalModules,
      default: [],
    },
  ])
  console.log(chalk.greenBright('Got it! Getting ready to deploy those modules 🥳'))

  return answers

  console.log(
    chalk.greenBright(
      'Now we are going to use your AWS credentials to set up docker registry access. You will need this to build assets like the dependencies used for lambda functions.'
    )
  )
  await commandInput(
    'aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws'
  )
  console.log('✅ Success! Configured Docker Registry')

  // Bootstrap the CDK
  console.log(
    'Now it is time to bootstrap the CDK environment. This basically means you are creating all the resources needed to make changes to your CDK deployment and stacks in your account.\nWe will get this from your configured AWS credentials.'
  )
  await commandInput('AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)')

  await commandInput('cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION')
  await console.log('✅ Success! Bootstrapped the cdk environment!')

  return configuration
}
