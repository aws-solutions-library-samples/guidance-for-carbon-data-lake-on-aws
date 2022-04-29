import React from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
import { BiLogOut } from "react-icons/bi";

// Styled Components
import {
  UserLogoutContainer,
  UserLogoutWrapper,
  UserLogoutLink,
  UserLogoutIcon,
  UserLogoutName
} from './UserLogout.styles'

const UserLogout = () => {
  let navigate = useNavigate();
  return (
    <UserLogoutContainer onClick={() => {navigate('/home')}} id='UserLogout'>
        <UserLogoutWrapper>
            <UserLogoutLink >
                <UserLogoutIcon>
                    <BiLogOut />
                </UserLogoutIcon>
                <UserLogoutName>
                    Logout
                </UserLogoutName>
          </UserLogoutLink>
      </UserLogoutWrapper>
    </UserLogoutContainer>
  )
}

export default UserLogout;
