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

const CarbonLake101 = () => {
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

export default CarbonLake101;


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
                  Click <Link to={{ pathname: "/about-carbonlake"}}  target="_blank">here</Link> to learn more.
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
            <h1>Benefits and features</h1>
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
                      <a href="https://polaris.corp.amazon.com/system/structures/components/awsui-app-layout/">
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
                      <a href="https://polaris.corp.amazon.com/system/flows/service_homepage/">service homepage</a>,
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
                      <a href="https://polaris.corp.amazon.com/system/flows/create/single_page_create/">
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
                      A working <a href="https://polaris.corp.amazon.com/system/flows/view/table_view/">table view</a>{' '}
                      example, containing components such as: Table (with features like wrap lines, sorting, and
                      selection), Flashbar, Header, Button, Collection preferences, Pagination, Text filter, Icon, and
                      more.
                    </li>
                  </ul>
                </ol>
              </div>
            </Container>
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}

<HelpTools/>

