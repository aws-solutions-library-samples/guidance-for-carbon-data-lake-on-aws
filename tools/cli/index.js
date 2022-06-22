#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import ora from "ora";
import {askAppConfig} from './lib/inquirer.js'

clear();

console.log(
  chalk.yellow(
    figlet.textSync('CarbonLake CLI', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  const spinner = ora("Getting CarbonLake CLI ready for you...").start();
  await new Promise(resolve => setTimeout(resolve, 2000));
  spinner.succeed("Ready!");
  const config = await askAppConfig();
  console.log(config);
};

run();

