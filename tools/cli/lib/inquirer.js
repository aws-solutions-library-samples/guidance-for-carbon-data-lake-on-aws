import inquirer from 'inquirer';

export function askApplicationName() {
      const questions = [
        {
          name: 'appName',
          type: 'input',
          message: 'Enter a name for the CarbonLake Application you are building (don\'t worry...you can change this later):',
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
          validate: function(value) {
            if (value.length) {
              return true;
            } else {
              return 'Please enter your admin email address';
            }
          }
        }
      ];
      return inquirer.prompt(questions);
    };
