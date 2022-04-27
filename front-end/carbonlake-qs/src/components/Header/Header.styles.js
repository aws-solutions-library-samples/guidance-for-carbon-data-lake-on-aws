import styled from "styled-components";

export const HeaderMain  = styled.header`
position: fixed;
top: 0;
left: 0;
width: 100%;
background-color: var(--container-color);
background-color: var(--container-color-dark-mode);
box-shadow: 0 1px 0 rgb(22 8 43 / 10%);
padding: 0 1rem;
z-index: var(--z-fixed);

@media screen and (min-width: 768px){
  padding: 0 3rem 0 6rem;
}
`;

export const HeaderContainer  = styled.div`
  display: flex;
  align-items: center;
  height: var(--header-height);
  justify-content: space-between;

  @media screen and (min-width: 768px){
    height: calc(var(--header-height) + 1rem);
  }
`;

export const HeaderUserImage = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;

  img {
    max-width: 100%;
  }


  transition: 0.3s ease-in-out ;
  :hover{
    cursor: pointer !important;
    transform: scale(115%);
  }
  @media screen and (min-width: 768px){
  width: 40px;
  height: 40px;
  order: 1;

}
`;

export const HeaderTitle = styled.a`
  /* color: var(--title-color); */
  color: var(--title-color-dark-mode);
  /* font-weight: var(--font-medium); */
  font-weight: 600;
  /* display: none; */
  font-size: var(--largest-font-size);

  transition: 0.3s ease-in-out ;
  :hover{
    cursor: pointer !important;
    transform: scale(110%);
  }
  @media screen and (min-width: 768px){
    display: block;
  }
`;


export const HeaderSearchContainer = styled.div`
  display: flex;
  padding: 0.1rem 0rem;
  background-color: var(--first-color-light);
  border-radius: 0.25rem;

  @media screen and (min-width: 768px){
    width: 300px;
    padding: 0.55rem 0.75rem;
  }
`;

export const HeaderSearchInput= styled.input`
  width: 100%;
  border: none;
  outline: none;
  background-color: var(--first-color-light);
  align-items: center;
  /* text-align: center; */


  @media screen and (max-width: 768px){
    /* text-align: center; */
    /* padding-left: 1rem; */
    margin-left: 0.5em;

  }
  @media screen and (min-width: var(--med-device)){
    width: 300px;
    /* padding: 0.55rem 0.75rem; */
    /* text-align: center; */
  }
`;

export const HeaderSearchIcon = styled.i`
    font-size: 1.2rem;
    /* padding-top: 0.5rem; */
    margin-top: 0.3em;
    margin-left: 0.3em;
    margin-right: 0.1em;
    transition: 0.3s ease-in-out ;

  :hover{
    cursor: pointer;
    transform: scale(120%);
    }
`;


export const HeaderToggle = styled.i`
  color: white;
  font-size: 2rem;
  cursor: pointer;

  display: flex;
  align-items: center;

  /* svg {
    display: block;
    margin: 0 auto;
    text-align: center;
  } */
  height: 100%;
  @media screen and (min-width: 768px){
    display: none;
  }
`;
