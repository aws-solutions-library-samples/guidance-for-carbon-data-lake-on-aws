#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import ora from "ora";
import {askApplicationName} from './lib/inquirer.js'

clear();

console.log(
  chalk.yellow(
    figlet.textSync('CarbonLake CLI', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  const spinner = ora("Getting stuff you asked for...").start();
  spinner.succeed("Ready!");
  const config = await askApplicationName();
  console.log(config);
};

run();

