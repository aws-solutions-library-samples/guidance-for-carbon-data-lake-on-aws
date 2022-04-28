import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import VisualizationsImage from '../../../images/undraw_wind_turbine_green.svg';
import VisualizationsImage from '../../../images/undraw_data_trends_re_2cdy_green.svg';
import {
  VisualizationsContainer,
  VisualizationsGrid,
  VisualizationsTextContainer,
  VisualizationsTitle,
  VisualizationsSubtitle,
  VisualizationsEmoji,
  VisualizationsImageContainer,
} from './VisualizationsCard.styles'



const Visualizations = () => {
  return (
<>

<VisualizationsContainer>
  <VisualizationsGrid>

  <VisualizationsTextContainer>
    <VisualizationsTitle>
    Visualizations
    <VisualizationsEmoji role="img" aria-label="dog">
    📊
    </VisualizationsEmoji>
    </VisualizationsTitle>
    <VisualizationsSubtitle>
    Gain detailed insight into your carbon footprint
    </VisualizationsSubtitle>
  </VisualizationsTextContainer>
    <VisualizationsImageContainer src = {VisualizationsImage}/>
  </VisualizationsGrid>
</VisualizationsContainer>

</>
  )
}

export default Visualizations;
