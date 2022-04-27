import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import TranscriptionsCardImage from '../../../images/undraw_wind_turbine_green.svg';
import TranscriptionsCardImage from '../../../images/undraw_robotics_kep0_green.svg';
import {
  TranscriptionsCardContainer,
  TranscriptionsCardGrid,
  TranscriptionsCardTextContainer,
  TranscriptionsCardTitle,
  TranscriptionsCardSubtitle,
  TranscriptionsCardEmoji,
  TranscriptionsCardImageContainer,
} from './TranscriptionsCard.styles'



const TranscriptionsCard = () => {
  return (
<>

<TranscriptionsCardContainer>
  <TranscriptionsCardGrid>

  <TranscriptionsCardTextContainer>
    <TranscriptionsCardTitle>
    Transcriptions
    <TranscriptionsCardEmoji role="img" aria-label="dog">
    🧠
    </TranscriptionsCardEmoji>
    </TranscriptionsCardTitle>
    <TranscriptionsCardSubtitle>
    Powered by Amazon Transcribe for Call Analytics
    </TranscriptionsCardSubtitle>
  </TranscriptionsCardTextContainer>
    <TranscriptionsCardImageContainer src = {TranscriptionsCardImage}/>
  </TranscriptionsCardGrid>
</TranscriptionsCardContainer>

</>
  )
}

export default TranscriptionsCard;
