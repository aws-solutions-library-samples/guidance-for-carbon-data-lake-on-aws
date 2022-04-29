import React from 'react'
import { Link } from 'react-router-dom';
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

const HelpTools = () => {
  return (
    <>
    <HelpPanel header={<h2>Help panel</h2>}>
      <p>For issues with the app, please submit a <Link to={{ pathname: "/submit-issue"}}  target="_blank">GitHub issue</Link>. </p>
    </HelpPanel>
    </>
  )
}

export default HelpTools
