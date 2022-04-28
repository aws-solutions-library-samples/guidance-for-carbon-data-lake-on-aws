import styled from "styled-components";


export const VisualizationsContainer = styled.div`
  /* padding-top: 2em;
  padding-left: 3em; */
  margin-top: 1em;
  margin-left: 2em;
  margin-right: 3em;
  background-color: #0b0b0b;
  background-image: linear-gradient( to bottom right, #0b0b0b, #212121 );
  /* background-image: linear-gradient( to bottom right, #4744ee, #33d0ff ); */
  /* background-color: var(--container-color-dark-mode); */
  border-radius: 20px;
  box-shadow: 4px 4px 8px rgb(0 0 0 / 20%);

  height: auto;
  overflow: hidden;

  transition: 0.3s ease-in-out ;
  :hover{
    /* color:var(--bgs-color-text2-bright); */
    cursor: pointer !important;
    transform: scale(102%);
  }
`;


export const VisualizationsGrid = styled.div`
    display: grid;
    grid-template-columns: minmax(50%, 1fr) minmax(auto, 720px);
    grid-gap: calc(3rem - 8px);
    align-items: center;
    margin: 0;
    padding: 3em;
    transition: 0.3s;
`;
export const VisualizationsTextContainer = styled.div`

`;

export const VisualizationsTitle = styled.h1`
color: #ffffff;
font-weight: 600;
font-size: 3.5rem;

`;

export const VisualizationsSubtitle = styled.h4`
color: #d3d3d3;
font-weight: 400;
font-size: 1.4rem;

`;

export const VisualizationsEmoji = styled.span`
padding-left: .5rem;
font-size: 3rem;
`;

export const VisualizationsImageContainer = styled.img`
max-width: 100%;
max-height: 100%;
/* margin-left:; */
display: flex;
/* background-color: red; */
justify-content: right;
/* align-items: right; */

`;
