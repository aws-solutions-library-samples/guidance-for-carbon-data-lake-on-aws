import inquirer from 'inquirer';

export function askAppConfig() {
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
        },
        {
            name: 'repoName',
            type: 'input',
            message: 'Enter the name you would like to use for the repository launched for CI/CD:',
            validate: function(value) {
              if (value.length) {
                return true;
              } else {
                return 'Please enter a repository name!';
              }
            }
          }
      ];
      return inquirer.prompt(questions);
    };
