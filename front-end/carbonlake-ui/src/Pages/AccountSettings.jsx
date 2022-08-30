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
// } from '@awsui/components-react';
} from '@cloudscape-design/components';

import '../styles/intro.scss';
import '../styles/servicehomepage.scss';

// This is not meant to be a template, rather it is the
// introduction page that you see upon loading the webserver.

const AccountSettings = () => {
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

export default AccountSettings;


const Content = () => {
  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              <img src="./images/AWS_logo_RGB_REV.png" className="intro-logo" alt="aws logo" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                AWS CarbonLake
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
                Account Settings
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                  Edit your account settings below.
                </span>
              </Box>
            </div>
          </Box>
        </Grid>
      </div>


    </TextContent>
  </div>



  )


}





<HelpTools/>


