import React from 'react';
import { withRouter } from 'react-router-dom';
import { SideNavigation } from '@awsui/components-react';

// Component ServiceNavigation is the Side Navigation component that is used in BasicLayout, CreateForm, ServiceHomepage, and Table flows.
// Implement like this: <ServiceNavigation />
function ServiceNavigation(props) {
  // If the provided link is empty, do not redirect pages
  function onFollowHandler(ev) {
    ev.preventDefault();
    if (ev.detail.href) {
      props.history.push(ev.detail.href.substring(1));
    }
  }

  return (
    <SideNavigation
      header={{ text: 'CloudFront', href: '#/service-home' }}
      items={items}
      activeHref={`#${props.location.pathname}`}
      onFollow={onFollowHandler}
    />
  );
}

const items = [
  {
    type: 'section',
    text: 'Reports and analytics',
    items: [
      { type: 'link', text: 'Distributions', href: '#/table' },
      { type: 'link', text: 'Cache statistics', href: '#/basic' },
      { type: 'link', text: 'Monitoring and alarms', href: '#/table-empty' },
      { type: 'link', text: 'Popular objects', href: '' },
      { type: 'link', text: 'Top referrers', href: '' },
      { type: 'link', text: 'Usage', href: '' },
      { type: 'link', text: 'Viewers', href: '' }
    ]
  },
  {
    type: 'section',
    text: 'Private content',
    items: [
      { type: 'link', text: 'How-to guide', href: '' },
      { type: 'link', text: 'Origin access identity', href: '' }
    ]
  }
];

export default withRouter(ServiceNavigation);
