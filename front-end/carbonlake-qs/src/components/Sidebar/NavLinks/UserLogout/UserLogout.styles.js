import styled from "styled-components";


export const UserLogoutContainer = styled.div`
/* padding-top: 15em; */

`;


export const UserLogoutWrapper = styled.div`
position: fixed;
`;

export const UserLogoutLink = styled.a`
  display: flex;
  align-items: center;
  color: var(--text-color);
  margin-top: 5rem;

  a{
    text-decoration: none;
  }

  ${UserLogoutWrapper}:hover & {
    color: var(--bgs-color-text2-bright) !important;
    cursor: default;
    transition: 0.3s;
  }


`;

export const UserLogoutIcon = styled.i`
  font-size: 1.5rem;
  display: flex;
  justify-content: center;



`;

export const UserLogoutName = styled.span`
    font-size: var(--large-font-size);
    font-weight: var(--font-medium);
    padding-left: 0.5em;
    white-space: nowrap;


    @media screen and (min-width: 768px) {
      opacity: 0;
      transition: 0.3s;

    }


`;

