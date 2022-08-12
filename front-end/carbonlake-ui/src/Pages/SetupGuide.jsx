/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components.

************************************************************************/
import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavigationHeader from '../components/TopNavigationHeader';
import HelpTools from '../components/HelpTools';
// import { Sidebar } from '../components/Navigation/Sidebar'
import {
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  SpaceBetween
} from '@awsui/components-react';

import '../styles/intro.scss';
import '../styles/servicehomepage.scss';

// This is not meant to be a template, rather it is the
// introduction page that you see upon loading the webserver.

const SetupGuide = () => {
  return (
    <>
    <TopNavigationHeader/>




  {/* <Sidebar /> */}
    <AppLayout
    navigation={<Sidebar activeHref="#/" />}
    // navigation={<Sidebar activeHref="#/" items={navItems}/>}
    content={<Content />}
    tools={<HelpTools/>}
    headerSelector='#h'
    disableContentPaddings={true}
    // toolsHide={true}
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
            <Box margin={{ bottom: 's' }}>
              <img src="./images/AWS_logo_RGB_REV.png" className="intro-logo" alt="bob ross picture" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                AWS CarbonLake
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
              Setup Guide
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                For issues getting started, please reach out to us on our
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-quickstart/quickstart-aws-carbonlake/">GitHub Page</a>.
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
            <h1>How it works</h1>
            <Container>
              <div>
                <ol>
                  <li>
                      Navigate to the "Data Uploader" page and browse for your file.
                    <br />
                  </li>
                  <li>
                    This will upload your file to the "LANDING" S3 bucket which will trigger a pipeline to run automatically.
                    The file will be validated to ensure it conforms to the set schema, and if successful will continue down the pipeline.
                    Once finished, the file contents will be be visible in the "Emissions Records" page. To see the status as the pipeline
                    runs, view the Step Function in the AWS Console.
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

<HelpTools/>

