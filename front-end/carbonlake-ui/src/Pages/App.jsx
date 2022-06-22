/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components.

************************************************************************/
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BobRossIntro from './BobRossIntro.jsx';
import Dashboard from './Dashboard.jsx';
import CarbonLake101 from './CarbonLake101.jsx';
import SetupGuide from './SetupGuide.jsx';
import DataUploader from './DataUploader.jsx';
import AccountSettings from './AccountSettings.jsx';
// import Visualizations from './Visualizations.jsx';
// import Basic from './BasicLayout.jsx';
// import ServiceHomepage from './ServiceHomepage.jsx';
// import CreateForm from './CreateForm.jsx';
import TableView from './EmissionRecords.jsx';
// import EmptyTableView from './TableWithEmptyState.jsx';

import '@awsui/global-styles/index.css';

// Amplify
import Amplify, { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from '../aws-exports';
// Amplify.configure(awsExports);


// Class App is the "output" generated on every build,
// it is what you will see on the webpage.
function App({signOut, user}) {
    return (
      // When you create a new file or template, add it below
      // as a new 'Route' so you can link to it with a url.

      <div>
        <Router>

        <Routes>

        {/* <Route exact path="/" element={BobRossIntro} /> */}
        <Route  path="/" element={<CarbonLake101 />} />
        {/* <Route exact path="/" element={Dashboard} /> */}
        <Route  path="/carbonlake-101" element={<CarbonLake101 />} />
        <Route  path="/setup-guide" element={<SetupGuide />} />
        <Route  path="/data-uploader" element={<DataUploader />} />
        <Route  path="/account-settings" element={<AccountSettings />} />
        {/* <Route exact path="/visualizations" element={Visualizations} /> */}
        {/* <Route path="/basic" element={<Basic />} />
        <Route path="/service-home" element={<ServiceHomepage />} />
      <Route path="/create" element={<CreateForm />} /> */}
        <Route path="/emission-records" element={<TableView />} />
        {/* <Route path="/table-empty" element={<EmptyTableView />} /> */}
        <Route path='/about-carbonlake' element={() => {
          window.location.href = 'https://aws.amazon.com';
          return null;
        }}/>
        <Route path='/submit-issue' element={() => {
          window.location.href = 'https://github.com';
          return null;
        }}/>
        </Routes>
        </Router>

      </div>
    );
}


export default withAuthenticator(App);
