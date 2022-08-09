/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components.

************************************************************************/
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavigationHeader from '../components/TopNavigationHeader';
import HelpTools from '../components/HelpTools';
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
  Form,
  Button,
  FormField,
  Input,
  Table
} from '@awsui/components-react';

import '../styles/intro.scss';
import '../styles/servicehomepage.scss';

import {COLUMN_DEFINITIONS} from '../resources/table_uploader/table-config'



// Amplify
import Amplify, { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { forEachLeadingCommentRange } from 'typescript';
import {existingS3} from '../amplify-config';

// import awsExports from '../aws-exports';
Amplify.configure(existingS3);

// S3 Upload Parameters
// Amplify.configure({
//   Auth: {
//       identityPoolId: 'us-east-1:941eee7c-6ef3-4915-a5a8-8b2eacc7e898', //REQUIRED - Amazon Cognito Identity Pool ID
//       region: 'us-east-1', // REQUIRED - Amazon Cognito Region
//       userPoolId: 'us-east-1_6FkoMPs6j', //OPTIONAL - Amazon Cognito User Pool ID
//       userPoolWebClientId: '6i9pe0ntcql0npt54eemv4bi1p', //OPTIONAL - Amazon Cognito Web Client ID
//   },
//   Storage: {
//       AWSS3: {
//           bucket: 'carbonlake-quickstart-test-input-bucket', //REQUIRED -  Amazon S3 bucket name
//           region: 'us-east-1', //OPTIONAL -  Amazon service region
//       }
//   }
// });





// This is not meant to be a template, rather it is the
// introduction page that you see upon loading the webserver.

const DataUploader = () => {
  return (
    <>
    <TopNavigationHeader/>




  {/* <Sidebar /> */}
    <AppLayout
    navigation={<Sidebar activeHref="#/" />}
    // navigation={<Sidebar activeHref="#/" items={navItems}/>}
    content={<Content />}
    tools={<HelpTools/>}
    headerSelector='#h'
    disableContentPaddings={true}
    // toolsHide={true}
  />
</>
  )
}

export default DataUploader;


const Content = () => {

 const [data, setData] = useState([]);
 const [files, setFiles] = useState(null);
 const [remove, setRemove] = useState(false);
 const fileInput = useRef();


 const selectFile = () => {
        fileInput.current.click();
    }

  const handleFileInput = (e) => {
    console.log(e.target.files[0])
    setFiles(e.target.files[0]);
    setData([
        {
          name: e.target.files[0].name,
          type: e.target.files[0].type,
          size: e.target.files[0].size
        }
      ])
    setRemove(true)
    e.target.value = null
  };

  const removeButton = () => {
    setData([])
    setRemove(false)

  };

  const cancelButton = () => {
    setFiles(null);
    setData([])
    setRemove(false)

  };

  const uploadFile = async () => {
    const put_csv = await Storage.put("csv/" + files.name, files, {
      bucket: "deploy-carbonlakesharedr-carbonlakelandingbuckete-6cr1pvdcsshv",
      progressCallback(progress) {
      console.log('Uploading CSV File to S3 Bucket ...');
      console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
    },
      level: 'public',
      contentType: files.type,
  
      
    });
  };

  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              <img src="./images/AWS_logo_RGB_REV.png" className="intro-logo" alt="bob ross picture" />
            </Box>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                AWS CarbonLake
              </Box>
              <Box fontSize="display-l" padding={{ bottom: 's' }} fontWeight="light" color="inherit">
                Data Uploader
              </Box>
              <Box fontWeight="light">
                <span className="custom-home__header-sub-title">
                  Upload your files below to start the pipeline.
                </span>
              </Box>
            </div>``
          </Box>
        </Grid>
      </div>
{/* Start How it works section */}
      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
      <form onSubmit={e => e.preventDefault()}>
      <Form
      actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link" onClick={cancelButton}>
              Cancel
            </Button>
            <Button onClick={uploadFile} variant="primary">Upload</Button>
          </SpaceBetween>
        }
        header={
          <Header
            variant="h1"
            description="Add the file you want to upload to S3. To upload a file larger than 160GB, use the AWS CLI, AWS SDK or Amazon S3 REST API"
          >
            Upload
          </Header>
        }
      >
        <Container
          header={
            <Header variant="h2"
              actions={
        <SpaceBetween direction="horizontal" size="s">
          <Button onClick={removeButton} disabled={!remove}> Remove </Button>
          <input type="file" accept=".csv" id="csv-file" hidden="hidden" style={{ "display": "none" }} ref={fileInput} onChange={handleFileInput}/>
          <Button iconName="file" id="csv-buttom" onClick={selectFile}> Add File </Button>
        </SpaceBetween>
      }
            >
              File
            </Header>
          }
        > 
      
      <Table
      columnDefinitions={COLUMN_DEFINITIONS}
      items={data}
      sortingDisabled
      empty={
        <Box textAlign="center" color="inherit">
          <b>No files or folders</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            You have not chosen any files or folders to upload.
          </Box>
        </Box>
      }
    />
        </Container>
      </Form>
    </form>
            {

            /* <Container>
              <div>
                <ol>
                  <li>
                      Navigate to the "CarbonLake Uploader" page and browse for your file.
                    <br />
                  </li>
                  <li>
                    This will upload your file to the "INGEST" S3 bucket which will trigger a the pipeline to run automatically.
                    The file will be validated to ensure it conforms to our schema, and if successful will continue down the pipeline.
                    Once finished, the file will be visible in the "Visualizations" (make this a link later) page.
                    Currently, you are viewing this page on your localhost as <a>localhost:3000/#/</a> because it is
                    routed as the 'default' page. All of the included templates are already routed and included in the
                    side navigation you see in the left panel of this page. The urls are defined in{' '}
                    <code>src/components/App.jsx</code> (below right). You can learn more about
                    <code>&lt;Routing&gt;</code>{' '}
                    <a href="https://reacttraining.com/react-router/web/api/HashRouter">here</a>
                    .
                    <br />
                  </li>
                  <li>
                    Try viewing the service homepage template page (below) by adding "<strong>service-home</strong>" to
                    the end of the url in your browser: <Link to="service-home">localhost:3000/#/service-home</Link>.
                    When you hit enter you should be redirected to a new page showing the service homepage template.
                    <br />
                  </li>
                  <li>
                    Edit the service homepage template in the <code>ServiceHomepage.jsx</code> file.
                    <br />
                    Save your work to see the results on this page.
                    <br />
                  </li>
                </ol>
              </div>
            </Container>

          /*
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
                      <a href="#">
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
                      <a href="#">service homepage</a>,
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
                      <a href="#">
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
                      A working <a href="#">table view</a>{' '}
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
<HelpTools/>
