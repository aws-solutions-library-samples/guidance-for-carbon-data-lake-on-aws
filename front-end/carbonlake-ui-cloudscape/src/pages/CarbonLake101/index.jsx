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
const  CarbonLake101 = () => {
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

export default  CarbonLake101;


const Content = () => {

  return (
<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              <img src="./images/AWS_logo_RGB_REV.png" className="intro-logo" alt="bob ross picture" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                AWS CarbonLake
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
              Decarbonization measurement in the cloud.
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                AWS CarbonLake was created to help businesses more accurately and conveniently keep track of their carbon emissions.
                 {/* TODO - replace this link with external CarbonLake link/blog post when published */}
                  Click <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-quickstart/quickstart-aws-carbonlake/">here</a> to learn more.

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
            <h1>CarbonLake 101</h1>
            <Container>
              <div>
                  <p>
                  CarbonLake Quickstart is a decarbonization measurement data solution built on AWS Services. CarbonLake Quickstart
                  reduces the undifferentiated heavy lifting of ingesting, standardizing, transforming, and calculating carbon and
                  ghg emission data so that customers can build decarbonization reporting, forecasting, and analytics solutions and
                  products to drive innovation. CarbonLake includes the following purpose-built solutions:
                    <br />
                  </p>
                  <li>
                    Data Pipeline
                  </li>
                  <li>
                    Data Quality Stack
                  </li>
                  <li>
                    Data Lineage Stack
                  </li>
                  <li>
                    Calculator Engine
                  </li>
                  <li>
                    Business Intelligence Tools
                  </li>
                  <li>
                    Managed Forecasting Service
                  </li>
                  <li>
                    GraphQL API
                  </li>
                  <li>
                    Sample Web Application
                  </li>
                  <p>
                  CarbonLake data is ingested through the CarbonLake landing zone, and can be ingested from any service within or connected to the AWS cloud.
                    <br />
                  </p>

              </div>
            </Container>
          </div>
          <div>
            <h1>CarbonLake Architecture</h1>
            <Container header={<Header>Basic Architecture</Header>}>
              {/* Make this flex later. maxWidth is not mobile responsive */}
              <div>
                <img src="../../public/images/carbonlake-basic-arch.png" alt="" style={{ maxWidth : '100%', paddingRight: '2em' }} />
              </div>
              <div>
                <p>
                  This is the basic architecture for CarbonLake.
                </p>
              </div>
            </Container>
            <Container header={<Header>Detailed Architecture</Header>}>
              {/* Make this flex later. maxWidth is not mobile responsive */}
              <div>
                <img src="../../public/images/carbonlake-detailed-arch.png" alt="" style={{ maxWidth : '100%', paddingRight: '2em' }} />
              </div>
              <div>
                <p>
                  This is the detailed architecture for CarbonLake.
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
              href="https://ghgprotocol.org/Third-Party-Databases/IPCC-Emissions-Factor-Database"
              text="IPCC Emissions Factor Database"
            />
          </li>
          {/* <li>
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
          </li> */}
        </ul>
      </>
    }
  >
    <p>

      CarbonLake is referencing the public IPCC Emissions Factor Database.
    </p>
  </HelpPanel>
);




