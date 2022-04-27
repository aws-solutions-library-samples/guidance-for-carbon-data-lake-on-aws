import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
// import AccountSettingsImage from '../../../images/undraw_wind_turbine_green.svg';
import AccountSettingsImage from '../../../images/undraw_profile_re_4a55_green.svg';
import {
  AccountSettingsContainer,
  AccountSettingsGrid,
  AccountSettingsTextContainer,
  AccountSettingsTitle,
  AccountSettingsSubtitle,
  AccountSettingsEmoji,
  AccountSettingsImageContainer,
} from './AccountSettingsCard.styles'



const AccountSettings = () => {
  return (
<>

<AccountSettingsContainer>
  <AccountSettingsGrid>

  <AccountSettingsTextContainer>
    <AccountSettingsTitle>
    Account Settings
    <AccountSettingsEmoji role="img" aria-label="dog">
    👤
    </AccountSettingsEmoji>
    </AccountSettingsTitle>
    <AccountSettingsSubtitle>
    Modify your existing account settings
    </AccountSettingsSubtitle>
  </AccountSettingsTextContainer>
    <AccountSettingsImageContainer src = {AccountSettingsImage}/>
  </AccountSettingsGrid>
</AccountSettingsContainer>

</>
  )
}

export default AccountSettings;
