import React from 'react';

// Main Components
import TranscriptionsCard from '../components/MainContent/TranscriptionsCard';
import GridInfoCardGroup from '../components/MainContent/GridInfoCardGroup'
import TranscribeDropdown from '../components/MainContent/TranscribeDropdown'
import {day,month,date,year} from '../components/MainContent/CurrentDate/DateFetch'

// Styles
import { MainContentContainer } from '../components/MainContent/MainContent.styles';
import { TranscribeJobListContainer } from '../components/MainContent/TranscribeDropdown/TranscribeDropdown.styles';
import {CurrentDateContainer,CurrentDate} from '../components/MainContent/CurrentDate/DateFetch.styles'

const Transcriptions = () => {
  return (
    <>
        <MainContentContainer>
            <CurrentDateContainer>
                <CurrentDate>
                    {month} {date}, {year}
                </CurrentDate>
            </CurrentDateContainer>

                <TranscriptionsCard />
                <GridInfoCardGroup />

                <TranscribeJobListContainer>
                    <TranscribeDropdown />
                </TranscribeJobListContainer>
        </MainContentContainer>
    </>
  )
}

export default Transcriptions;
