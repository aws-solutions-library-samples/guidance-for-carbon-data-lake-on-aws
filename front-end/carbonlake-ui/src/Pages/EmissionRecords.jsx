import React, { useState, useEffect } from 'react';
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
} from '@awsui/components-react';

import { useCollection } from '@awsui/collection-hooks';

// Component TableView is a skeleton of a Table using AWS-UI React components.
export default () => {
  return (
    <>
    <TopNavigationHeader/>


{/* TODO - Connect this to GraphQL API and fetch correct data */}

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
  // Below are variables declared to maintain the table's state.
  // Each declaration returns two values: the first value is the current state, and the second value is the function that updates it.
  // They use the general format: [x, setX] = useState(defaultX), where x is the attribute you want to keep track of.
  // For more info about state variables and hooks, see https://reactjs.org/docs/hooks-state.html.
  const [distributions, setDistributions] = useState([]);
  const [selectedDistributions, setSelectedDistributions] = useState([]);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // a utility to handle operations on the data set (such as filtering, sorting and pagination)
  // https://polaris.a2z.com/develop/guides/collection_hooks/
  const { items, actions, collectionProps, filterProps, paginationProps, filteredItemsCount } = useCollection(
    distributions,
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

  // fetch distributions after render of the component
  useEffect(() => {
    new DataProvider().getData('distributions', distributions => {
      setDistributions(distributions);
      setLoading(false);
      console.log(distributions)
    });
  }, []);

  // Keeps track of how many distributions are selected
  function headerCounter(selectedDistributions, distributions) {
    return selectedDistributions.length
      ? `(${selectedDistributions.length} of ${distributions.length})`
      : `(${distributions.length})`;
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
          selectedDistributions={selectedDistributions}
          counter={headerCounter(selectedDistributions, distributions)}
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
      selectedItems={selectedDistributions}
      onSelectionChange={({ detail }) => setSelectedDistributions(detail.selectedItems)}
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
const TableHeader = ({ selectedDistributions, counter }) => {
  const isOnlyOneSelected = selectedDistributions.length === 1;

  return (
    <Header
      variant="awsui-h1-sticky"
      counter={counter}
      actions={
        <SpaceBetween direction="horizontal" size="s">
          <Button disabled={!isOnlyOneSelected}> View details </Button>
          <Button disabled={!isOnlyOneSelected}> Edit</Button>
          <Button disabled={selectedDistributions.length === 0}> Delete</Button>
          <Button href="#/create" variant="primary">
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
