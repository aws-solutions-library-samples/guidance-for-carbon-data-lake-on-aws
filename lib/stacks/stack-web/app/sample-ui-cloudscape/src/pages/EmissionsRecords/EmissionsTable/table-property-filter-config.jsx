import React from 'react';
import { CollectionPreferences, FormField, RadioGroup, StatusIndicator, Link } from '@cloudscape-design/components';
import { addColumnSortLabels } from '../labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'activity_event_id',
    header: 'Activity Event ID',
    cell: item => <Link>{item.activity_event_id}</Link>,
    minWidth: 180,
    sortingField: 'activity_event_id'
  },
  {
    id: 'activity',
    cell: item => item.activity,
    header: 'Activity',
    minWidth: 160,
    sortingField: 'activity'
  },
  {
    id: 'asset_id',
    header: 'Asset ID',
    cell: item => item.asset_id,
    minWidth: 100,
    maxWidth: 200,
    sortingField: 'asset_id'
  },
  {
    id: 'category',
    header: 'Category',
    cell: item => item.category,
    minWidth: 100,
    maxWidth: 200,
    sortingField: 'category'
  },

  {
    id: 'emissions_output',
    header: 'Emissions Output',
    cell: item => item.emissions_output,
    minWidth: 100,
    sortingField: 'emissions_output'
  },
  {
    id: 'geo',
    header: 'Geo',
    cell: item => item.geo,
    minWidth: 100,
    sortingField: 'geo'
  },
  {
    id: 'origin_measurement_timestamp',
    header: 'Origin Measurement Timestamp',
    cell: item => item.origin_measurement_timestamp,
    minWidth: 100,
    sortingField: 'origin_measurement_timestamp'
  },
  {
    id: 'raw_data',
    header: 'Raw Data',
    cell: item => item.raw_data,
    minWidth: 100,
    sortingField: 'raw_data'
  },
  {
    id: 'scope',
    header: 'Scope',
    cell: item => item.scope,
    minWidth: 100,
    sortingField: 'scope'
  },
  {
    id: 'source',
    header: 'Source',
    cell: item => item.source,
    minWidth: 100,
    sortingField: 'source'
  },
  {
    id: 'units',
    header: 'Units',
    cell: item => item.units,
    minWidth: 100,
    sortingField: 'units'
  },
  // This eventually could be used for error handling
  // Could maybe have State of 'Verified', 'Unverified', 'Failed', etc. to give more info
  {
     id: 'status',
     header: 'status',
    //  cell: item => item.JobStatus,
     cell: item => (
      item.status,
       <StatusIndicator type={item.state === 'Disabled' ? 'error' : 'success'}> {item.state}{item.status}</StatusIndicator>
     ),
     minWidth: 100,
     sortingField: 'JobStatus'
   },
]);

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Emissions' },
  { value: 30, label: '30 Emissions' },
  { value: 50, label: '50 Emissions' },
  { value: 100, label: '100 Emissions' },
];

export const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'Activity Event ID',
    key: 'activity_event_id',
    groupValuesLabel: 'Activity Event ID values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Activity',
    key: 'activity',
    groupValuesLabel: 'Activity values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Asset ID',
    key: 'asset_id',
    groupValuesLabel: 'Asset ID values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Geo',
    key: 'geo',
    groupValuesLabel: 'Geo values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Category',
    key: 'category',
    groupValuesLabel: 'Category values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Origin Measurement Timestamp',
    key: 'origin_measurement_timestamp',
    groupValuesLabel: 'Origin Measurement Timestamp values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Raw Data',
    key: 'raw_data',
    groupValuesLabel: 'Raw Data values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Scope',
    key: 'scope',
    groupValuesLabel: 'Scope values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Source',
    key: 'source',
    groupValuesLabel: 'Units values',
    operators: [':', '!:', '=', '!='],
  },
];

export const PROPERTY_FILTERING_I18N_CONSTANTS = {
  filteringAriaLabel: 'your choice',
  dismissAriaLabel: 'Dismiss',

  filteringPlaceholder: 'Search',
  groupValuesText: 'Values',
  groupPropertiesText: 'Properties',
  operatorsText: 'Operators',

  operationAndText: 'and',
  operationOrText: 'or',

  operatorLessText: 'Less than',
  operatorLessOrEqualText: 'Less than or equal',
  operatorGreaterText: 'Greater than',
  operatorGreaterOrEqualText: 'Greater than or equal',
  operatorContainsText: 'Contains',
  operatorDoesNotContainText: 'Does not contain',
  operatorEqualsText: 'Equals',
  operatorDoesNotEqualText: 'Does not equal',

  editTokenHeader: 'Edit filter',
  propertyText: 'Property',
  operatorText: 'Operator',
  valueText: 'Value',
  cancelActionText: 'Cancel',
  applyActionText: 'Apply',
  allPropertiesLabel: 'All properties',

  tokenLimitShowMore: 'Show more',
  tokenLimitShowFewer: 'Show fewer',
  clearFiltersText: 'Clear filters',
  removeTokenButtonAriaLabel: () => 'Remove token',
  enteredTextLabel: text => `Use: "${text}"`,
};
export const CUSTOM_PREFERENCE_OPTIONS = [{ value: 'table', label: 'Table' }, { value: 'cards', label: 'Cards' }];
export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent:[
    'activity_event_id',
    'activity',
    'asset_id',
    'category',
    'emissions_output',
    'origin_measurement_timestamp',
    'geo',
    'raw_data',
    'source',
    'scope',
    'units',
    // 'state',
  ],
   wraplines: false,
   custom: CUSTOM_PREFERENCE_OPTIONS[0].value
};

export const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main emission properties',
    options: [
      { id: 'activity_event_id', label: 'Activity Event ID', editable: false },
      { id: 'activity', label: 'Asset ID', editable: true },
      { id: 'asset_id', label: 'Activity', editable: true },
      { id: 'category', label: 'Category', editable: true },
      { id: 'emissions_output', label: 'Emissions Output', editable: true },
      { id: 'origin_measurement_timestamp', label: 'Origin Measurement Timestamp', editable: true },
      { id: 'geo', label: 'Geo', editable: true },
      { id: 'raw_data', label: 'Raw Data', editable: true },
      { id: 'source', label: 'Source', editable: true },
      { id: 'scope', label: 'Scope', editable: true },
      { id: 'units', label: 'Units', editable: true },
      // { id: 'state', label: 'State', editable: true },

    ]
  }
];
export const Preferences = ({
  preferences,
  setPreferences,
  disabled,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  visibleContentOptions = VISIBLE_CONTENT_OPTIONS,
}) => (
  <CollectionPreferences
    title="Preferences"
    confirmLabel="Confirm"
    cancelLabel="Cancel"
    disabled={disabled}
    preferences={preferences}
    onConfirm={({ detail }) => setPreferences(detail)}
    pageSizePreference={{
      title: 'Page size',
      options: pageSizeOptions,
    }}
    wrapLinesPreference={{
      label: 'Wrap lines',
      description: 'Check to see all the text and wrap the lines',
    }}
    visibleContentPreference={{
      title: 'Select visible columns',
      options: visibleContentOptions,
    }}
  />
);
