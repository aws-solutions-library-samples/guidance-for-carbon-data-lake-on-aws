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

const SetupGuide = () => {
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

export default SetupGuide;


const Content = () => {
  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                How it works
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

{/* Start How it works section */}
      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
            <h1>Start using the Carbon Data Lake Quickstart integrations</h1>
            <Container>
              <div>
                <ol>
                  <li>
                      Navigate to the "Data Uploader" page and browse for your file.
                    <br />
                  </li>
                  <li>
                    This will upload your file to the Carbon Data Lake Landing Zone S3 bucket which will trigger the Carbon Data Lake data pipeline.
                    The file will be validated to ensure it conforms to the data quality model for GHG protocol, and if successful will continue through extract, transform, and load in preparation for the calculator microservice.
                    Once finished, the file contents will be be visible in the <a href="/emissions-records" >Emission Records</a> page.
                    runs, view the <a target="_blank" rel="noopener noreferrer" href="https://console.aws.amazon.com/states/home?region=us-east-1" >Step Function in the AWS Console</a>.

                  </li>

                </ol>
              </div>
            </Container>
          </div>
          <div>
            {/* <h1>Benefits and features</h1>
            <Container header={<Header>Included templates</Header>}>
              <div>
                <h4>
                  There are 4 templates already provided for you in the <code>src/components</code> folder:
                </h4>
                <ol>
                  <li>
                    <Link to="/basic">Basic app layout</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/BasicLayout.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/basic</code>
                    </li>
                    <li>
                      The simplest skeleton with just the{' '}
                      <a href="example.com">
                        app layout
                      </a>{' '}
                      and breadcrumb components.
                    </li>
                  </ul>
                  <li>
                    <Link to="/service-home">Service homepage</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/ServiceHomepage.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/service-home</code>
                    </li>
                    <li>
                      A working example of a{' '}
                      <a href="example.com">service homepage</a>,
                      containing components such as: Box, Select, Container, Header, and layout elements like Column
                      layout, Grid, and SpaceBetween.
                    </li>
                  </ul>
                  <li>
                    <Link to="/create">Single page create</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/CreateForm.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/create</code>
                    </li>
                    <li>
                      A full{' '}
                      <a href="example.com">
                        single page create
                      </a>{' '}
                      form, containing components such as: Attribute editor, Button, Checkbox, Expandable section, Form,
                      Form field, Input, Multi-select, Radio group, Select, Textarea, Tiles, Header, SpaceBetween,
                      Container, Box and more.
                    </li>
                  </ul>
                  <li>
                    <Link to="/table">Table view</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/Table.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/table</code>
                    </li>
                    <li>
                      A working <a href="example.com">table view</a>{' '}
                      example, containing components such as: Table (with features like wrap lines, sorting, and
                      selection), Flashbar, Header, Button, Collection preferences, Pagination, Text filter, Icon, and
                      more.
                    </li>
                  </ul>
                </ol>
              </div>
            </Container> */}
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Setup Guide</h2>}
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
              href="https://s3.console.aws.amazon.com/s3/"
              text="Amazon S3"
            />
          </li>
        </ul>
      </>
    }
  >
    <p>
    For issues getting started, please reach out to us on our <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-quickstart/quickstart-aws-carbon-data-lake/" > GitHub Page</a>.
    </p>
  </HelpPanel>
);

