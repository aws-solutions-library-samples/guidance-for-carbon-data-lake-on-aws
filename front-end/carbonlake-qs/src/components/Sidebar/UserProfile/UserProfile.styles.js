import styled from "styled-components";

export const UserProfileContainer = styled.div`
  white-space: nowrap;
  padding-bottom: 3em;

  @media screen and (min-width: 768px) {
  opacity: 0;
  transition: 0.3s;

  }
`;

export const UserProfilePicture = styled.img`
  display: flex;
  margin-left: auto;
  margin-right: auto;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: white;

  img {
    max-width: 100%;
    height: auto;
  }

  /* @media screen and (min-width: 768px) {
    width: 40px;
    height: 40px;
  } */

`;

export const UserProfileHeading = styled.div`
  text-align: center;
  padding-top: 0.5em;
  font-size: 1.2em;
  font-weight: 800;
  color: white;
  /* border-bottom: solid rgba(255, 255, 255, 0.344) 1px; */
`;
export const UserProfileAlias = styled.div`
  text-align: center;
  padding-top: .5em;
  font-size: 1.1em;
  font-weight: 600;
  color: #fff;
`;

export const UserProfileSubheading = styled.div`
  text-align: center;
  padding-top: none;
  font-size: 1em;
  color: rgba(255, 255, 255, 0.639);
`;
