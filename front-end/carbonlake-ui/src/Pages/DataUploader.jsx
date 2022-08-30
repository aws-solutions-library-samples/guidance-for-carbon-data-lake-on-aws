/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components.

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
  Table,
  Alert,
  Flashbar,
  ProgressBar
} from '@cloudscape-design/components';

import '../styles/intro.scss';
import '../styles/servicehomepage.scss';

import {COLUMN_DEFINITIONS} from '../resources/table_uploader/table-config'


// Amplify
import Amplify, { Auth, Storage, API, graphqlOperation } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { forEachLeadingCommentRange } from 'typescript';
import {existingS3} from '../amplify-config-template';


Amplify.configure(existingS3);


// This is not meant to be a template, rather it is the
// introduction page that you see upon loading the webserver.

const DataUploader = () => {
  return (
    <>
    <TopNavigationHeader/>
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

  const [visibleAlert, setVisibleAlert] = useState(false);
  const [visibleInfo, setVisibleInfo] = useState(true);

  const [alertType, setAlertType] = useState("");
  const [alertContent, setAlertContent] = useState("");

  const [filePercentUploaded, setFilePercentUploaded] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [fileDescription, setFileDescription] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)

  const [fileUploadStatus, setFileUploadStatus] = useState("-")
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = useState("-")

  const [showUploadingFlashbar, setShowUploadingFlashbar] = useState(false);
  const [showSuccessFlashbar, setShowSuccessFlashbar] = useState(false)
  const [showErrorFlashbar, setShowErrorFlashbar] = useState(false)
  const [flashbarItems, setFlashbarItems] = useState([])

  const [disableCancelButton, setDisableCancelButton] = useState(true)
  const [disableUploadButton, setDisableUploadButton] = useState(true)
  const [disableRemoveButton, setDisableRemoveButton] = useState(true)
  const [disableAddFileButton, setDisableAddFileButton] = useState(false)

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
          // size: `${Math.ceil(e.target.files[0].size / 1000000)} MB`
          // Convert bytes to MB and round to nearest hundredth (2 decimal places)
          size: `${(e.target.files[0].size / 1000000).toFixed(2)} MB`,
          status: fileUploadStatus,
          error: fileUploadErrorMessage
        }
      ])
    setRemove(true)
    e.target.value = null
    // setShowUploadingFlashbar(false)
    setShowSuccessFlashbar(false)
    setShowErrorFlashbar(false)
    setDisableCancelButton(false)
    setDisableUploadButton(false)
    setDisableRemoveButton(false)
  };

  const removeButton = () => {
    setData([])
    setRemove(false)
    setShowErrorFlashbar(false)
    setDisableRemoveButton(true)
    setDisableCancelButton(true)
    setDisableUploadButton(true)
  };

  const cancelFileUpload = () => {
    setFiles(null);
    setData([])
    setRemove(false)
    setVisibleAlert(false)

    setShowUploadingFlashbar(false)
    setShowSuccessFlashbar(false)
    setShowErrorFlashbar(false)
    setDisableRemoveButton(true)
    setDisableCancelButton(true)
    setDisableAddFileButton(false)
    // setDisableUploadButton(false) HERE


  };

  const uploadFile = async () => {
    setShowUploadingFlashbar(true)
    setShowSuccessFlashbar (false)
    setShowErrorFlashbar(false)
    setDisableCancelButton(true)
    setDisableUploadButton(true)
    setDisableRemoveButton(true)
    setDisableAddFileButton(true)
    try{
      setAlertType('success');
      setAlertContent('File was uploaded successfully');

      const put_tca_file = await Storage.put(files.name, files, {
        // bucket: "your-bucket-name", - use this parameter to add to bucket beyond amplify-config
        // bucket: outputsJSON.outputs.tca_app_storage_bucket.value,
        progressCallback(progress) {
          const percent_uploaded = Math.floor((progress.loaded/progress.total)*100)
          console.log('Uploading file to S3 Bucket ...');
          console.log(`Uploaded: ${progress.loaded}/${progress.total} | ${percent_uploaded}%`);
          setFilePercentUploaded (percent_uploaded)
          setFileName (files.name)

          setFlashbarItems([
            {
              type: "success",
              content: `File: ${files.name} has been successfully uploaded.`,
              // action: <Button>View Emission Records</Button>, // TODO - make this nav to emission records page
              dismissible: true,
              dismissLabel: "Dismiss message",
              onDismiss: () => setShowSuccessFlashbar(false),
              id: "success_message_1"
          }
          ])

        },
        // level: 'public',
        customPrefix: {
          public: ''
        },
        contentType: files.type,

      });


      // setVisibleAlert(true) // old success method
      setShowSuccessFlashbar(true) // show success flashbar when Storage.put() is successfully completed
      setShowUploadingFlashbar(false) // hide uploading flashbar when Storage.put() is successfully completed
      setDisableCancelButton(false) // allow cancel button to work again when Storage.put() is successfully completed
      setData([])
      setDisableCancelButton(true)
      setDisableAddFileButton(false)
      // setFileUploadStatus('Successful')

    } catch (err) {
    console.log('Error uploading file:', err);
    // old error alerting
    // setAlertType('error');
    // setAlertContent('Error uploading file: Unauthorized', err)
    // setVisibleAlert(true)

    setFlashbarItems([
      {
        type: "error",
        content: `Error 403: File could not be uploaded. Ensure you have the necessary permissions and try again.`,
        // content: `Error 403: File could not be uploaded. Ensure you have the necessary permissions and try again.,${err}`,
        action: <Button onClick={uploadFile}>Try again</Button>,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setShowErrorFlashbar(false),
        id: "error_message_1"

    }
    ])
    setShowUploadingFlashbar(false) //hide uploading flashbar if error occurs
    setShowErrorFlashbar(true) // show error message if file cannot be uploaded successfully
    setDisableCancelButton(false) // allow cancel button to work again if file cannot be uploaded successfully
    setDisableAddFileButton(false)
    setDisableRemoveButton(false)

    // setFileUploadStatus('Failed')
    // setFileUploadErrorMessage('403: Unauthorized')

  }
  };

  return (

<div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <Box margin={{ bottom: 's' }}>
              <img src="./images/AWS_logo_RGB_REV.png" className="intro-logo" alt="aws logo" />
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
          { visibleInfo &&
            <Flashbar
              items={[
                {
                  type: 'info',
                  dismissible: true,
                  onDismiss: () => setVisibleInfo(false),
                  content: (
                    <>
                    We currently support single file upload. Multi-file upload is coming in
                    future releases. Please upload one file at a time.
                    {/* <br />
                    <br />
                    For more information, see the
                    {" "}
                    link
                    <Link color="inverted">
                      a link to another page
                    </Link>
                    . */}
                  </>
                  ),
                  id: "info_message_1"
                }
              ]}
            />
          }

          {/* <Alert
            onDismiss={() => setVisibleInfo(false)}
            dismissible = "true"
            visible={visibleInfo}
            dismissAriaLabel="Close alert"
            header="File Upload Guidance"
          >
             We currently support single file upload. Multi-file upload is coming in future releases. Please upload one file at a time.
          </Alert> */}
          <div>

      {/* Show uploading flashbar if showUploadingFlashbar is true (if upload is in progress) */}
      {showUploadingFlashbar &&
      <Flashbar
      items={[
        {
          loading : true,
          type: 'info',
          content: (
            <ProgressBar
              value={filePercentUploaded}
              variant="flash"
              // additionalInfo="Transfer Rate:" // TODO - add calculation for transfer rate
              description={fileName}
              label="Uploading..."
            />
          ),
          id: "progressbar_1"
        }
      ]}
      />
      }

      {/* Show success flashbar if showSuccessFlashbar is true (if upload is successful) */}
      {
        showSuccessFlashbar && <Flashbar items={flashbarItems} />
      }

      {/* Show error flashbar if showErrorFlashbar is true (if upload is unsuccessful) */}
      {
        showErrorFlashbar && <Flashbar items={flashbarItems} />
      }


      <form onSubmit={e => e.preventDefault()}>
      <Alert
          onDismiss={() => setVisibleAlert(false)}
          visible={visibleAlert}
          dismissAriaLabel="Close alert"
          dismissible
          type={alertType}
        >
          {alertContent}
        </Alert>

      <Form
        actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button disabled = {disableCancelButton} formAction="none" variant="link" onClick={cancelFileUpload}>
                Cancel
              </Button>
              <Button disabled = {disableUploadButton} onClick={uploadFile} variant="primary">Upload</Button>
            </SpaceBetween>
          }
        header={
          <Header
            variant="h1"
            description="Add the file you want to upload to S3. To upload a file larger than 160GB, use the AWS CLI, AWS SDK or Amazon S3 REST API."
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
          <Button onClick={removeButton} disabled={disableRemoveButton}> Remove </Button>
          <input type="file" accept=".csv" id="carbonlake-file" hidden="hidden" style={{ "display": "none" }} ref={fileInput} onChange={handleFileInput}/>
          <Button disabled = {disableAddFileButton} iconName="file" id="carbonlake-button" onClick={selectFile}> Add File </Button>
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
          <b>No files</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            You have not chosen any files to upload.
          </Box>
        </Box>
      }
    />
        </Container>
      </Form>
    </form>
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>
  )
}
<HelpTools/>
