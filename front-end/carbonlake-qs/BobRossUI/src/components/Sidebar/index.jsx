// const Sidebar = () => (
  // <SideNavigation
  //   header={{ text: 'AWS CarbonLake', href: '#/' }}
  //   items={[
  //     {
  //       type: 'section',
  //       text: 'CarbonLake',
  //       expanded: true,
  //       items: [
  //         { type: 'link', text: 'How to use the CarbonLake App', href: '#/' },
  //         { type: 'link', text: 'Dashboard', href: '#/basic' },
  //         { type: 'link', text: 'Service homepage', href: '#/service-home' },
  //         { type: 'link', text: 'Single page create', href: '#/create' },
  //         { type: 'link', text: 'Table view', href: '#/table' },
  //         {
  //           type: 'link',
  //           text: 'Table with Empty State',
  //           href: '#/table-empty'
  //         }
  //       ]
  //     },
  //     {
  //       type: 'section',
  //       text: 'Dashboard',
  //       expanded: true,
  //       items: [
  //         { type: 'link', text: 'How to use the CarbonLake App', href: '#/' },
  //         { type: 'link', text: 'Dashboard', href: '#/basic' },
  //         { type: 'link', text: 'Service homepage', href: '#/service-home' },
  //         { type: 'link', text: 'Single page create', href: '#/create' },
  //         { type: 'link', text: 'Table view', href: '#/table' },
  //         {
  //           type: 'link',
  //           text: 'Table with Empty State',
  //           href: '#/table-empty'
  //         }
  //       ]
  //     },
  //   ]}
  //   activeHref="#/"
//   />
// );

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
          { type: 'link', text: 'How to use the CarbonLake App', href: '#/' },
        ]
      },
      {
        type: 'section',
        text: 'Admin',
        expanded: true,
        items: [
          { type: 'link', text: 'Users', href: '#/' },
          { type: 'link', text: 'Groups', href: '#/basic' },
          { type: 'link', text: 'Edit App', href: '#/service-home' },
        ]
      },
      { type: "link", text: "Dashboard", href: "#/" },
      {
        type: 'section',
        text: 'Account',
        expanded: true,
        items: [
          { type: 'link', text: 'Settings', href: '#/' },
          { type: 'link', text: 'Logout', href: '#/basic' },
        ]
      },
      {
        type: 'section',
        text: 'Carbon Explorer',
        expanded: true,
        items: [
          { type: 'link', text: 'Upload', href: '#/' },
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

    ]}
    activeHref="#/"
    />
    </>
  )
  }

  export default Sidebar;
