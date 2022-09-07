import React from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import  { SideNavigation,  Badge } from '@cloudscape-design/components';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
  <SideNavigation

    activeHref={location.pathname}
    header={{ text: 'AWS CarbonLake', href: '/' }}
    onFollow={event => {
      if (!event.detail.external) {
        event.preventDefault();
        // setActiveHref(event.detail.href);
        navigate(event.detail.href);

      }
    }}
    items={[
      // { type: "link", text: "Dashboard", href: "/" },
      {
        type: 'section',
        text: 'Getting Started',
        expanded: true,
        items: [
          { type: 'link', text: 'Get Started', href: '/get-started' },
          { type: 'link', text: 'Setup Guide', href: '/setup-guide' },
        ]
      },
      {
        type: 'section',
        text: 'Admin',
        expanded: true,
        items: [
          { type: 'link', text: 'Users', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1', external: true},
          { type: 'link', text: 'Groups', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1',  external: true },
          { type: 'link', text: 'Edit App', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1',  external: true },
        ]
      },
      // {
      //   type: 'section',
      //   text: 'Account',
      //   expanded: true,
      //   items: [
      //     { type: 'link', text: 'Settings', href: '/account-settings' },
      //   ]
      // },
      {
        type: 'section',
        text: 'Data Explorer',
        expanded: true,
        items: [
          { type: 'link', text: 'Emission Records', href: '/emissions-records' },
          { type: 'link', text: 'Data Uploader', href: '/data-uploader' },
        ]
      },
      // Example of notifications in sidebar, uncomment this if not needed
      {
        type: "link",
        text: "Notifications",
        href: "#/notifications",
        info: <Badge color="red">8</Badge>
      },
      {
        type: "link",
        text: "Documentation",
        href: "https://github.com/aws-quickstart/quickstart-aws-carbonlake",
        external: true
      }


    ]}

    />
    </>
  )
  }

  export default Sidebar;
