/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {existingAPI, existingAuth} from '../config/amplify-config';
import { API, graphqlOperation } from 'aws-amplify';
import { getAllJobs, getAllJobsPaginated, getOneJob } from '../graphql/queries';
import { deleteOneJob } from '../graphql/mutations';


import Sidebar from '../common/components/Sidebar';
// import ServiceNavigation from './ServiceNavigation.jsx';
import TopNavigationHeader from '../common/components/TopNavigationHeader';
import HelpTools from '../common/components/HelpTools';
import {
  COLUMN_DEFINITIONS,
  // CONTENT_SELECTOR_OPTIONS,
  // PAGE_SELECTOR_OPTIONS,
  // CUSTOM_PREFERENCE_OPTIONS,
  DEFAULT_PREFERENCES
} from './TCAJobs/TCAJobsTable/table-property-filter-config';
// import {
//   COLUMN_DEFINITIONS,
//   CONTENT_SELECTOR_OPTIONS,
//   PAGE_SELECTOR_OPTIONS,
//   CUSTOM_PREFERENCE_OPTIONS,
//   DEFAULT_PREFERENCES
// } from '../pages/TCAJobsCopy/TCAJobsTable/table-config-copy';
// } from '../pages/TCAJobsCopy/TCAJobsTable/table-config';
import {
  AppLayout,
  Header,
  SpaceBetween,
  Box,
  BreadcrumbGroup,
  Button,
  Flashbar,
  CollectionPreferences,
  Pagination,
  TextFilter,
  Table,
  FormField,
  RadioGroup,
  HelpPanel,
  Icon
} from '@cloudscape-design/components';

import { useCollection } from '@cloudscape-design/collection-hooks';


import { Navigation } from '../common/common-components-config'

// Component TableView is a skeleton of a Table using AWS-UI React components.
export default () => {

  return (
    <>
    {/* <TestComponent/> */}
    {/* <TopNavigationHeader/> */}
    {/* <Navigation /> */}

    {/* <Sidebar /> */}
      {/* <AppLayout
      navigation={<Sidebar activeHref="#/" />}
      // navigation={<Sidebar activeHref="#/" items={navItems}/>}
      tools={<HelpTools/>}
      headerSelector='#h'
      disableContentPaddings={true}
      // toolsHide={true}

      // notifications={<FlashMessage />}
      breadcrumbs={<Breadcrumbs />}
      content={<DetailsTable />}
      contentType="table"
      // tools={Tools}
      /> */}
      </>

  );
};

const DetailsTable = () => {

const [transcripts, setTranscripts] = useState([])
const [selectedTranscripts, setSelectedTranscripts] = useState([]);

  // Below are variables declared to maintain the table's state.
  // Each declaration returns two values: the first value is the current state, and the second value is the function that updates it.
  // They use the general format: [x, setX] = useState(defaultX), where x is the attribute you want to keep track of.
  // For more info about state variables and hooks, see https://reactjs.org/docs/hooks-state.html.
  const [distributions, setDistributions] = useState([]);
  const [selectedDistributions, setSelectedDistributions] = useState([]);

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // a utility to handle operations on the data set (such as filtering, sorting and pagination)
  const { items, actions, collectionProps, filterProps, paginationProps, filteredItemsCount } = useCollection(
    transcripts,
    {
      pagination: { pageSize: preferences.pageSize },
      sorting: {},
      filtering: {
        noMatch: (
          <Box textAlign="center" color="inherit">
            <b>No matches</b>
            <Box color="inherit" margin={{ top: 'xxs', bottom: 's' }}>
              No results match your query
            </Box>
            <Button onClick={() => actions.setFiltering('')}>Clear filter</Button>
          </Box>
        )
      }
    }
  );


  useEffect(()=> {
    fetchTranscripts()
  }, [] )

const fetchTranscripts = async () => {
  try{
      const transcriptData = await API.graphql(graphqlOperation(getAllJobs, {limit:10000}));
      const transcriptsDataList = transcriptData.data.getAllJobs.items
      console.log('Transcript List', transcriptsDataList)
      setTranscripts(transcriptsDataList)
      setLoading(false)
  } catch (error) {
    console.log('error on fetching transcripts', error)
  }
};

  // Keeps track of how many emissions are selected
  function headerCounter(selectedTranscripts, transcripts) {
    return selectedTranscripts.length
      ? `(${selectedTranscripts.length} of ${transcripts.length})`
      : `(${transcripts.length})`;
  }

  function filterCounter(count) {
    return `${count} ${count === 1 ? 'match' : 'matches'}`;
  }

  return (
    <>

    {/* <Table
      {...collectionProps}
      variant="full-page"
      columnDefinitions={COLUMN_DEFINITIONS}
      visibleColumns={preferences.visibleContent}
      items={items}
      loading={loading}
      loadingText="Loading resources"
      header={
        <TableHeader
          selectedTranscripts={selectedTranscripts}
          counter={headerCounter(selectedTranscripts, transcripts)}
        />
      }
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
          pageSizePreference={{
            title: 'Page size',
            options: PAGE_SELECTOR_OPTIONS
          }}
          visibleContentPreference={{
            title: 'Select visible columns',
            options: CONTENT_SELECTOR_OPTIONS
          }}
          wrapLinesPreference={{
            label: 'Wrap lines',
            description: 'Check to see all the text and wrap the lines'
          }}
          customPreference={(value, setValue) => (
            <FormField stretch={true} label="View as">
              <RadioGroup
                value={value}
                onChange={({ detail }) => setValue(detail.value)}
                items={CUSTOM_PREFERENCE_OPTIONS}
              />
            </FormField>
          )}
        />
      }
      wrapLines={preferences.wrapLines}
      selectedItems={selectedTranscripts}
      onSelectionChange={({ detail }) => setSelectedTranscripts(detail.selectedItems)}
      selectionType="multi"
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={filterCounter(filteredItemsCount)}
          filteringPlaceholder="Search transcript records"
        />
      }
    /> */}
        </>
  );
};

// Table header content, shows how many distributions are selected and contains the action stripe
const TableHeader = ({ selectedTranscripts, counter }) => {
  const isOnlyOneSelected = selectedTranscripts.length === 1;
  const navigate = useNavigate();

  return (
    <>

    {/* <Header
      variant="awsui-h1-sticky"
      counter={counter}
      actions={
        <SpaceBetween direction="horizontal" size="s">
          <Button disabled={!isOnlyOneSelected}> View details </Button>
          <Button disabled={!isOnlyOneSelected}> Edit</Button>
          <Button disabled={selectedTranscripts.length === 0}> Delete</Button>
          <Button onClick={() => navigate("/data-uploader")} variant="primary">
            Upload File
          </Button>
        </SpaceBetween>
      }
    >
      Transcripts
    </Header> */}
    </>
  );
};

// Breadcrumb content
const Breadcrumbs = () => (
  <>
  {/* <BreadcrumbGroup
    items={[
      {
        text: 'Data Explorer',
        href: '#/service-home'
      },
      {
        text: 'TCA Jobs',
        href: '#/table'
      }
    ]}
    /> */}
    </>
);

// Flash message content
const FlashMessage = () => {
  const [items, setItems] = useState([
    {
      type: 'success',
      dismissible: true,
      onDismiss: () => setItems([]),
      content: 'Resource created successfully'
    }
  ]);
  return <Flashbar items={items} />;
};

// Help (right) panel content
// Overwritten by main help panel in src/components/HelpTools/index.jsx
const Tools = [
  <HelpPanel
    header={<h2>Emission Records</h2>}
    footer={
      <div>
        <h3>
          Learn more <Icon name="external" />
        </h3>
        <ul>
          <li>
            <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html">
              Working with distributions
            </a>
          </li>
          <li>
            <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-returned.html">
              Values that CloudFront displays on the console
            </a>
          </li>
        </ul>
      </div>
    }
  >
    <p>
      View your current distributions and related information such as the associated domain names, delivery methods, SSL
      certificates, and more. To drill down even further into the details, choose the name of an individual
      distribution.
    </p>
  </HelpPanel>
];
