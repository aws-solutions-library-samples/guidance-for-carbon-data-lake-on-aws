import styled from "styled-components";
import Sidebar from "../..";

import { SidebarVars } from '../../SidebarVars'

export const DropDownContainer = styled.div`
  overflow: hidden;
  max-height: 30px;
  transition: 0.4s ease-in-out;

  :hover {
    max-height: 100rem;
  }
`;

// .active{
//   color: var(--bgs-color-text2-bright);
// }

export const DropDownLink = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);

  a{
    text-decoration: none;
  }

  ${DropDownContainer}:hover & {
    color: var(--bgs-color-text2-bright) !important;
    cursor: pointer;
    transition: 0.3s;
  }
`;

export const DropDownIcon = styled.i`
  font-size: ${SidebarVars.navIconSize};
  display: flex;
  justify-content: center;
`;

export const DropDownName = styled.span`
    font-size: ${SidebarVars.navTextSize};
    font-weight: var(--font-medium);
    padding-left: 0.5em;
    white-space: nowrap;

    @media screen and (min-width: 768px) {
      opacity: 0;
      transition: 0.3s;
    }
`;

export const DropDownChevron = styled.i`
  font-size: ${SidebarVars.navChevronSize};
  margin-left: auto;
  transition: 0.4s;

  display: flex;
  align-items: center;

  ${DropDownContainer}:hover  & {
  transform: rotate(180deg);
  }

  @media screen and (min-width: 768px) {
    opacity: 0;
    transition: 0.3s;
    }
`;

export const DropDownCollapseContainer = styled.div`
  background-color: var(--first-color-light);
  border-radius: 0.25em;
  margin-top: .3rem;

`;

export const DropDownCollapseContent = styled.div`
  display: grid;
  row-gap: 0.5rem;
  padding: 0.75rem 2.5rem 0.75rem 1.8rem;
`;

export const DropDownCollapseWrapper = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);

  a{
    text-decoration: none;
  }
`;


export const DropDownCollapseIcon = styled.i`
  font-size: ${SidebarVars.dropdownCollapseIconSize};
  padding-right: .5em;
  display: flex;
  align-items: center;

  ${DropDownCollapseWrapper}:hover &{
    color: var(--bgs-color-text2) !important;
    cursor: pointer;
    transition: 0.3s;
  }
`;

export const DropDownCollapseItem = styled.div`
    font-size: ${SidebarVars.dropdownCollapseTextSize};
    /* font-size: var(--normal-font-size); */
    font-weight: var(--font-medium);
    color: var(--text-color);

    a{
      text-decoration: none;
    }

    ${DropDownCollapseWrapper}:hover &{
    color: var(--bgs-color-text2) !important;
    cursor: pointer;
    transition: 0.3s;
  }
`;

