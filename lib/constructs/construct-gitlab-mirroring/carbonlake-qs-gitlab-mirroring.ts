import { Construct } from 'constructs';
import { aws_iam as iam, CfnOutput } from 'aws-cdk-lib';
import { aws_codecommit as codecommit } from 'aws-cdk-lib';

interface CarbonlakeGitlabMirroringProps {
  repoName: string;
  iamUserName: string;
  awsRegion: string;
  awsAccountId: string;
}

export class CLQSGitlabMirror extends Construct {
  constructor(scope: Construct, id: string, props: CarbonlakeGitlabMirroringProps) {
    super(scope, id)

        new iam.CfnUser(this, 'IAMUser', {
            userName: props.iamUserName,
            path: "/",
            policies: [
              {
                "policyName": `${props.iamUserName}-iam-user-policy`,
                "policyDocument": {
                  "version": "2012-10-17",
                  "statement": [
                    {
                      "effect": "Allow",
                      "action": [
                        "codecommit:GitPull",
                        "codecommit:GitPush"
                      ],
                      "resource": [
                        `arn:aws:codecommit:${props.awsRegion}:${props.awsAccountId}:${props.repoName}`
                      ]
                    }
                  ]
                }
              }
            ],
        });
        
        new codecommit.CfnRepository(this, 'CodeCommitRepository', {
            repositoryDescription: "Mirrored repository from AWS Gitlab.",
            repositoryName: props.repoName,
        });

        new CfnOutput(this, 'GitlabMirroringUserDetails', 
        { 
          value: `https://console.aws.amazon.com/iam/home?region=${props.awsRegion}#/users/${props.iamUserName}?section=security_credentials`,
          description: "URL of the page where you should create the HTTPS Git credentials for AWS CodeCommit"
        });

        new CfnOutput(this, 'GitRepositoryURL', 
        { 
          value: `https://${props.iamUserName}-at-${props.awsAccountId}@git-codecommit.${props.awsRegion}.amazonaws.com/v1/repos/${props.repoName}`,
          description: "URL for Gitlab. The username (the part before the @ character) might need to be changed. Please, check it when you create the user in the next step"
        });
    }
}
