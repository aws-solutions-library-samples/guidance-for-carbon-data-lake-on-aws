/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/

import React from 'react';
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

// TODO - Create ErrorPage page

const ErrorPage = () => {
  return (
    <>
      <AppLayout
      navigation={<Sidebar activeHref="#/" />}
      content={<Content />}
      tools={<ToolsContent />}
      headerSelector='#h'
      disableContentPaddings={true}
    />
</>
  )
}

export default ErrorPage;


const Content = () => {
  return (
    <>
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
                404
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
              Page not found.
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                You've found a 404 error page! This page is here to demonstrate how 404 errors are handled in the react router of this app. You can remove this page, since you don't need it.
                  {/* Click <Link to={{ pathname: "/about-carbonlake"}}  target="_blank">here</Link> to learn more. */}
                   <br/>
                   <br/>
                   Click <a href="/carbonlake-101">here</a> to find your way back home.
                </span>
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

    </TextContent>
  </div>
    </>

  )
}

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Error Page</h2>}
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
              href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404"
              text="HTTP Error Codes"
            />
          </li>
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
    {/* TODO - Change href to /dashboard page once it is created */}
    <p>
    You've reached this page by mistake. <a href="/carbonlake-101">Click here</a> to go home.
    </p>
  </HelpPanel>
);

