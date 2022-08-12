#!/usr/bin/env node
import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import clear from 'clear'
import figlet from 'figlet'
import ora from 'ora'
import { askApplicationParameters, askName } from './lib/setup.js'
import fs from 'fs'
import { checkDependencies, checkQuicksight, installDependencies } from './lib/dependencies.js'
import { createConfiguration } from './lib/configure.js'
import { commandInput } from './lib/command.js'

//clear whole command line before initiating CLI
clear()

// sleep function for use in CLI
const sleep = (delay = 2000) => new Promise(resolve => setTimeout(resolve, delay))

// log the title of the CLI to the console
console.log(chalk.cyanBright(figlet.textSync('CarbonLake CLI', { horizontalLayout: 'full' })))

let userName

async function welcome(userName) {
  const rainbowWelcome = chalkAnimation.rainbow(
    `👋 Welcome ${userName}! Time get started building with AWS CarbonLake Quickstart 🛠`
  )
  await sleep(3000)
  rainbowWelcome.stop()
}

// run the full CLI workflow and output key parameters to context file
const run = async () => {
  const startSpinner = ora('Getting CarbonLake CLI ready...').start()
  await sleep(2000)
  startSpinner.succeed('Ready!')
  let userName = await askName()
  await welcome(userName)
  // ask for the application parameters required for setup
  const setup = await askApplicationParameters()

  // check for manually installed dependencies
  const dependencies = await checkDependencies()

  // install all required dependencies via npm
  await installDependencies()

  // TODO --> Ask for optional setup parameters for Quickstart

  // TODO --> Ask for optional setup parameters for Amplify Web Application

  // use info from CLI to create configuration files
  const configuration = await createConfiguration(setup.optionalModules)
  let launch = {
    ...setup,
    ...dependencies,
    ...configuration,
  }
  const data = JSON.stringify(launch)
  const writeContextSpinner = ora('Saving your context file!').start()
  try {
    fs.writeFile('../../cdk.contexttest.json', data, err => {
      if (err) {
        throw err
      }
    })
  } finally {
    writeContextSpinner.stop()
    console.log('Configuration is saved as cdk.context.json')
  }
  const configCheckSpinner = ora('Checking to make sure that your configuration is complete...').start()
  await sleep(3000)
  configCheckSpinner.succeed("Got it! Now let's deploy your app!")

  // TODO --> Change to quickstart main directory
  await commandInput('cd ../../')

  // TODO --> Bootstrap CDK

  // TODO --> Deploy CDK
}

run()
