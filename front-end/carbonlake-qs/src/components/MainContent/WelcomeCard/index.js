import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import WelcomeCardImage from '../../../images/undraw_wind_turbine_green.svg';
import WelcomeCardImage from '../../../images/undraw_working_remotely_green.svg';
import {
  WelcomeCardContainer,
  WelcomeCardGrid,
  WelcomeCardTextContainer,
  WelcomeCardTitle,
  WelcomeCardSubtitle,
  WelcomeCardEmoji,
  WelcomeCardImageContainer,
} from './WelcomeCard.styles'



const WelcomeCard = () => {
  return (
<>

<WelcomeCardContainer>
  <WelcomeCardGrid>

  <WelcomeCardTextContainer>
    <WelcomeCardTitle>
    Hi, Kevon
    <WelcomeCardEmoji role="img" aria-label="dog">
    👋
    </WelcomeCardEmoji>
    </WelcomeCardTitle>
    <WelcomeCardSubtitle>
    Ready to get to work?
    </WelcomeCardSubtitle>
  </WelcomeCardTextContainer>
    <WelcomeCardImageContainer src = {WelcomeCardImage}/>
  </WelcomeCardGrid>
</WelcomeCardContainer>

</>
  )
}

export default WelcomeCard;
