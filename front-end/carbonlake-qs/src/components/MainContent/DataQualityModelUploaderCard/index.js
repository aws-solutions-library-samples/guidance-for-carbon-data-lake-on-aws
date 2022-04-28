import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import DataQualityModelUploaderImage from '../../../images/undraw_wind_turbine_green.svg';
import DataQualityModelUploaderImage from '../../../images/undraw_geniuses_9h9g_green.svg';
import {
  DataQualityModelUploaderContainer,
  DataQualityModelUploaderGrid,
  DataQualityModelUploaderTextContainer,
  DataQualityModelUploaderTitle,
  DataQualityModelUploaderSubtitle,
  DataQualityModelUploaderEmoji,
  DataQualityModelUploaderImageContainer,
} from './DataQualityModelUploader.styles'



const DataQualityModelUploader = () => {
  return (
<>

<DataQualityModelUploaderContainer>
  <DataQualityModelUploaderGrid>

  <DataQualityModelUploaderTextContainer>
    <DataQualityModelUploaderTitle>
    DQM Uploader
    <DataQualityModelUploaderEmoji role="img" aria-label="dog">
    🧠
    </DataQualityModelUploaderEmoji>
    </DataQualityModelUploaderTitle>
    <DataQualityModelUploaderSubtitle>
    Upload your .CSV or .JSON files below
    </DataQualityModelUploaderSubtitle>
  </DataQualityModelUploaderTextContainer>
    <DataQualityModelUploaderImageContainer src = {DataQualityModelUploaderImage}/>
  </DataQualityModelUploaderGrid>
</DataQualityModelUploaderContainer>

</>
  )
}

export default DataQualityModelUploader;
