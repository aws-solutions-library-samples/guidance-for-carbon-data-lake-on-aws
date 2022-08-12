import React from 'react';
import { useState } from 'react';
import { TopNavigation } from '@cloudscape-design/components';

// Company logo. Upload your own logo and point to it to change this in the TopNavigation.
import logo from '../../../public/images/AWS_logo_RGB_REV.png'

// Styles
import '../../styles/top-navigation.scss';

// Amplify
import Amplify, { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import {existingAPI, existingAuth} from '../../amplify-config';
Amplify.configure(existingAuth)
Amplify.configure(existingAPI)



const TopNavigationHeader = ({signOut, user}) => {
  // Authenticated user details. These will changed once cognito is connected, but objects will still need to be interpolated
  const appUser = {
    userName: 'novekm',
    // Pull in logged in user attributes from cognito user pool
    fullName: `${user.attributes.given_name} ${user.attributes.family_name}`|| 'Default',
    userEmail: `${user.attributes.email}`,
  };
  console.log(`${user.attributes.email}`)
  console.log(`${user.attributes.given_name}`)
  // console.log (json.stringify(user.attributes))
  return (
    <div id="h">
    <TopNavigation
      identity={{
        href: "/",
        // Your Company Name
        title: `CarbonLake Quickstart`,
        logo: {
          src:
          logo,
          alt: "Service"
        }
      }}
      utilities={[
        {
          type: "button",
          text: "AWS",
          href: "https://aws.amazon.com/",
          external: true,
          externalIconAriaLabel: " (opens in a new tab)"
        },
        {
          type: "button",
          iconName: "notification",
          title: "Notifications",
          ariaLabel: "Notifications (unread)",
          badge: true,
          disableUtilityCollapse: false
        },
        {
          type: "menu-dropdown",
          iconName: "settings",
          ariaLabel: "Settings",
          title: "Settings",
          items: [
            {
              id: "settings-org",
              text: "Organizational settings"
            },
            {
              id: "settings-project",
              text: "Project settings"
            }
          ]
        },
        {
          type: "menu-dropdown",
          text: `${appUser.fullName}`,
          description: `${appUser.userEmail}`,
          iconName: "user-profile",
          items: [
            { id: "profile", text: "Profile" },
            { id: "preferences", text: "Preferences" },
            { id: "security", text: "Security" },
            {
              id: "support-group",
              text: "Support",
              items: [
                {
                  id: "documentation",
                  text: "Documentation",
                  //TODO - Replace this with link to our GitHub docs
                  href: "https://github.com/aws-quickstart/quickstart-aws-carbonlake",
                  external: true,
                  externalIconAriaLabel:
                  " (opens in new tab)"
                },
                { id: "support", text: "Support" },
                {
                  id: "feedback",
                  text: "Feedback",
                  //TODO - Replace this with link to our GitHub feedback mechanism
                  href: "https://github.com/aws-quickstart/quickstart-aws-carbonlake",
                  external: true,
                  externalIconAriaLabel:
                  " (opens in new tab)"
                }
              ]
            },
            // TODO - Make Sign out button work using existing signOut function onClick
            { id: "signout", text: <span onClick = {signOut}>Sign out </span> }

          ]
        }
      ]}
      i18nStrings={{
        // searchIconAriaLabel: "Search",
        // searchDismissIconAriaLabel: "Close search",
        overflowMenuTriggerText: "More",
        // overflowMenuTitleText: "All",
        // overflowMenuBackIconAriaLabel: "Back",
        // overflowMenuDismissIconAriaLabel: "Close menu"
      }}
      />
      </div>
  )
}

export default withAuthenticator(TopNavigationHeader);
