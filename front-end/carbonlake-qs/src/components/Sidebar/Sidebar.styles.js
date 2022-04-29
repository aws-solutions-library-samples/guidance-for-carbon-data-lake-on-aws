import styled from "styled-components";

// Styled Components
import { Text } from "./CompanyBranding/CompanyBranding.styles"
import { UserProfileContainer }  from './UserProfile/UserProfile.styles'
import { NavLinksSection, NavLinksSubtitle} from "./NavLinks/NavLinks.styles";
import { DropDownName, DropDownChevron } from './NavLinks/DropDown/DropDown.styles'
import { StandardName } from './NavLinks/Standard/Standard.styles'
import { UserLogoutName } from './NavLinks/UserLogout/UserLogout.styles'


export const Nav = styled.div`
  position: fixed;
  top: 0;
  left: -100%;
  /* left: 0; */
  height: 100vh;
  padding: 1rem 1rem 3rem;
  /* background-color: var(--container-color); */
  background-color: var(--container-color-dark-mode);
  /* background-color: var(--bgs-color-bg); */
  box-shadow: 1px 0 0 rgba(22, 8, 43, 0.1);
  z-index: var(--z-fixed);
  transition: 0.4s;

  @media screen and (min-width: 768px) {
    left: 0;
    padding: 1.2rem 1.5rem 3rem;
    width: 76px;
  }

  /* If formatting looks weird when checking mobile responsiveness */
  /* put hove in the media query block */
    /* Hover Animation for Sidebar elements */
  :hover{
    width: var(--nav-width);
    /* add names for other components below */
    ${Text} {
      opacity: 1;
    }
    ${UserProfileContainer} {
      opacity: 1;
    }
    ${NavLinksSection} {
      opacity: 1;
    }
    ${NavLinksSubtitle} {
      opacity: 1;
    }
    ${DropDownName} {
      opacity: 1;
    }
    ${StandardName} {
      opacity: 1;
    }
    ${UserLogoutName} {
      opacity: 1;
    }
    ${DropDownChevron} {
      opacity: 1;
    }
  }
`;

export const ShowNav = styled.div`
  left: 0;
  `;

export const Container = styled.nav`
  height: 100%;
  display: flex;
  flex-direction: column;
  /* uncomment me later */
  /* justify-content: space-between; */
  overflow: auto;
  scrollbar-width: none; /* For Mozilla */

  ::-webkit-scrollbar {
  display: none; /* For google Chrome and others */
}
`;


