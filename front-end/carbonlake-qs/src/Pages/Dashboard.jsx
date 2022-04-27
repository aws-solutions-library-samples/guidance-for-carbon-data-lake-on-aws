//@ts-check
import React from 'react';

// Main Components
import WelcomeCard from '../components/MainContent/WelcomeCard';
import GridInfoCardGroup from '../components/MainContent/GridInfoCardGroup'
import {day,month,date,year} from '../components/MainContent/CurrentDate/DateFetch'

// Styles
import { MainContentContainer } from '../components/MainContent/MainContent.styles';
// import { MainContentContainer } from '../components/MainContent/';
import {CurrentDateContainer,CurrentDate} from '../components/MainContent/CurrentDate/DateFetch.styles'

const Dashboard = () => {
  return (
    <>
        <MainContentContainer>
            <CurrentDateContainer>
                <CurrentDate>
                    {month} {date}, {year}
                </CurrentDate>
            </CurrentDateContainer>

                <WelcomeCard />
                <GridInfoCardGroup />
        </MainContentContainer>
    </>
  )
}

export default Dashboard;
