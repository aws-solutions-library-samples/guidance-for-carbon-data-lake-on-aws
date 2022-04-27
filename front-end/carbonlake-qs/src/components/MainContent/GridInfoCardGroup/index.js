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
  GridInfoCardContainer,
  GridInfoCard,
  GridInfoCardText,
  GridInfoCardNumber,
  GridInfoCardTitle,
  GridInfoCardIcon,
} from './GridInfoCardGroup.styles'
import {
  WelcomeCardContainer,
  WelcomeCardGrid,
  WelcomeCardTextContainer,
  WelcomeCardTitle,
  WelcomeCardSubtitle,
  WelcomeCardEmoji,
  WelcomeCardImageContainer,
} from '../WelcomeCard/WelcomeCard.styles'

// Icons
import {
  BiWrench,
  BiHome,
  BiChat,
  BiUser,
  BiGroup,
  BiPalette,
  BiBookmark,
  BiSupport,
  BiMessageAltDetail,
  BiAlarmExclamation,
  BiBarChartSquare,
  BiCog,
  BiPlay,
  BiBrain,
  BiNotepad,
  BiPlus,
  BiLogOut,
  BiChevronDown,
  BiMessage,
} from "react-icons/bi";

const GridInfoCardGroup = () => {
  return (
<>

<GridInfoCardContainer>
<Link to ='/recordings'>
    <GridInfoCard style={{backgroundImage: "linear-gradient(to bottom right, #4744ee, #33d0ff)"}}>
        <GridInfoCardText>
            <GridInfoCardNumber>
                454
            </GridInfoCardNumber>
            <GridInfoCardTitle>
            Recordings
            </GridInfoCardTitle>
        </GridInfoCardText>
        <GridInfoCardIcon>
          <BiPlay />
        </GridInfoCardIcon>
    </GridInfoCard>
        </Link>
<Link to ='/transcriptions'>
    <GridInfoCard style={{backgroundImage: "linear-gradient(to bottom right, #f200ff, #007bff )"}}>
        <GridInfoCardText>
            <GridInfoCardNumber>
                312
            </GridInfoCardNumber>
            <GridInfoCardTitle>
            Transcriptions
            </GridInfoCardTitle>
        </GridInfoCardText>
        <GridInfoCardIcon>
          <BiBrain />
        </GridInfoCardIcon>
    </GridInfoCard>
</Link>

    <GridInfoCard style={{backgroundImage: "linear-gradient(to bottom right, #44b2f7, #09ef52 )"}}>
        <GridInfoCardText>
            <GridInfoCardNumber>
                16
            </GridInfoCardNumber>
            <GridInfoCardTitle>
            Messages
            </GridInfoCardTitle>
        </GridInfoCardText>
        <GridInfoCardIcon>
          <BiPlay />
        </GridInfoCardIcon>
    </GridInfoCard>

    <GridInfoCard style={{backgroundImage: "linear-gradient(to bottom right, #9a0000, #fc5656)"}}>
        <GridInfoCardText>
            <GridInfoCardNumber>
                23
            </GridInfoCardNumber>
            <GridInfoCardTitle>
            Escalations
            </GridInfoCardTitle>
        </GridInfoCardText>
        <GridInfoCardIcon>
          <BiAlarmExclamation />
        </GridInfoCardIcon>
    </GridInfoCard>

</GridInfoCardContainer>

</>
  )
}

export default GridInfoCardGroup;
