import React from 'react';

// Styled Components
import {
  UserProfileContainer,
  UserProfilePicture,
  UserProfileHeading,
  UserProfileSubheading,
  UserProfileAlias} from './UserProfile.styles';

  // Image Refs
  import UserProfilePic from '../../../images/image1.jpg';
  import UserDefaultPicture from '../../../images/default-user-picture.png'


// User full name, pulled from cognito user pool
let UserFullName = 'Kevon Mayers'

// User full name, pulled from cognito user pool
let UserAlias = 'novekm@'

// Role users are either assigned or choose when during account creation
let UserRole = 'Super Admin'

// Default picture users have upon account creation
let UserDefaultPic = {UserDefaultPicture}

// Eventually will be link to S3 file where user uploaded pic is stored
// Can use API gateway to access this URL
let UserUploadedPic = 'https://i.redd.it/b0a32glw3ub71.jpg'

const UserProfile = () => {
  return (
    <>

  <UserProfileContainer>
    <UserProfilePicture src={UserProfilePic} />

    {/* TODO - Make these conditional later */}
    {/* Have state set to UserDefaultPicture. If user has uploaded a picture, set to that */}
    {/* <UserProfilePicture src={UserDefaultPicture} /> */}
    {/* <UserProfilePicture src={UserUploadedPic} /> */}

        <UserProfileHeading>
            <span>{UserFullName}</span>
        </UserProfileHeading>

        <UserProfileSubheading>
            <span>{UserRole}</span>
        </UserProfileSubheading>

        {/* <UserProfileAlias>
            <span>{UserAlias}</span>
        </UserProfileAlias> */}

  </UserProfileContainer>

    </>
  )
}

export default UserProfile;
