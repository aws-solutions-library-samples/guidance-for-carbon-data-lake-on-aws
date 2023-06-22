"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubActionsAwsAuthCdkStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class GithubActionsAwsAuthCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const githubDomain = 'token.actions.githubusercontent.com';
        const githubProvider = new aws_cdk_lib_1.aws_iam.OpenIdConnectProvider(this, 'GithubActionsProvider', {
            url: githubDomain,
            clientIds: ['sts.amazonaws.com'],
        });
        const iamRepoDeployAccess = props.repositoryConfig.map(r => `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`);
        const conditions = {
            StringLike: {
                [`${githubDomain}:sub`]: iamRepoDeployAccess,
            },
        };
        const role = new aws_cdk_lib_1.aws_iam.Role(this, 'gitHubDeployRole', {
            assumedBy: new aws_cdk_lib_1.aws_iam.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, conditions),
            managedPolicies: [aws_cdk_lib_1.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
            roleName: 'githubActionsDeployRole',
            description: 'This role is used via GitHub Actions to deploy with AWS CDK or Terraform on the target AWS account',
            maxSessionDuration: cdk.Duration.hours(1),
        });
        new cdk.CfnOutput(this, 'GithubActionOidcIamRoleArn', {
            value: role.roleArn,
            description: `Arn for AWS IAM role with Github oidc auth for ${iamRepoDeployAccess}`,
            exportName: 'GithubActionOidcIamRoleArn',
        });
        cdk.Tags.of(this).add('component', 'CdkGithubActionsOidcIamRole');
    }
}
exports.GithubActionsAwsAuthCdkStack = GithubActionsAwsAuthCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLWFjdGlvbnMtYXdzLWF1dGgtY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2l0aHViLWFjdGlvbnMtYXdzLWF1dGgtY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFrQztBQUVsQyw2Q0FBNEM7QUFNNUMsTUFBYSw0QkFBNkIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN6RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdDO1FBQ2hGLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBRXZCLE1BQU0sWUFBWSxHQUFHLHFDQUFxQyxDQUFBO1FBRTFELE1BQU0sY0FBYyxHQUFHLElBQUkscUJBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDbEYsR0FBRyxFQUFFLFlBQVk7WUFDakIsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUM7U0FDakMsQ0FBQyxDQUFBO1FBRUYsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBRTNHLE1BQU0sVUFBVSxHQUFtQjtZQUNqQyxVQUFVLEVBQUU7Z0JBQ1YsQ0FBQyxHQUFHLFlBQVksTUFBTSxDQUFDLEVBQUUsbUJBQW1CO2FBQzdDO1NBQ0YsQ0FBQTtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUkscUJBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ2xELFNBQVMsRUFBRSxJQUFJLHFCQUFHLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHdCQUF3QixFQUFFLFVBQVUsQ0FBQztZQUM1RixlQUFlLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3BGLFFBQVEsRUFBRSx5QkFBeUI7WUFDbkMsV0FBVyxFQUFFLG9HQUFvRztZQUNqSCxrQkFBa0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDMUMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSw0QkFBNEIsRUFBRTtZQUNwRCxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsV0FBVyxFQUFFLGtEQUFrRCxtQkFBbUIsRUFBRTtZQUNwRixVQUFVLEVBQUUsNEJBQTRCO1NBQ3pDLENBQUMsQ0FBQTtRQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsNkJBQTZCLENBQUMsQ0FBQTtJQUNuRSxDQUFDO0NBQ0Y7QUFuQ0Qsb0VBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cydcbmltcG9ydCB7IGF3c19pYW0gYXMgaWFtIH0gZnJvbSAnYXdzLWNkay1saWInXG5cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQWN0aW9uc0F3c0F1dGhDZGtTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSByZXBvc2l0b3J5Q29uZmlnOiB7IG93bmVyOiBzdHJpbmc7IHJlcG86IHN0cmluZzsgZmlsdGVyPzogc3RyaW5nIH1bXVxufVxuXG5leHBvcnQgY2xhc3MgR2l0aHViQWN0aW9uc0F3c0F1dGhDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHaXRodWJBY3Rpb25zQXdzQXV0aENka1N0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKVxuXG4gICAgY29uc3QgZ2l0aHViRG9tYWluID0gJ3Rva2VuLmFjdGlvbnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tJ1xuXG4gICAgY29uc3QgZ2l0aHViUHJvdmlkZXIgPSBuZXcgaWFtLk9wZW5JZENvbm5lY3RQcm92aWRlcih0aGlzLCAnR2l0aHViQWN0aW9uc1Byb3ZpZGVyJywge1xuICAgICAgdXJsOiBnaXRodWJEb21haW4sXG4gICAgICBjbGllbnRJZHM6IFsnc3RzLmFtYXpvbmF3cy5jb20nXSxcbiAgICB9KVxuXG4gICAgY29uc3QgaWFtUmVwb0RlcGxveUFjY2VzcyA9IHByb3BzLnJlcG9zaXRvcnlDb25maWcubWFwKHIgPT4gYHJlcG86JHtyLm93bmVyfS8ke3IucmVwb306JHtyLmZpbHRlciA/PyAnKid9YClcblxuICAgIGNvbnN0IGNvbmRpdGlvbnM6IGlhbS5Db25kaXRpb25zID0ge1xuICAgICAgU3RyaW5nTGlrZToge1xuICAgICAgICBbYCR7Z2l0aHViRG9tYWlufTpzdWJgXTogaWFtUmVwb0RlcGxveUFjY2VzcyxcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnZ2l0SHViRGVwbG95Um9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5XZWJJZGVudGl0eVByaW5jaXBhbChnaXRodWJQcm92aWRlci5vcGVuSWRDb25uZWN0UHJvdmlkZXJBcm4sIGNvbmRpdGlvbnMpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBZG1pbmlzdHJhdG9yQWNjZXNzJyldLFxuICAgICAgcm9sZU5hbWU6ICdnaXRodWJBY3Rpb25zRGVwbG95Um9sZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgcm9sZSBpcyB1c2VkIHZpYSBHaXRIdWIgQWN0aW9ucyB0byBkZXBsb3kgd2l0aCBBV1MgQ0RLIG9yIFRlcnJhZm9ybSBvbiB0aGUgdGFyZ2V0IEFXUyBhY2NvdW50JyxcbiAgICAgIG1heFNlc3Npb25EdXJhdGlvbjogY2RrLkR1cmF0aW9uLmhvdXJzKDEpLFxuICAgIH0pXG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnR2l0aHViQWN0aW9uT2lkY0lhbVJvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogcm9sZS5yb2xlQXJuLFxuICAgICAgZGVzY3JpcHRpb246IGBBcm4gZm9yIEFXUyBJQU0gcm9sZSB3aXRoIEdpdGh1YiBvaWRjIGF1dGggZm9yICR7aWFtUmVwb0RlcGxveUFjY2Vzc31gLFxuICAgICAgZXhwb3J0TmFtZTogJ0dpdGh1YkFjdGlvbk9pZGNJYW1Sb2xlQXJuJyxcbiAgICB9KVxuXG4gICAgY2RrLlRhZ3Mub2YodGhpcykuYWRkKCdjb21wb25lbnQnLCAnQ2RrR2l0aHViQWN0aW9uc09pZGNJYW1Sb2xlJylcbiAgfVxufVxuIl19