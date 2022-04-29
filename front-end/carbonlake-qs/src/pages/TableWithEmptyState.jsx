/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components. For production code, follow the integration
guidelines:

https://polaris.a2z.com/develop/integration/react/
************************************************************************/
import React, { useState } from 'react';
import ServiceNavigation from './ServiceNavigation.jsx';
import { COLUMN_DEFINITIONS } from '../resources/table-alarms/table-config.jsx';
import { AppLayout, Header, SpaceBetween, Box, BreadcrumbGroup, Button, Table } from '@awsui/components-react';

import { useCollection } from '@amzn/awsui-collection-hooks';

export default () => {
  return (
    <AppLayout
      navigation={<ServiceNavigation />} // Navigation panel content imported from './ServiceNavigation.jsx'
      breadcrumbs={<Breadcrumbs />}
      content={<AlarmsTable />}
      contentType="table"
      toolsHide={true}
    />
  );
};

const AlarmsTable = () => {
  const alarms = [];

  // Below are variables declared to maintain the table's state.
  // Each declaration returns two values: the first value is the current state, and the second value is the function that updates it.
  // They use the general format: [x, setX] = useState(defaultX), where x is the attribute you want to keep track of.
  // For more info about state variables and hooks, see https://reactjs.org/docs/hooks-state.html.
  const [selectedAlarms, setSelectedAlarms] = useState([]);

  // a utility to handle operations on the data set (such as filtering, sorting and pagination)
  // https://polaris.a2z.com/develop/guides/collection_hooks/
  const { items, collectionProps } = useCollection(alarms, {
    pagination: {},
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit">
          <b>No alarms</b>
          <Box padding={{ bottom: 's' }} variant="p" color="inherit">
            You don't have any alarms in us-east-1a.
          </Box>
          <Button href="#/create">Create alarm</Button>
        </Box>
      )
    }
  });

  // Keeps track of how many alarms are selected
  function headerCounter(selectedAlarms, alarms) {
    if (alarms.length === 0) return null;

    return selectedAlarms.length ? `(${selectedAlarms.length} of ${alarms.length})` : `(${alarms.length})`;
  }

  return (
    <Table
      {...collectionProps}
      variant="full-page"
      columnDefinitions={COLUMN_DEFINITIONS}
      items={items}
      header={<TableHeader selectedAlarms={selectedAlarms} counter={headerCounter(selectedAlarms, alarms)} />}
      selectedItems={selectedAlarms}
      onSelectionChange={({ detail }) => setSelectedAlarms(detail.selectedItems)}
      selectionType="multi"
    />
  );
};

// Table header content, shows how many alarms are selected and contains the action stripe
const TableHeader = ({ selectedAlarms, counter }) => {
  const isOnlyOneSelected = selectedAlarms.length === 1;

  return (
    <Header
      variant="awsui-h1-sticky"
      counter={counter}
      actions={
        <SpaceBetween direction="horizontal" size="s">
          <Button disabled={!isOnlyOneSelected}>View details</Button>
          <Button disabled={!isOnlyOneSelected}>Edit</Button>
          <Button disabled={selectedAlarms.length === 0}>Delete</Button>
          <Button href="#/create" variant="primary">
            Create alarm
          </Button>
        </SpaceBetween>
      }
    >
      Alarms
    </Header>
  );
};

// Breadcrumb content
const Breadcrumbs = () => (
  <BreadcrumbGroup
    items={[
      {
        text: 'CloudFront',
        href: '#/service-home'
      },
      {
        text: 'Alarms',
        href: '#/table-empty'
      }
    ]}
  />
);
