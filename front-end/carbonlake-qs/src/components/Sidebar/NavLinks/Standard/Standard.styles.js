import styled from "styled-components";

import { SidebarVars } from '../../SidebarVars'

export const StandardContainer = styled.div`
  /* transition: 0.4s ease-in-out;
  :hover {
    max-height: 100rem;
  } */
`;

// .active{
//   color: var(--bgs-color-text2-bright);
// }

export const StandardLink = styled.a`
  display: flex;
  align-items: center;
  color: var(--text-color);

  a{
    text-decoration: none;
  }

  ${StandardContainer}:hover & {
    color: var(--bgs-color-text2-bright) !important;
    cursor: pointer;
    transition: 0.3s;
  }
`;

export const StandardIcon = styled.i`
  font-size: ${SidebarVars.navIconSize};
  display: flex;
  justify-content: center;
`;

export const StandardName = styled.span`
    font-size: ${SidebarVars.navTextSize};
    font-weight: var(--font-medium);
    padding-left: 0.5em;
    white-space: nowrap;

    @media screen and (min-width: 768px) {
      opacity: 0;
      transition: 0.3s;
    }
`;

