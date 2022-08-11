/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components.

************************************************************************/
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {existingAPI, existingAuth} from '../amplify-config';
import { API, graphqlOperation } from 'aws-amplify';
import { all, getOne } from '../graphql/queries';

import DataProvider from '../resources/data-provider';
import Sidebar from '../components/Sidebar';
// import ServiceNavigation from './ServiceNavigation.jsx';
import TopNavigationHeader from '../components/TopNavigationHeader';
import HelpTools from '../components/HelpTools';
import {
  COLUMN_DEFINITIONS,
  CONTENT_SELECTOR_OPTIONS,
  PAGE_SELECTOR_OPTIONS,
  CUSTOM_PREFERENCE_OPTIONS,
  DEFAULT_PREFERENCES
} from '../resources/table/table-config.jsx';
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

// Component TableView is a skeleton of a Table using AWS-UI React components.
export default () => {
  return (
    <>
    <TopNavigationHeader/>

    {/* <Sidebar /> */}
      <AppLayout
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
      />
      </>

  );
};

const DetailsTable = () => {

const [emissions, setEmissions] = useState([])
const [selectedEmissions, setSelectedEmissions] = useState([]);

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
    emissions,
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
    fetchEmissions()
  }, [] )

const fetchEmissions = async () => {
  try{
      const emissionData = await API.graphql(graphqlOperation(all, {limit:10000}));
      const emissionsDataList = emissionData.data.all.items
      console.log('Emissions List', emissionsDataList)
      setEmissions(emissionsDataList)
      setLoading(false)
  } catch (error) {
    console.log('error on fetching emissions', error)
  }
};

  // Keeps track of how many emissions are selected
  function headerCounter(selectedEmissions, emissions) {
    return selectedEmissions.length
      ? `(${selectedEmissions.length} of ${emissions.length})`
      : `(${emissions.length})`;
  }

  function filterCounter(count) {
    return `${count} ${count === 1 ? 'match' : 'matches'}`;
  }

  return (
    <Table
      {...collectionProps}
      variant="full-page"
      columnDefinitions={COLUMN_DEFINITIONS}
      visibleColumns={preferences.visibleContent}
      items={items}
      loading={loading}
      loadingText="Loading resources"
      header={
        <TableHeader
          selectedEmissions={selectedEmissions}
          counter={headerCounter(selectedEmissions, emissions)}
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
      selectedItems={selectedEmissions}
      onSelectionChange={({ detail }) => setSelectedEmissions(detail.selectedItems)}
      selectionType="multi"
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={filterCounter(filteredItemsCount)}
          filteringPlaceholder="Search emission records"
        />
      }
    />
  );
};

// Table header content, shows how many distributions are selected and contains the action stripe
const TableHeader = ({ selectedEmissions, counter }) => {
  const isOnlyOneSelected = selectedEmissions.length === 1;
  const navigate = useNavigate();

  return (
    <Header
      variant="awsui-h1-sticky"
      counter={counter}
      actions={
        <SpaceBetween direction="horizontal" size="s">
          <Button disabled={!isOnlyOneSelected}> View details </Button>
          <Button disabled={!isOnlyOneSelected}> Edit</Button>
          <Button disabled={selectedEmissions.length === 0}> Delete</Button>
          <Button onClick={() => navigate("/data-uploader")} variant="primary">
            Upload Emission Record
          </Button>
        </SpaceBetween>
      }
    >
      Emission Records
    </Header>
  );
};

// Breadcrumb content
const Breadcrumbs = () => (
  <BreadcrumbGroup
    items={[
      {
        text: 'Carbon Explorer',
        href: '#/service-home'
      },
      {
        text: 'Emission Records',
        href: '#/table'
      }
    ]}
  />
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
