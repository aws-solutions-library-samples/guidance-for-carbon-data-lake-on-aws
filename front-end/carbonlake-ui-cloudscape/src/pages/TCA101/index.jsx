/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/

import React, {useState, useRef} from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../common/components/Sidebar';
import TopNavigationHeader from '../../common/components/TopNavigationHeader';

import {
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  SpaceBetween,
  Flashbar,
  Alert,
  Form,
  Button,
  Table,
  Icon
} from '@cloudscape-design/components';

import { ExternalLinkItem } from '../../common/common-components-config';

import '../../common/styles/intro.scss';
import '../../common/styles/servicehomepage.scss';
const TCA101 = () => {
  return (
    <>
    <AppLayout
    navigation={<Sidebar activeHref="#/" />}
    // navigation={<Sidebar activeHref="#/" items={navItems}/>}
    content={<Content />}
    tools={<ToolsContent />}
    headerSelector='#h'
    disableContentPaddings={true}
    // toolsHide={true}
  />
</>
  )
}

export default TCA101;


const Content = () => {

  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              {/* <img src="./images/AWS_logo_RGB_REV.pg" className="intro-logo" alt="aws-logo" /> */}
              <img src="../../public/images/AWS_logo_RGB_REV.png" className="intro-logo" alt="aws-logo" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                Amazon Transcribe Call Analytics
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
              Detailed call metrics powered by cutting-edge ML.
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                Amazon Transcribe Call Analytics is an ML-powered API for generating highly accurate
                call transcripts and extracting conversation insights to improve customer experience and agent productivity.
                This project was created to demonstrate how you can easily integrate Amazon Transcribe Call Analytics
                into a web application.
                  {/* Click <Link to={{ pathname: "/about-carbonlake"}}  target="_blank">here</Link> to learn more. */}
                   <br/>
                   <br/>
                   Click <a target="_blank" rel="noopener noreferrer" href="https://aws.amazon.com/transcribe/call-analytics/">here</a> to learn more.
                </span>
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

{/* Start How it works section */}
      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
            <h1>Amazon TCA 101</h1>
            <Container>
              <div>
                  <p>
                  Amazon TCA Quickstart is a contact center analytics tool built on AWS Services.
                  Amazon TCA Quickstart reduces the undifferentiated heavy lifting of creating ML Models,
                  API, Data Storage, Authentication, and many other items that come with leveraging
                  detailed call analytics, and integrating those in a web application.
                  <br />
                  <br />
                  This project is built with the React framework and AWS Amplify, leveraging public  <a target="_blank" rel="noopener noreferrer" href="https://cloudscape.design/">Cloudscape Design Components</a>.

                    <br />
                    <br />
                    Amazon TCA Quickstart provides the following out of the box solutions:
                  </p>
                  <li>
                    Detailed Call Analytics
                  </li>
                  <li>
                    Secure Data Storage
                  </li>
                  <li>
                    Authentication, Authorization, and Auditing
                  </li>
                  <li>
                    Amplify Application
                  </li>
                  <li>
                    GraphQL API
                  </li>
                  <li>
                    Custom Language Model Editor
                  </li>
                  <li>
                    Custom Vocabulary Editor
                  </li>
                  <p>
                  Amazon TCA data is ingested through the Amazon TCA landing zone, and can be ingested from any service within or connected to the AWS cloud.
                    <br />
                  </p>

              </div>
            </Container>
          </div>
          <div>
            <h1>Amazon TCA Architecture</h1>
            <Container header={<Header>Basic Architecture</Header>}>
              {/* Make this flex later. maxWidth is not mobile responsive */}
              <div>
                {/* Images used in Amplify apps must be in the public/images directory */}
                <img src="../../public/images/tca_qs_basic_arch_40border.png" alt="" style={{ maxWidth : '100%', paddingRight: '2em' }} />
              </div>
              <div>
                <p>
                  This is the basic architecture for Amazon TCA.
                </p>
              </div>
            </Container>
            <Container header={<Header>Detailed Architecture</Header>}>
              {/* Make this flex later. maxWidth is not mobile responsive */}
              <div>
                <img src="../../public/images/TCA_QuickStart-TCA_Advanced_Arch_SSM.png" alt="" style={{ maxWidth : '100%', paddingRight: '2em' }} />
              </div>
              <div>
                <p>
                  This is the detailed architecture for Amazon TCA.
                </p>
              </div>
            </Container>

          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}



// const Tools = [
//   <HelpPanel
//     header={<h2>CarbonLake 101</h2>}
//     footer={
//       <div>
//         <h3>
//           Learn more <Icon name="external" />
//         </h3>
//         <ul>
//           <li>
//             <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html">
//               Working with distributions
//             </a>
//           </li>
//           <li>
//             <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-returned.html">
//               Values that CloudFront displays on the console
//             </a>
//           </li>
//         </ul>
//       </div>
//     }
//   >
//     <p>
//       View your current distributions and related information such as the associated domain names, delivery methods, SSL
//       certificates, and more. To drill down even further into the details, choose the name of an individual
//       distribution.
//     </p>
//   </HelpPanel>, key = {key}
// ];

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Amazon TCA 101</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/transcribe/call-analytics/"
              text="Amazon Transcribe Call Analytics Service Page"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/transcribe/faqs/?nc=sn&loc=5"
              text="Amazon Transcribe FAQs"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://docs.aws.amazon.com/transcribe/latest/dg/custom-language-models.html"
              text="Amazon Transcribe Custom Language Models"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://docs.aws.amazon.com/transcribe/latest/dg/custom-vocabulary.html"
              text="Amazon Transcribe Custom Vocabularies"
            />
          </li>
        </ul>
      </>
    }
  >
    <p>
      This app is uses to create and manage your contact center call metrics using
      <a target="_blank" rel="noopener noreferrer" href="https://aws.amazon.com/transcribe/call-analytics/"> Amazon Transcribe Call Analytics</a>.
      Visit the <a href="/setup-guide"> setup guide</a> for information
      on how to get started.
    </p>
  </HelpPanel>
);




