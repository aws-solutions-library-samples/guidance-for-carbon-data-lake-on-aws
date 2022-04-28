import styled from "styled-components";

export const CompanyBrandingWrapper = styled.div`
  display: flex;
`;

export const CompanyBrandingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  white-space: nowrap;
  color: rgba(255,255,255,0.878) !important; /* Overwrites existing color css for this element*/
  /* border-bottom: solid rgba(255, 255, 255, .1) 1px; */
  font-weight: var(--font-semi-bold);
  color: var(--text-color);
  font-family: 'Poppins';
`;

export const Icon = styled.i`
  font-size: 1.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  color: var(--bgs-color-text2-bright);
  transition: 0.3s ease-in-out ;
  :hover{
    /* color:var(--bgs-color-text2-bright); */
    cursor: pointer !important;
    transform: scale(120%);
  }
`;

export const Text = styled.span`
  padding-left: .5em;
  white-space: nowrap;
  font-size: 1.6rem;
  color: white;
  :hover{
    color:var(--bgs-color-text2-bright);
    cursor: pointer !important;
  }

  @media screen and (min-width: 768px) {
  opacity: 0;
  transition: 0.3s;

  }
`;
