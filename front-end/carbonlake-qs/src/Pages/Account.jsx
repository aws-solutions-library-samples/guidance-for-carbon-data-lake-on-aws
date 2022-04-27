import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  HeaderMain,
  HeaderContainer,
  HeaderUserImage,
  HeaderTitle,
  HeaderSearchContainer,
  HeaderSearchInput,
  HeaderSearchIcon,
  HeaderToggle,
} from '../components/Header/Header.styles';
import {
  BiSearch,
  BiMenu,
  BiX

} from "react-icons/bi";

import UserProfilePic from '../images/image1.jpg';

import Sidebar from '../components/Sidebar'

const Account = () => {
  let pageName = 'Account'
  let navigate = useNavigate();
  let { username } = useParams()
  return (
    <div>
      {/* THIS IS THE ACCOUNT PAGE FOR {username}. */}
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
              {pageName}
            </HeaderTitle>
            <HeaderSearchContainer>
              <HeaderSearchInput placeholder ='Search' />
              <HeaderSearchIcon>
                <BiSearch />
              </HeaderSearchIcon>
            </HeaderSearchContainer>
            <HeaderToggle>
              <BiMenu id="header-toggle" />
              {/* <BiX /> */}
            </HeaderToggle>
        </HeaderContainer>
      </HeaderMain>
      <Sidebar />
    </div>
  )
}

export default Account
