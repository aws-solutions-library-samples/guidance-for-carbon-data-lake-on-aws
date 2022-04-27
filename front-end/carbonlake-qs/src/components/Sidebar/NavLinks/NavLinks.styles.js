import styled from "styled-components";

export const NavLinksContainer = styled.div`
  row-gap: 2.5rem;
  display: grid;
`;

export const NavLinksSection = styled.nav`
  row-gap: 1.5rem;
  display: grid;

@media screen and (min-width: 768px) {
  row-gap: 1.7rem;
  }
`;

export const NavLinksSubtitle = styled.h3`
  font-size: var(--normal-font-size);
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  color: var(--text-color-light);
  /* text-align: left; */

  h3 {
    margin: 0;
  }

  @media screen and (min-width: 768px) {
  opacity: 0;
  transition: 0.3s;
  }
`;
