/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components.

************************************************************************/
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  SpaceBetween
} from '@cloudscape-design/components';

import '../styles/intro.scss';
import '../styles/servicehomepage.scss';

// This is not meant to be a template, rather it is the
// introduction page that you see upon loading the webserver.
export default function BobRossIntro() {
  return (
    <AppLayout
      navigation={<CustomNavigation />}
      content={<Content />}
      tools={<Tools />}
      disableContentPaddings={true}
    />
  );
}

const Content = () => (
  <div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              <img src="./images/bob_ross.jpg" className="intro-logo" alt="bob ross picture" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                Bob Ross 3.0
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
                Design using AWS-UI React components.
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                  Bob Ross sets up a React development environment, provides you with templates of common pages, and
                  gives you access to AWS-UI components without the hassle of Brazil.
                </span>
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
            <h1>How it works</h1>
            <Container>
              <div>
                <ol>
                  <li>
                    Open this Bob Ross project in your favorite code editor or IDE, and take a look at the file
                    structure.
                    <br />
                    <img src="./images/project_open_code.png" className="intro-screenshot" alt="screenshot" />
                  </li>
                  <li>
                    Currently, you are viewing this page on your localhost as <a>localhost:3000/#/</a> because it is
                    routed as the 'default' page. All of the included templates are already routed and included in the
                    side navigation you see in the left panel of this page. The urls are defined in{' '}
                    <code>src/components/App.jsx</code> (below right). You can learn more about
                    <code>&lt;Routing&gt;</code>{' '}
                    <a href="https://reacttraining.com/react-router/web/api/HashRouter">here</a>
                    .
                    <br />
                    <img
                      src="./images/bob_ross_intro_web.png"
                      className="intro-screenshot intro-code-screenshot"
                      alt="screenshot"
                    />
                    <img src="./images/bob_ross_intro_code.png" className="intro-screenshot" alt="screenshot" />
                  </li>
                  <li>
                    Try viewing the service homepage template page (below) by adding "<strong>service-home</strong>" to
                    the end of the url in your browser: <Link to="service-home">localhost:3000/#/service-home</Link>.
                    When you hit enter you should be redirected to a new page showing the service homepage template.
                    <br />
                    <img
                      src="./images/service_homepage_web.png"
                      className="intro-screenshot intro-code-screenshot"
                      alt="screenshot"
                    />
                  </li>
                  <li>
                    Edit the service homepage template in the <code>ServiceHomepage.jsx</code> file.
                    <br />
                    Save your work to see the results on this page.
                    <br />
                    <img src="./images/service_homepage_file.png" className="intro-screenshot" alt="screenshot" />
                  </li>
                </ol>
              </div>
            </Container>
          </div>
          <div>
            <h1>Benefits and features</h1>
            <Container header={<Header>Included templates</Header>}>
              <div>
                <h4>
                  There are 4 templates already provided for you in the <code>src/components</code> folder:
                </h4>
                <ol>
                  <li>
                    <Link to="/basic">Basic app layout</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/BasicLayout.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/basic</code>
                    </li>
                    <li>
                      The simplest skeleton with just the{' '}
                      <a href="https://polaris.corp.amazon.com/system/structures/components/awsui-app-layout/">
                        app layout
                      </a>{' '}
                      and breadcrumb components.
                    </li>
                    <img src="./images/basic_app_layout.png" className="intro-screenshot" alt="screenshot" />
                  </ul>
                  <li>
                    <Link to="/service-home">Service homepage</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/ServiceHomepage.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/service-home</code>
                    </li>
                    <li>
                      A working example of a{' '}
                      <a href="https://polaris.corp.amazon.com/system/flows/service_homepage/">service homepage</a>,
                      containing components such as: Box, Select, Container, Header, and layout elements like Column
                      layout, Grid, and SpaceBetween.
                    </li>
                    <img src="./images/service_homepage_web.png" className="intro-screenshot" alt="screenshot" />
                  </ul>
                  <li>
                    <Link to="/create">Single page create</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/CreateForm.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/create</code>
                    </li>
                    <li>
                      A full{' '}
                      <a href="https://polaris.corp.amazon.com/system/flows/create/single_page_create/">
                        single page create
                      </a>{' '}
                      form, containing components such as: Attribute editor, Button, Checkbox, Expandable section, Form,
                      Form field, Input, Multi-select, Radio group, Select, Textarea, Tiles, Header, SpaceBetween,
                      Container, Box and more.
                    </li>
                    <img src="./images/create_form.png" className="intro-screenshot" alt="screenshot" />
                  </ul>
                  <li>
                    <Link to="/table">Table view</Link>
                  </li>
                  <ul>
                    <li>
                      File name: <code>components/Table.jsx</code>
                    </li>
                    <li>
                      Url route: <code>/table</code>
                    </li>
                    <li>
                      A working <a href="https://polaris.corp.amazon.com/system/flows/view/table_view/">table view</a>{' '}
                      example, containing components such as: Table (with features like wrap lines, sorting, and
                      selection), Flashbar, Header, Button, Collection preferences, Pagination, Text filter, Icon, and
                      more.
                    </li>
                    <img src="./images/table.png" className="intro-screenshot" alt="screenshot" />
                  </ul>
                </ol>
              </div>
            </Container>
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
);

const CustomNavigation = () => (
  <SideNavigation
    header={{ text: 'Navigation panel', href: '#/' }}
    items={[
      {
        type: 'section',
        text: 'My pages',
        expanded: true,
        items: [
          { type: 'link', text: 'Bob Ross intro', href: '#/' },
          { type: 'link', text: 'Basic layout', href: '#/basic' },
          { type: 'link', text: 'Service homepage', href: '#/service-home' },
          { type: 'link', text: 'Single page create', href: '#/create' },
          { type: 'link', text: 'Table view', href: '#/table' },
          {
            type: 'link',
            text: 'Table with Empty State',
            href: '#/table-empty'
          }
        ]
      }
    ]}
    activeHref="#/"
  />
);

const Tools = () => (
  <HelpPanel header={<h2>Help panel</h2>}>
    <p>Help content goes here</p>
  </HelpPanel>
);
