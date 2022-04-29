/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components. For production code, follow the integration
guidelines:

https://polaris.corp.amazon.com/getting_started/development/integration/
************************************************************************/
import React from 'react';
import { Route } from 'react-router-dom';
import BobRossIntro from './BobRossIntro.jsx';
import Dashboard from './Dashboard.jsx';
import AboutCarbonLake from './AboutCarbonLake.jsx';
import Basic from './BasicLayout.jsx';
import ServiceHomepage from './ServiceHomepage.jsx';
import CreateForm from './CreateForm.jsx';
import TableView from './EmissionRecords.jsx';
import EmptyTableView from './TableWithEmptyState.jsx';

import '@awsui/global-styles/index.css';

// Class App is the "output" generated on every build,
// it is what you will see on the webpage.
export default class App extends React.Component {
  render() {
    return (
      // When you create a new file or template, add it below
      // as a new 'Route' so you can link to it with a url.

      <div>
        {/* <Route exact path="/" component={BobRossIntro} /> */}
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/how-to-use-carbonlake-app" component={AboutCarbonLake} />
        <Route path="/basic" component={Basic} />
        <Route path="/service-home" component={ServiceHomepage} />
        <Route path="/create" component={CreateForm} />
        <Route path="/emission-records" component={TableView} />
        <Route path="/table-empty" component={EmptyTableView} />
        <Route path='/about-carbonlake' component={() => {
            window.location.href = 'https://aws.amazon.com';
          return null;
        }}/>
        <Route path='/submit-issue' component={() => {
            window.location.href = 'https://github.com';
          return null;
        }}/>
      </div>
    );
  }
}
