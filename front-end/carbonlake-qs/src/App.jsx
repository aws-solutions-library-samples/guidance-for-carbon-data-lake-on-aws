import React, { useState, useEffect} from 'react';
// import ReactPlayer from 'react-player';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';


// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages
import Home from './Pages/Home';
import SignInPage from './Pages/SignInPage'
import Dashboard from './Pages/Dashboard'
import Account from './Pages/Account'
import Recordings from './Pages/Recordings'
import Transcriptions from './Pages/Transcriptions'
import CarbonLakeUploader from './Pages/CarbonLakeUploader'
import CallAnalytics from './Pages/CallAnalytics';
import ErrorPage from './Pages/ErrorPage';

// Styles
import {GlobalStyle} from './GlobalStyle';

// Material UI
import { Paper, IconButton, DeleteIcon} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';


// Amplify
// import Amplify, { Auth, Storage, API, graphqlOperation } from 'aws-amplify';
// import awsconfig from './aws-exports';

// API
// import { listJobs } from './graphql/queries'
// import { updateJob } from './graphql/mutations'




// Allows for app to run with Amplify Authentication
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Visualizations from './Pages/Visualizations';
// import awsExports from './aws-exports';
// Amplify.configure(awsconfig);
// Amplify.configure(awsExports);



function App() {
// function App({ signOut, user }) {


  return (
    <Router>
      <Header />
      <Sidebar />

      {/* <h1 style={{marginLeft:'10rem'}}>Hello {user.username}</h1>
      <button onClick={signOut} style={{marginLeft:'10rem'}}>Sign out</button> */}

      {/* <Home /> */}
      {/* <Header /> */}
      {/* <Dashboard /> */}
      <GlobalStyle />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/sign-in' element={<SignInPage/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        {/* <Route path='/dashboard/:username' element={<Dashboard/>}/> */}
        <Route path='/account' element={<Account/>}/>
        {/* <Route path='/account/:username' element={<Account/>}/> */}
        <Route path='/recordings' element={<Recordings/>}/>
        <Route path='/transcriptions' element={<Transcriptions/>}/>
        <Route path='/carbonlake-uploader' element={<CarbonLakeUploader/>}/>
        <Route path='/visualizations' element={<Visualizations/>}/>
        <Route path='/call-analytics' element={<CallAnalytics/>}/>
        {/* <Route path='/call-analytics/:username' element={<CallAnalytics/>}/> */}
        {/* Must be the last route */}
        <Route path='*' element={<ErrorPage/>}/>
      </Routes>
    </Router>

  );
}

export default App;
// Uncomment and below line and comment out above when testing Amplify auth
// export default withAuthenticator(App);
