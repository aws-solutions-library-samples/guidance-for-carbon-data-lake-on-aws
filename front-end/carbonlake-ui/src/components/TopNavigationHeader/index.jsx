

import React from 'react';
import { TopNavigation } from '@awsui/components-react';
import logo from '../../../public/images/AWS_logo_RGB_REV.png'

// Company logo. Upload your own logo and point to it to change this in the TopNavigation.
import '../../styles/top-navigation.scss';

// Authenticated user details. These will changed once cognito is connected, but objects will still need to be interpolated
const appUser = {
  userName: 'novekm',
  fullName: 'Kevon Mayers',
  userEmail: 'novekm@amazon.com',
};
const TopNavigationHeader = () => {
  return (
    <div id="h">
    <TopNavigation
      identity={{
        href: "/",
        title: "Powered by AWS CarbonLake",
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
                  href: "#",
                  external: true,
                  externalIconAriaLabel:
                  " (opens in new tab)"
                },
                { id: "support", text: "Support" },
                {
                  id: "feedback",
                  text: "Feedback",
                  href: "#",
                  external: true,
                  externalIconAriaLabel:
                  " (opens in new tab)"
                }
              ]
            },
            { id: "signout", text: "Sign out" }
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








export default TopNavigationHeader;
