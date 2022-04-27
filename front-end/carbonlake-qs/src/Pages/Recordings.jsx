import React from 'react';

// Main Components
import RecordingsCard from '../components/MainContent/RecordingsCard';
import GridInfoCardGroup from '../components/MainContent/GridInfoCardGroup'
import TranscribeDropdown from '../components/MainContent/TranscribeDropdown'
import {day,month,date,year} from '../components/MainContent/CurrentDate/DateFetch'

// Styles
import { MainContentContainer } from '../components/MainContent/MainContent.styles';
import { TranscribeJobListContainer } from '../components/MainContent/TranscribeDropdown/TranscribeDropdown.styles';
import {CurrentDateContainer,CurrentDate} from '../components/MainContent/CurrentDate/DateFetch.styles'

const Recordings = () => {
  return (
    <>
        <MainContentContainer>
            <CurrentDateContainer>
                <CurrentDate>
                    {month} {date}, {year}
                </CurrentDate>
            </CurrentDateContainer>

                <RecordingsCard />
                <GridInfoCardGroup />

                <TranscribeJobListContainer>
                    <TranscribeDropdown />
                </TranscribeJobListContainer>
        </MainContentContainer>
    </>
  )
}

export default Recordings;
