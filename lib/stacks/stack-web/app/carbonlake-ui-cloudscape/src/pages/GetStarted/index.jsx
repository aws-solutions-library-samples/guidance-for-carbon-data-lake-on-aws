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
const  GetStarted = () => {
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

export default  GetStarted;


const Content = () => {

  return (
<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                Sample Web Application
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                This AWS Amplify web application is a working sample component of <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-quickstart/quickstart-aws-carbonlake/">CarbonLake Quickstart</a>

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
            <Container>
              <div>
              <h1>Get Started</h1>
                  <p>
                    Welcome to the CarbonLake Quickstart sample web application. This application demonstrates some features and functionalities of CarbonLake in a web interface while also giving you a starter to develop your own application. You will notice that some elements of the application are not fully built out. We put them there as examples and so that you can make the application your own. This web application was built using AWS Amplify, Cloudscape Design System, and React. The application consists of starter integrations, and sample components to be customized. Read on to learn more.
                  </p>
                  <h2>Starter Integrations</h2>
                  <p>The starter integrations in this application show how you can integrate CarbonLake Quickstart backend resources with a web application.</p>
                  <li>
                    Data Explorer - Emissions Records: This component demonstrates the use of dynamic tables with integrated serverless GraphQL API backends. This table connects to the CarbonLake Quickstart GraphQL API, authenticated with Amazon Cognito, and dynamically updates emissions records.
                  </li>
                  <li>
                    Data Explorer - Data Uploader: This component demonstrates serverless integration with Amazon S3. This file uploader component uploads to the CarbonLake Landing Zone to trigger the CarbonLake data pipeline.
                  </li>
                  <h2>Sample Components</h2>
                  <p>This application also includes several sample front-end components to demonstrate the Cloudscape Design System features and give you additional starter code. You will notice that some features do not dynamically update, such as the notification count. We put it there as an example and we invite you to make it your own.</p>
                  <li>
                    Left Navigation Drawer: This component demonstrates the built-in navigation functionality of Cloudscape Design System and 
                  </li>
                  <li>
                    Right Info Drawer: Add informational prompts or companion links to each page by customizing this component.
                  </li>
                  <li>
                    Notification Counter: Integrate with notifications to dynamically update users.
                  </li>
                  <li>
                    Settings Menu: Build your own settings pages to customize your application.
                  </li>
                  <li>
                    User Dropdown: Build your own user management pages to customize the user experience.
                  </li>
                 
              </div>
            </Container>
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}


export const ToolsContent = () => (
  <HelpPanel
    header={<h2>AWS CarbonLake Quickstart</h2>}
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
              href="https://aws.amazon.com/energy/"
              text="AWS Energy & Utilities"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/"
              text="GHG Protocol Guidance"
            />
          </li>
        <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/Third-Party-Databases/IPCC-Emissions-Factor-Database"
              text="IPCC Emissions Factor Database"
            />
          </li>
        </ul>
      </>
    }
  >
    <p>

      CarbonLake is referencing the public IPCC Emissions Factor Database.
    </p>
  </HelpPanel>
);




