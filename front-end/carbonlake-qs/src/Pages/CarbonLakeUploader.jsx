import React from 'react';

// Main Components
import TranscriptionsCard from '../components/MainContent/TranscriptionsCard';
import CarbonLakeUploaderCard from '../components/MainContent/CarbonLakeUploaderCard';
import GridInfoCardGroup from '../components/MainContent/GridInfoCardGroup'
import TranscribeDropdown from '../components/MainContent/TranscribeDropdown'
import {day,month,date,year} from '../components/MainContent/CurrentDate/DateFetch'

// Styles
import { MainContentContainer } from '../components/MainContent/MainContent.styles';
import { TranscribeJobListContainer } from '../components/MainContent/TranscribeDropdown/TranscribeDropdown.styles';
import {CurrentDateContainer,CurrentDate} from '../components/MainContent/CurrentDate/DateFetch.styles'

const CarbonLakeUploader = () => {
  return (
    <>
        <MainContentContainer>
            <CurrentDateContainer>
                <CurrentDate>
                    {month} {date}, {year}
                </CurrentDate>
            </CurrentDateContainer>

                <CarbonLakeUploaderCard />
                <GridInfoCardGroup />

                <TranscribeJobListContainer>
                    <TranscribeDropdown />
                </TranscribeJobListContainer>
        <h1>
            TODO - Add S3 Uploader
        </h1>
        </MainContentContainer>
    </>
  )
}

export default CarbonLakeUploader;
