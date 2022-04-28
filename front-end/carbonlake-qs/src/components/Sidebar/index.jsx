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
          { type: 'link', text: 'Dashboard', href: '#/basic' },
          { type: 'link', text: 'Service homepage', href: '#/service-home' },
          { type: 'link', text: 'Single page create', href: '#/create' },
          { type: 'link', text: 'Table view', href: '#/table' },
          {
            type: 'link',
            text: 'Table with Empty State',
            href: '#/table-empty'
          }
        ]
      },
      { type: "link", text: "Dashboard", href: "#/" },

    ]}
    activeHref="#/"
    />
    </>
  )
  }

  export default Sidebar;
