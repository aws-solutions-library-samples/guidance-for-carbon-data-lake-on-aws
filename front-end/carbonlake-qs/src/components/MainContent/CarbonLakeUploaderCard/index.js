import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import CarbonLakeUploaderImage from '../../../images/undraw_wind_turbine_green.svg';
import CarbonLakeUploaderImage from '../../../images/undraw_robotics_kep0_green.svg';
import {
  CarbonLakeUploaderContainer,
  CarbonLakeUploaderGrid,
  CarbonLakeUploaderTextContainer,
  CarbonLakeUploaderTitle,
  CarbonLakeUploaderSubtitle,
  CarbonLakeUploaderEmoji,
  CarbonLakeUploaderImageContainer,
} from './CarbonLakeUploaderCard.styles'



const CarbonLakeUploader = () => {
  return (
<>

<CarbonLakeUploaderContainer>
  <CarbonLakeUploaderGrid>

  <CarbonLakeUploaderTextContainer>
    <CarbonLakeUploaderTitle>
    CarbonLake Uploader
    <CarbonLakeUploaderEmoji role="img" aria-label="dog">
    🧠
    </CarbonLakeUploaderEmoji>
    </CarbonLakeUploaderTitle>
    <CarbonLakeUploaderSubtitle>
    Upload your .CSV or .JSON files below
    </CarbonLakeUploaderSubtitle>
  </CarbonLakeUploaderTextContainer>
    <CarbonLakeUploaderImageContainer src = {CarbonLakeUploaderImage}/>
  </CarbonLakeUploaderGrid>
</CarbonLakeUploaderContainer>

</>
  )
}

export default CarbonLakeUploader;
