import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeaderMain,
  HeaderContainer,
  HeaderUserImage,
  HeaderTitle,
  HeaderSearchContainer,
  HeaderSearchInput,
  HeaderSearchIcon,
  HeaderToggle,
} from './Header.styles';

// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';

// Icons
import {
  BiSearch,
  BiMenu,
  BiX

} from "react-icons/bi";

import UserProfilePic from '../../images/image1.jpg';
import UserDefaultPicture from '../../images/default-user-picture.png'


const Header = () => {
  return (
    <div>
      <HeaderMain>
        <HeaderContainer>
          {/* <Link to='/account'>

          </Link> */}
          <HeaderUserImage src = {UserProfilePic} />
          {/* <Link to='/dashboard'>
            <HeaderTitle>
              Dashboard
            </HeaderTitle>
          </Link> */}
            <HeaderTitle>
              Dashboard
            </HeaderTitle>


            {/* <HeaderSearchContainer>
              <HeaderSearchInput placeholder ='Search' />
              <HeaderSearchIcon>
                <BiSearch />
              </HeaderSearchIcon>
            </HeaderSearchContainer> */}
            <HeaderToggle>
              <BiMenu id="header-toggle" />
              {/* <BiX /> */}
            </HeaderToggle>
        </HeaderContainer>
      </HeaderMain>
    </div>
  )
}

export default Header;
