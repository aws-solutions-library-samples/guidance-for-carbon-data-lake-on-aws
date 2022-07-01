import inquirer from 'inquirer';
import chalk from "chalk";

const optionalModules = ['CarbonLake Quickstart Module', 'CarbonLake Forecast Module', 'CarbonLake Web Application Module', 'CarbonLake CI/CD Pipeline']

export async function askName() {
  const answers = await inquirer.prompt({
    name: 'user_name',
    type: 'input',
    message: 'What is your name?',
    default() {
      return 'CarbonLake User';
    }
  });
  return answers.user_name;
}

export async function askApplicationParameters() {
      const answers = await inquirer.prompt([{
          name: 'appName',
          type: 'input',
          message: 'Enter a name for your CarbonLake Application (you can change this later):',
          validate: function( value ) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter an application name';
            }
          }
        },
        {
          name: 'adminEmail',
          type: 'email',
          message: 'Enter the email address for the application admin:',
          validate: function(answer) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if(!emailRegex.test(answer)) {
                return "You have to provide a valid email address!"
            }
            return true
        }
        },
        {
          type: 'checkbox',
          name: 'optionalModules',
          message: 'Select the optional CarbonLake modules you wish to deploy:',
          choices: optionalModules,
          default: []
        }]);
        let output = answers;
        console.log(output);
        console.log(chalk.greenBright("Got it! Getting ready to deploy those modules 🥳"))

        return output;
    };
