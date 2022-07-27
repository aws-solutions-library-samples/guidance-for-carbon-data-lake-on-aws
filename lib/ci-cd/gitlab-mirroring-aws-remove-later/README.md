# AWS Gitlab Mirroring to AWS Codecommit Repository

This CFN stack wrapped in CDK deploys the necessary resources to mirror a gitlab repo to AWS Codecommit. It deploys an IAM user called `aws-gitlab-mirroring`. The CDK wrapper accepts an existing codecommit repository name as a prop and passes it as a Cloudformation stack parameter to give codecommit push permissions to the defined IAM user. It returns the repository mirroring url and the IAM username and link as outputs.

## Set up Gitlab Mirroring to CodeCommit

### 1/ 

## Setup (~ 5 minutes)

This will deploy automatically when you deploy the CI/CD stack. Follow the steps below to finalize setup.
1. Once the stack is created, navigate to the CloudFormation stack `Outputs`
![](./images/screenshot_cloudformation_output.png)
2. Open the link in a new window next to `IAMUserDetails` (this will open up the IAM user's details, security credentials tab)
Right tab:
![](./images/screenshot_iam_tab.png)
Right section:
![](./images/screenshot_iam_section.png)
Generate Credentials:
![](./images/screenshot_iam_password.png)
6. Click on `HTTPS Git credentials for AWS CodeCommit -> Generate credentials` for the IAM user and leave the modal open. You will need the password later 
7. In a new window, open up your [Gitlab](https://gitlab.aws.dev/) repository and navigate to `Settings -> Repository`
![](./images/screenshot_gitlab_menu_section.png)
8. In Gitlab, expand the `Mirroring repositories` section and fill it out the following way:
![](./images/screenshot_gitlab_form.png)
    1. Git repository URL should be the `GitRepositoryURL` from the outputs of your CloudFormation file
    2. Mirror direction: `Push`
    3. Authentication method: `Password`
    4. Password: Insert the password in from step 6. _(If you need to regenerate the password, you will need to remove the old one first OR change the username, aka the text before the @ characheter, in the Git repository URL according the new username)_
9. Once added, click on the Refresh/Update now button next to the name of the repository.
![](./images/screenshot_gitlab_refresh.png)
10. Go back to codecommit in your account and check to make sure the gitlab repo is mirroring
11. Now go to codepipeline and release changes into your pipeline. The pipeline should now run using your defined branch as the source.
