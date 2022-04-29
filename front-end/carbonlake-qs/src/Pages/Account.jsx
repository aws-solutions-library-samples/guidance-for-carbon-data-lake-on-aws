import React from 'react';

// Main Components
import TranscriptionsCard from '../components/MainContent/TranscriptionsCard';
import AccountSettingsCard from '../components/MainContent/AccountSettingsCard';
import GridInfoCardGroup from '../components/MainContent/GridInfoCardGroup'
import TranscribeDropdown from '../components/MainContent/TranscribeDropdown'
import {day,month,date,year} from '../components/MainContent/CurrentDate/DateFetch'

// Styles
import { MainContentContainer } from '../components/MainContent/MainContent.styles';
import { TranscribeJobListContainer } from '../components/MainContent/TranscribeDropdown/TranscribeDropdown.styles';
import {CurrentDateContainer,CurrentDate} from '../components/MainContent/CurrentDate/DateFetch.styles'

const AccountSettings = () => {
  return (
    <>
        <MainContentContainer>
            <CurrentDateContainer>
                <CurrentDate>
                    {month} {date}, {year}
                </CurrentDate>
            </CurrentDateContainer>

                <AccountSettingsCard />
                {/* <GridInfoCardGroup /> */}

                <TranscribeJobListContainer>
                    <TranscribeDropdown />
                </TranscribeJobListContainer>
        <h1>
            TODO - Add S3 uploader for profile picture and build out account settings view
        </h1>
        </MainContentContainer>
    </>
  )
}

export default AccountSettings;
