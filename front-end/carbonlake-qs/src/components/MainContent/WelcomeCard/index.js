import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainContentContainer } from './MainContent.styles';
import MUIButton from '@material-ui/core/Button'
import MUIButtonGroup from '@material-ui/core/Button'
import MUITextField from '@material-ui/core/TextField'

import { makeStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import { Storage } from 'aws-amplify';

// Icons
import SaveIcon from '@material-ui/icons/Save'
import DeleteIcon from '@material-ui/icons/Delete'


// import {
//   UserProfilePicture
// } from '../Sidebar/UserProfile/UserProfile.styles';
import UserProfilePic from '../../images/image1.jpg';
import UserDefaultPicture from '../../images/default-user-picture.png'

import WelcomeCard from './WelcomeCard';
import {day,month,date,year} from './CurrentDate/DateFetch'
import {CurrentDateContainer,CurrentDate} from './CurrentDate/DateFetch.styles'

import GridInfoCardGroup from './GridInfoCardGroup'

import JobList from './JobList'
import { JobListContainer } from './JobList/JobList.styles';

import TranscribeJobList from './TranscribeJobList';


const MainContent = () => {
  return (
<>

<MainContentContainer>
    {/* <CurrentDateContainer>
        <CurrentDate>
            {month} {date}, {year}
        </CurrentDate>
    </CurrentDateContainer>

    <WelcomeCard />
    <GridInfoCardGroup />
    <JobListContainer>

    <JobList />
    </JobListContainer>
    <JobListContainer>

    <TranscribeJobList />
    </JobListContainer>
 */}


</MainContentContainer>
</>
  )
}

export default MainContent;
