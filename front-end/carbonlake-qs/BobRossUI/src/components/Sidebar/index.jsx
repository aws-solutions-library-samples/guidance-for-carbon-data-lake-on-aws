import React from 'react'
import { SideNavigation } from '@awsui/components-react';
const Sidebar = () => {
  return (
    <>
  <SideNavigation
    header={{ text: 'AWS CarbonLake', href: '#/' }}
    items={[
      {
        type: 'section',
        text: 'CarbonLake',
        expanded: true,
        items: [
          { type: 'link', text: 'How to use the CarbonLake App', href: '#/how-to-use-carbonlake-app' },
        ]
      },
      {
        type: 'section',
        text: 'Admin',
        expanded: true,
        items: [
          { type: 'link', text: 'Users', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1', target:"_blank" },
          { type: 'link', text: 'Groups', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1', target:"_blank" },
          { type: 'link', text: 'Edit App', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1', target:"_blank" },
        ]
      },
      { type: "link", text: "Dashboard", href: "#/" },
      {
        type: 'section',
        text: 'Account',
        expanded: true,
        items: [
          { type: 'link', text: 'Settings', href: '#/account-settings' },
        ]
      },
      {
        type: 'section',
        text: 'Carbon Explorer',
        expanded: true,
        items: [
          { type: 'link', text: 'CarbonLakeUploader', href: '#/carbonlake-uploader' },
          { type: 'link', text: 'Emission Records', href: '#/emission-records' },
          { type: 'link', text: 'Visualizations', href: '#/basic' },
        ]
      },
      {
        type: 'section',
        text: 'Data Quality',
        expanded: true,
        items: [
          { type: 'link', text: 'Upload Model', href: '#/' },
          { type: 'link', text: 'Metrics', href: '#/basic' },
          { type: 'link', text: 'DQ Escalations', href: '#/basic' },
        ]
      },
      { type: "link", text: "Logout", href: "#/" },

    ]}
    // activeHref="#/how-to-use-carbonlake-app"
    />
    </>
  )
  }

  export default Sidebar;
