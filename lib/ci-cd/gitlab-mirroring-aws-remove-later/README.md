# How to use this tool

This CFN stack wrapped in CDK deploys the necessary resources to mirror a gitlab repo to AWS Codecommit. It deploys an IAM user called `aws-gitlab-mirroring`. The CDK wrapper accepts an existing codecommit repository name as a prop and passes it as a Cloudformation stack parameter to give codecommit push permissions to the defined IAM user. It returns the repository mirroring url and the IAM username and link as outputs.

1. 