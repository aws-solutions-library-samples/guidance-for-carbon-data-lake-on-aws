import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// Icons
import {
  BiWrench,
  BiHome,
  BiChat,
  BiUser,
  BiGroup,
  BiPalette,
  BiBookmark,
  BiSupport,
  BiMessageAltDetail,
  BiAlarmExclamation,
  BiBarChartSquare,
  BiCog,
  BiPlay,
  BiNotepad,
  BiPlus,
  BiLogOut,
  BiChevronDown,
} from "react-icons/bi";

// Styled Components
import {
  NavLinksContainer,
  NavLinksSection,
  NavLinksSubtitle
} from './NavLinks.styles';
import {
  DropDownContainer,
  DropDownLink,
  DropDownIcon,
  DropDownName,
  DropDownChevron,
  DropDownCollapseContainer,
  DropDownCollapseContent,
  DropDownCollapseWrapper,
  DropDownCollapseIcon,
  DropDownCollapseItem
} from './DropDown/DropDown.styles'
import {
  StandardContainer,
  StandardLink,
  StandardIcon,
  StandardName
} from './Standard/Standard.styles'
// import {
//   UserLogoutContainer,
//   UserLogoutWrapper,
//   UserLogoutLink,
//   UserLogoutIcon,
//   UserLogoutName
// } from './UserLogout/UserLogout.styles'

// AMPLIFY
import { Amplify } from 'aws-amplify';
  // Allows for app to run with Amplify Authentication
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '../../../aws-exports';
Amplify.configure(awsExports);

const NavLinks = ({ signOut, user }) => {
  let navigate = useNavigate();
  let { username } = useParams()
  return (
  <>
  <NavLinksContainer>
  {/* ========PROFILE SECTION COMPONENTS======== */}
      <NavLinksSection id="Profile">
                <NavLinksSubtitle>
                  Profile
                </NavLinksSubtitle>

  {/* TODO - write logic to only show this component if logged in user has 'admin' role */}
  {/* ----Admin---- */}
        <DropDownContainer id="Admin">
            <DropDownLink id='Admin'>
                <DropDownIcon>
                <BiWrench />
                </DropDownIcon>
                <DropDownName>
                    Admin
                </DropDownName>
                <DropDownChevron>
                    <BiChevronDown />
                </DropDownChevron>
          </DropDownLink>
        <DropDownCollapseContainer>
              <DropDownCollapseContent>
                  <DropDownCollapseWrapper onClick={() => {window.open('https://console.aws.amazon.com/cognito/','_blank')}}>
                      <DropDownCollapseIcon>
                        <BiUser />
                      </DropDownCollapseIcon>
                        <DropDownCollapseItem id='users'>
                          Users
                        </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper onClick={() => {window.open('https://console.aws.amazon.com/cognito/','_blank')}}>
                      <DropDownCollapseIcon>
                        <BiGroup />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='users'>
                        Groups
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper onClick={() => {window.open('https://console.aws.amazon.com/amplify','_blank')}}>
                      <DropDownCollapseIcon>
                        <BiPalette />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='users'>
                        Edit App
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
              </DropDownCollapseContent>
        </DropDownCollapseContainer>
        </DropDownContainer>

  {/* ----Dashboard---- */}
        {/* <StandardContainer onClick={() => {navigate('/dashboard/',{username})}} id="Dashboard"> */}
        <StandardContainer onClick={() => {navigate('/dashboard')}} id="Dashboard">
            <StandardLink id='Dashboard'>
                <StandardIcon>
                    <BiHome />
                </StandardIcon>
                <StandardName>
                    Dashboard
                </StandardName>
          </StandardLink>
        </StandardContainer>

  {/* ----Account---- */}
        <DropDownContainer id="Account">
            <DropDownLink id='Account'>
                <DropDownIcon>
                    <BiUser />
                </DropDownIcon>
                <DropDownName>
                    Account
                </DropDownName>
                <DropDownChevron>
                    <BiChevronDown />
                </DropDownChevron>
          </DropDownLink>
        <DropDownCollapseContainer>
              <DropDownCollapseContent>
                <Link to = '/account'>
                  <DropDownCollapseWrapper>
                      <DropDownCollapseIcon>
                        <BiCog />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Settings'>
                        Settings
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper >
                </Link>
                  {/* <DropDownCollapseWrapper onClick={() => {navigate('/sign-in')}} id='UserLogout'> */}
                  <DropDownCollapseWrapper onClick={signOut}id='UserLogout'>
                      <DropDownCollapseIcon>
                        <BiLogOut />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Logout'>
                        Logout
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
              </DropDownCollapseContent>
        </DropDownCollapseContainer>
        </DropDownContainer>

  {/* ----Messages---- */}
        <StandardContainer id="Messages">
            <StandardLink id='Messages'>
                <StandardIcon>
                    <BiChat />
                </StandardIcon>
                <StandardName>
                    Messages
                </StandardName>
          </StandardLink>
        </StandardContainer>
      </NavLinksSection>

  {/* ========MENU SECTION COMPONENTS======== */}
      <NavLinksSection id="menu">
              <NavLinksSubtitle>
                Menu
              </NavLinksSubtitle>

  {/* ----Support---- */}
  <DropDownContainer id="Support">
            <DropDownLink id='Support'>
                <DropDownIcon>
                <BiSupport />
                </DropDownIcon>
                <DropDownName>
                    Support
                </DropDownName>
                <DropDownChevron>
                    <BiChevronDown />
                </DropDownChevron>
          </DropDownLink>
        <DropDownCollapseContainer>
              <DropDownCollapseContent>
                  <DropDownCollapseWrapper onClick={() => {navigate('/transcriptions')}}>
                      <DropDownCollapseIcon>
                        <BiBarChartSquare />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Analytics'>
                        Call Analytics
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper onClick={() => {navigate('/recordings')}}>
                      <DropDownCollapseIcon>
                        <BiPlay />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Recordings'>
                        Recordings
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper>
                      <DropDownCollapseIcon>
                        <BiMessageAltDetail />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='ChatLogs'>
                        Chat Logs
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper>
                      <DropDownCollapseIcon>
                        <BiAlarmExclamation />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Escalations'>
                        Escalations
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>

              </DropDownCollapseContent>
        </DropDownCollapseContainer>
        </DropDownContainer>

  {/* ----Notes---- */}
        <DropDownContainer id="Notes">
            <DropDownLink id='Notes'>
                <DropDownIcon>
                    <BiUser />
                </DropDownIcon>
                <DropDownName>
                    Notes
                </DropDownName>
                <DropDownChevron>
                    <BiChevronDown />
                </DropDownChevron>
          </DropDownLink>
        <DropDownCollapseContainer>
              <DropDownCollapseContent>
                  <DropDownCollapseWrapper>
                      <DropDownCollapseIcon>
                        <BiPlus />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='New'>
                        New
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
                  <DropDownCollapseWrapper>
                      <DropDownCollapseIcon>
                        <BiNotepad />
                      </DropDownCollapseIcon>
                      <DropDownCollapseItem id='Existing'>
                        Existing
                      </DropDownCollapseItem>
                  </DropDownCollapseWrapper>
              </DropDownCollapseContent>
        </DropDownCollapseContainer>
        </DropDownContainer>

  {/* ----Saved---- */}
        <StandardContainer id="Saved">
            <StandardLink id='Saved'>
                <StandardIcon>
                    <BiBookmark />
                </StandardIcon>
                <StandardName>
                    Saved
                </StandardName>
          </StandardLink>
        </StandardContainer>
    </NavLinksSection>
  </NavLinksContainer>

  {/* ----User Logout---- */}
            {/* <UserLogoutWrapper>
              <UserLogoutLink id='UserLogout'>
                          <UserLogoutIcon>
                              <BiLogOut />
                          </UserLogoutIcon>
                          <UserLogoutName>
                              Logout
                          </UserLogoutName>
                    </UserLogoutLink>
            </UserLogoutWrapper>
        <UserLogoutContainer>
        </UserLogoutContainer> */}

  </>

  )
}

export default NavLinks;
