/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/

import React, { useState, useEffect } from 'react';
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  PropertyFilter,
  Pagination,
  Table
 } from '@cloudscape-design/components';



import { API, graphqlOperation } from 'aws-amplify';
import { listActivities } from '../../../graphql/operations';
// import { delete } from '../../../graphql/mutations';

import { getFilterCounterText } from '../../../common/resources/tableCounterStrings';
import { FullPageHeader } from '..';
import {
  TableNoMatchState,
} from '../../../common/common-components-config';
import {  EmissionsTableEmptyState } from '../../EmissionsRecords'
import { paginationLabels, emissionSelectionLabels } from '../labels';
import {
  FILTERING_PROPERTIES,
  PROPERTY_FILTERING_I18N_CONSTANTS,
} from './table-property-filter-config';
import { DEFAULT_PREFERENCES, Preferences } from './table-property-filter-config';

import '../../../common/styles/base.scss'
import { useLocalStorage } from '../../../common/resources/localStorage';




const EmissionsTable = ({ updateTools, saveWidths, columnDefinitions }) => {
  // Below are variables declared to maintain the table's state.
  // Each declaration returns two values: the first value is the current state, and the second value is the function that updates it.
  // They use the general format: [x, setX] = useState(defaultX), where x is the attribute you want to keep track of.
  // For more info about state variables and hooks, see https://reactjs.org/docs/hooks-state.html.

  const [emissions, setEmissions] = useState([])
  const [selectedEmissions, setSelectedEmissions] = useState([]);


  const [preferences, setPreferences] = useLocalStorage('React-EmissionsTable-Preferences', DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

    // a utility to handle operations on the data set (such as filtering, sorting and pagination)
  const { items, actions, filteredItemsCount, collectionProps, paginationProps, propertyFilterProps } = useCollection(
    emissions,
    {
      propertyFiltering: {
        filteringProperties: FILTERING_PROPERTIES,
        empty: <EmissionsTableEmptyState resourceName="Emissions Records" />,
        noMatch: (
          <TableNoMatchState
            onClearFilter={() => {
              actions.setPropertyFiltering({ tokens: [], operation: 'and' });
            }}
          />
        ),
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
      selection: {},
    }
  );

  useEffect(()=> {
    fetchEmissions()
  }, [] )

  const fetchEmissions = async () => {
    try{
        const emissionData = await API.graphql(graphqlOperation(listActivities, {limit:10000}));
        const emissionsDataList = emissionData.data.listActivities.items
        console.log('Emissions List', emissionsDataList)
        setEmissions(emissionsDataList)
        setLoading(false)
    } catch (error) {
      console.log('error on fetching emissions', error)
    }
  };

  return (
    <Table
      {...collectionProps}
      items={items}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleContent}
      ariaLabels={emissionSelectionLabels}
      selectionType="multi"
      variant="full-page"
      stickyHeader={true}
      resizableColumns={true}
      wrapLines={preferences.wrapLines}
      onColumnWidthsChange={saveWidths}
      header={
        <FullPageHeader
          selectedItems={collectionProps.selectedItems}
          totalItems={emissions}
          updateTools={updateTools}
          serverSide={false}
        />
      }
      loading={loading}
      loadingText="Loading Emissions Data..."
      filter={
        <PropertyFilter
          i18nStrings={PROPERTY_FILTERING_I18N_CONSTANTS}
          {...propertyFilterProps}
          countText={getFilterCounterText(filteredItemsCount)}
          expandToViewport={true}
        />
      }
      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
      preferences={<Preferences preferences={preferences} setPreferences={setPreferences} />}
    />
  );
}

export default EmissionsTable;

