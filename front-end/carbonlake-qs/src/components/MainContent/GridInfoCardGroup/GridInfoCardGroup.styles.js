import styled from "styled-components";

export const GridInfoCardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 2rem;

  margin-top: 1em;
  margin-left: 2em;
  margin-right: 3em;
  padding-top: 2em;
  padding-bottom: 2em;
  /* background-color: #ffffff; */
  /* background-image: linear-gradient( to bottom right, #0b0b0b, #212121 ); */
  /* background-image: linear-gradient( to bottom right, #4744ee, #33d0ff ); */
  /* background-color: var(--container-color-dark-mode); */
  border-radius: 20px;
  box-shadow: 4px 4px 8px rgb(0 0 0 / 20%);
  max-width: 100%;
  height: auto;
  overflow: hidden;

`;

export const GridInfoCard = styled.div`
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  border-radius: 20px;
  /* height: 150px; */
  box-shadow: 4px 4px 5px rgb(0 0 0 / 40%);


  /* display: grid;
    grid-template-columns: minmax(50%, 1fr) minmax(auto, 360px);
    grid-gap: calc(3rem - 8px);
    align-items: center;
    margin-left: 1em;
    margin-right: 1em;
    padding: 3em; */

  transition: 0.3s ease-in-out ;
  :hover{
    /* color:var(--bgs-color-text2-bright); */
    cursor: pointer !important;
    transform: scale(104%);
  }
`;

export const GridInfoCardText = styled.div`

`;
export const GridInfoCardNumber = styled.div`
color: #ffffff;
font-weight: 600;
font-size: 2rem;
`;

export const GridInfoCardTitle = styled.span`
color: #ffffff;
font-weight: 400;
font-size: 1rem;

`;
export const GridInfoCardIcon = styled.span`
color: #ffffff;
font-weight: 600;
font-size: 4rem;

`;
