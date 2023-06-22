#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const github_actions_aws_auth_cdk_stack_1 = require("../lib/github-actions-aws-auth-cdk-stack");
const app = new cdk.App();
new github_actions_aws_auth_cdk_stack_1.GithubActionsAwsAuthCdkStack(app, 'GithubActionsAwsAuthCdkStack', {
    repositoryConfig: [
        {
            owner: 'aws-solutions-library',
            repo: 'aws-cdl',
            filter: 'main',
        },
    ],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLWFjdGlvbnMtYXdzLWF1dGgtY2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2l0aHViLWFjdGlvbnMtYXdzLWF1dGgtY2RrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFvQztBQUNwQyxtQ0FBa0M7QUFDbEMsZ0dBQXVGO0FBRXZGLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBRXpCLElBQUksZ0VBQTRCLENBQUMsR0FBRyxFQUFFLDhCQUE4QixFQUFFO0lBQ3BFLGdCQUFnQixFQUFFO1FBQ2hCO1lBQ0UsS0FBSyxFQUFFLHVCQUF1QjtZQUM5QixJQUFJLEVBQUUsU0FBUztZQUNmLE1BQU0sRUFBRSxNQUFNO1NBQ2Y7S0FDRjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJ1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgR2l0aHViQWN0aW9uc0F3c0F1dGhDZGtTdGFjayB9IGZyb20gJy4uL2xpYi9naXRodWItYWN0aW9ucy1hd3MtYXV0aC1jZGstc3RhY2snXG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKClcblxubmV3IEdpdGh1YkFjdGlvbnNBd3NBdXRoQ2RrU3RhY2soYXBwLCAnR2l0aHViQWN0aW9uc0F3c0F1dGhDZGtTdGFjaycsIHtcbiAgcmVwb3NpdG9yeUNvbmZpZzogW1xuICAgIHtcbiAgICAgIG93bmVyOiAnYXdzLXNvbHV0aW9ucy1saWJyYXJ5JyxcbiAgICAgIHJlcG86ICdhd3MtY2RsJyxcbiAgICAgIGZpbHRlcjogJ21haW4nLFxuICAgIH0sXG4gIF0sXG59KVxuIl19