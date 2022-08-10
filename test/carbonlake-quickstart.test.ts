import { App } from 'aws-cdk-lib'
import { Template, Match } from 'aws-cdk-lib/assertions'
import { CarbonlakeQuickstartStack } from '../lib/carbonlake-qs-stack'

test('Snapshot', () => {
  const app = new App()
  const stack = new CarbonlakeQuickstartStack(app, 'test')
  //Add your own required test outputs here
  const template = Template.fromStack(stack)
  template.hasOutput('APIURL', Match.objectLike({})) // Check to make sure the APIURL is output
  template.hasOutput('password', Match.objectLike({})) // Check to make sure there is password ouput
  template.hasOutput('WebAppUrl', Match.objectLike({})) // Check to make sure the web app outputs a url
  template.hasOutput('S3LandingZoneInputBucketARN', Match.objectLike({})) // Check to make sure the S3 landing zone bucket input ARN is output
  template.resourceCountIs('AWS::CloudFormation::Stack', 5)
})
