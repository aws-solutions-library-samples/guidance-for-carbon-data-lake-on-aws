/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/

import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../common/components/Sidebar';
import TopNavigationHeader from '../../common/components/TopNavigationHeader';

import {
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  SpaceBetween,
  Flashbar,
  Alert,
  Form,
  Button,
  Table,
  Icon
} from '@cloudscape-design/components';

import { ExternalLinkItem } from '../../common/common-components-config';

import '../../common/styles/intro.scss';
import '../../common/styles/servicehomepage.scss';

const AccountSettings = () => {
  return (
    <>
      <AppLayout
      navigation={<Sidebar activeHref="#/" />}
      content={<Content />}
      tools={<ToolsContent />}
      headerSelector='#h'
      disableContentPaddings={true}
    />
</>
  )
}

export default AccountSettings;


const Content = () => {
  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                AWS CarbonLake Quickstart
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
              Account Settings
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                For issues with your account, please submit a <a target="_blank" rel="noopener noreferrer" href="">support ticket</a>.
                </span>
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

{/* Start How it works section */}
      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
            <h1>Placeholder Text</h1>
            <Container>
              <div>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ornare lectus sit amet est placerat in egestas erat. Leo a diam sollicitudin tempor id eu nisl. Potenti nullam ac tortor vitae purus faucibus ornare suspendisse sed. Tristique sollicitudin nibh sit amet commodo nulla facilisi nullam. Hendrerit gravida rutrum quisque non tellus orci ac auctor augue. Pellentesque sit amet porttitor eget dolor morbi non arcu. Ut sem nulla pharetra diam sit amet nisl suscipit adipiscing. Aliquam malesuada bibendum arcu vitae elementum curabitur vitae. Etiam dignissim diam quis enim lobortis scelerisque. Vulputate ut pharetra sit amet aliquam id. Libero enim sed faucibus turpis in eu mi bibendum. Egestas dui id ornare arcu odio. Neque sodales ut etiam sit amet nisl. Scelerisque fermentum dui faucibus in ornare quam viverra orci. Enim praesent elementum facilisis leo vel. Pulvinar elementum integer enim neque volutpat. Sit amet venenatis urna cursus eget nunc scelerisque. Non nisi est sit amet facilisis.</p>

                <p>Sed adipiscing diam donec adipiscing tristique risus. Eget arcu dictum varius duis at consectetur. Aliquet nec ullamcorper sit amet risus. Id porta nibh venenatis cras sed. In nisl nisi scelerisque eu ultrices vitae auctor eu augue. Lectus nulla at volutpat diam. In hac habitasse platea dictumst quisque sagittis purus sit. Tristique senectus et netus et. Id venenatis a condimentum vitae sapien. Nullam non nisi est sit amet facilisis. Nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur.</p>

                <p>Et tortor at risus viverra adipiscing at in. Id cursus metus aliquam eleifend. Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Neque gravida in fermentum et sollicitudin ac orci phasellus egestas. Nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. Eu feugiat pretium nibh ipsum consequat nisl vel pretium. Facilisis sed odio morbi quis. Dictum non consectetur a erat nam at lectus. Arcu bibendum at varius vel pharetra vel turpis nunc. Nunc mattis enim ut tellus elementum sagittis. Ac orci phasellus egestas tellus. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat in. Sed turpis tincidunt id aliquet risus feugiat in ante.</p>

                <p>Sed vulputate odio ut enim blandit volutpat maecenas volutpat. Cursus euismod quis viverra nibh cras. Ac feugiat sed lectus vestibulum. Sed euismod nisi porta lorem mollis aliquam ut porttitor leo. Amet mattis vulputate enim nulla aliquet porttitor lacus luctus accumsan. Integer eget aliquet nibh praesent. Rhoncus dolor purus non enim praesent. Sagittis eu volutpat odio facilisis mauris sit amet. Sit amet dictum sit amet justo donec enim diam. Ac felis donec et odio pellentesque. Id velit ut tortor pretium. Ac felis donec et odio pellentesque diam volutpat commodo. Dui vivamus arcu felis bibendum ut. Sapien nec sagittis aliquam malesuada bibendum. Consequat nisl vel pretium lectus quam id leo in vitae. Sed arcu non odio euismod lacinia. Velit egestas dui id ornare arcu odio ut sem nulla.</p>

                <p>Semper quis lectus nulla at volutpat diam ut venenatis tellus. Ultrices dui sapien eget mi proin. Nibh sit amet commodo nulla facilisi nullam vehicula. At lectus urna duis convallis convallis tellus id interdum velit. In massa tempor nec feugiat nisl pretium. Sit amet luctus venenatis lectus magna fringilla. Cursus sit amet dictum sit amet justo. Platea dictumst quisque sagittis purus sit amet volutpat consequat mauris. Tincidunt lobortis feugiat vivamus at augue eget arcu. Montes nascetur ridiculus mus mauris vitae ultricies leo. Cursus sit amet dictum sit amet justo. Etiam sit amet nisl purus in mollis nunc sed id. Neque ornare aenean euismod elementum nisi quis eleifend quam. Bibendum enim facilisis gravida neque. Magna ac placerat vestibulum lectus mauris. Ac felis donec et odio pellentesque. In metus vulputate eu scelerisque felis imperdiet. Ut morbi tincidunt augue interdum velit. Nunc vel risus commodo viverra maecenas. Eleifend donec pretium vulputate sapien.</p>
              </div>
            </Container>
          </div>
          <div>
            {/* <h1>Benefits and features</h1>
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
                      <a href="example.com">
                        app layout
                      </a>{' '}
                      and breadcrumb components.
                    </li>
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
                      <a href="example.com">service homepage</a>,
                      containing components such as: Box, Select, Container, Header, and layout elements like Column
                      layout, Grid, and SpaceBetween.
                    </li>
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
                      <a href="example.com">
                        single page create
                      </a>{' '}
                      form, containing components such as: Attribute editor, Button, Checkbox, Expandable section, Form,
                      Form field, Input, Multi-select, Radio group, Select, Textarea, Tiles, Header, SpaceBetween,
                      Container, Box and more.
                    </li>
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
                      A working <a href="example.com">table view</a>{' '}
                      example, containing components such as: Table (with features like wrap lines, sorting, and
                      selection), Flashbar, Header, Button, Collection preferences, Pagination, Text filter, Icon, and
                      more.
                    </li>
                  </ul>
                </ol>
              </div>
            </Container> */}
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Setup Guide</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/energy/"
              text="AWS Energy & Utilities"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/"
              text="GHG Protocol Guidance"
            />
          </li>
        </ul>
      </>
    }
  >
    <p>
    For issues with your account, please submit a <a target="_blank" rel="noopener noreferrer" href="">support ticket</a>.
    </p>
  </HelpPanel>
);

