// /@ts-check

import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Icons
// import SaveIcon from '@material-ui/icons/Save'
// import DeleteIcon from '@material-ui/icons/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import RecordingsCardImage from '../../../images/undraw_wind_turbine_green.svg';
import RecordingsCardImage from '../../../images/undraw_listening_re_c2w0_green.svg';
import {
  RecordingsCardContainer,
  RecordingsCardGrid,
  RecordingsCardTextContainer,
  RecordingsCardTitle,
  RecordingsCardSubtitle,
  RecordingsCardEmoji,
  RecordingsCardImageContainer,
} from './RecordingsCard.styles'



const RecordingsCard = () => {

  let navigate = useNavigate();
  return (
<>

<RecordingsCardContainer onClick={() => {navigate('/recordings')}}>
  <RecordingsCardGrid>

  <RecordingsCardTextContainer>
    <RecordingsCardTitle>
    Recordings
    <RecordingsCardEmoji role="img" aria-label="dog">
    ▶️
    </RecordingsCardEmoji>
    </RecordingsCardTitle>
    <RecordingsCardSubtitle>
    Let's hear what happened.
    </RecordingsCardSubtitle>
  </RecordingsCardTextContainer>
    <RecordingsCardImageContainer src = {RecordingsCardImage}/>
  </RecordingsCardGrid>
</RecordingsCardContainer>

</>
  )
}

export default RecordingsCard;
