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
// } from '@awsui/components-react';
} from '@cloudscape-design/components';

const HelpTools = () => {
  return (
    <>
    <HelpPanel header={<h2>Help panel</h2>}>
      <p>For issues with the app, please submit a <a target="_blank" rel="noopener noreferrer" href="https://github.com/aws-quickstart/quickstart-aws-carbonlake/issues/new">GitHub issue</a>. </p>

    </HelpPanel>
    </>
  )
}

export default HelpTools
