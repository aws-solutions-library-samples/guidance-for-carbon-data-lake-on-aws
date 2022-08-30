import React from 'react'
import { useState } from 'react'
// import { SideNavigation } from '@awsui/components-react';
import { SideNavigation } from '@cloudscape-design/components';
const Sidebar = () => {
  const [activeHref, setActiveHref] = useState('/');
  return (
    <>
  <SideNavigation
  // TODO - Make active link work for navigation
    activeHref={activeHref}
    header={{ text: 'Amazon TCA', href: '/' }}
    // onFollow={event => {
    //   if (!event.detail.external) {
    //     event.preventDefault();
    //     setActiveHref(event.detail.href);
    //   }
    // }}
    items={[
      // { type: "link", text: "Dashboard", href: "/" },
      {
        type: 'section',
        text: 'Getting Started',
        expanded: true,
        items: [
          { type: 'link', text: 'TCA 101', href: '/tca-101' },
          { type: 'link', text: 'Setup Guide', href: '/setup-guide' },
          { type: 'link', text: 'Case Studies', href: '/case-studies' },
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
          { type: 'link', text: 'TCA Jobs', href: '/tca-jobs' },
          { type: 'link', text: 'Data Uploader', href: '/data-uploader' },
          { type: 'link', text: 'CLM Uploader', href: '/custom-language-model-uploader' },
          { type: 'link', text: 'CV Uploader', href: '/custom-vocabulary-uploader' },
          // { type: 'link', text: 'Decarb Intelligence', href: '/decarb-intelligence' },
          // { type: 'link', text: 'Visualizations', href: '/visualizations' },
        ]
      },
      // {
      //   type: 'section',
      //   text: 'Data Quality',
      //   expanded: true,
      //   items: [
      //     { type: 'link', text: 'Metrics', href: '/metrics' },
      //     { type: 'link', text: 'Model Editor', href: '/model-editor' },
      //     { type: 'link', text: 'Alerts', href: '/dq-alerts' },
      //   ]
      // },
      // {
      //   type: 'section',
      //   text: 'Forecasting',
      //   expanded: true,
      //   items: [
      //     { type: 'link', text: 'Models', href: '/forecasting-models' },
      //     { type: 'link', text: 'Training', href: '/forecasting-model-training' },
      //   ]
      // },
      // {
      //   type: 'section',
      //   text: 'Data Exchange',
      //   expanded: true,
      //   items: [
      //     { type: 'link', text: 'AWS Data Exchange', href: '/aws-data-exchange' },
      //     { type: 'link', text: 'ASDI', href: '/asdi' },
      //     { type: 'link', text: 'Data Marketplace', href: '/data-marketplace' },
      //   ]
      // },
      // { type: "link", text: "Logout", href: "/" },

    ]}
    // activeHref="#/carbonlake-101"
    />
    </>
  )
  }

  export default Sidebar;
