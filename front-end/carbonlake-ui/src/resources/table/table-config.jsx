import React from 'react';
import { Link, StatusIndicator } from '@awsui/components-react';

// ** Labels for the columns in the table **
// id - used for showing/hiding columns. Should match sortingField
// header - the label for the column
// cell - where you pass in the data fetched from the api. Format is item.JSON_LABEL
// minWidth - minimum width of the column
// sortingField - used for sorting the table when clicking on column name. Should match id
export const COLUMN_DEFINITIONS = [
  {
    id: 'activity_event_id',
    header: 'Activity Event ID',
    cell: item => <Link>{item.activity_event_id}</Link>,
    minWidth: '180px',
    sortingField: 'activity_event_id'
  },
  {
    id: 'activity',
    cell: item => item.activity,
    header: 'Activity',
    minWidth: '160px',
    sortingField: 'activity'
  },
  {
    id: 'asset_id',
    header: 'Asset ID',
    cell: item => item.asset_id,
    minWidth: '100px',
    maxWidth: '200px',
    sortingField: ' asset_id'
  },
  {
    id: 'category',
    header: 'Category',
    cell: item => item.category,
    minWidth: '100px',
    maxWidth: '200px',
    sortingField: 'category'
  },

  {
    id: 'emissions_output',
    header: 'Emissions Output',
    cell: item => item.emissions_output,
    minWidth: '100px',
    sortingField: 'emissions_output'
  },
  {
    id: 'geo',
    header: 'Geo',
    cell: item => item.geo,
    minWidth: '100px',
    sortingField: 'geo'
  },
  {
    id: 'origin_measurement_timestamp',
    header: 'Origin Measurement Timestamp',
    cell: item => item.origin_measurement_timestamp,
    minWidth: '100px',
    sortingField: 'origin_measurement_timestamp'
  },
  {
    id: 'raw_data',
    header: 'Raw Data',
    cell: item => item.raw_data,
    minWidth: '100px',
    sortingField: 'raw_data'
  },
  {
    id: 'scope',
    header: 'Scope',
    cell: item => item.scope,
    minWidth: '100px',
    sortingField: 'scope'
  },
  {
    id: 'source',
    header: 'Source',
    cell: item => item.source,
    minWidth: '100px',
    sortingField: 'source'
  },
  {
    id: 'units',
    header: 'Units',
    cell: item => item.units,
    minWidth: '100px',
    sortingField: 'units'
  },
  // This eventually could be used for error handling
  // Could maybe have State of 'Verified', 'Unverified', 'Failed', etc. to give more info
  {
    id: 'state',
    header: 'State',
    cell: item => (
      <StatusIndicator type={item.state === 'Disabled' ? 'error' : 'success'}> {item.state}</StatusIndicator>
    ),
    minWidth: '100px',
    sortingField: 'state'
  },
];

// ** Selector options visible when clicking gear icon in table. Used to show/hide columns **
//  id - corresponding id defined in colum definitions above
// label - corresponding label defined in column definitions above
// editable - bool for if the toggle is selectable or not (greyed out when set to false)
export const CONTENT_SELECTOR_OPTIONS = [
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
      { id: 'state', label: 'State', editable: true },

    ]
  }
];

// ** Page selector options for how many rows to see on each page **
// value - how many rows
// label - label for the corresponding value
export const PAGE_SELECTOR_OPTIONS = [
  { value: 10, label: '10 Emissions' },
  { value: 30, label: '30 Emissions' },
  { value: 50, label: '50 Emissions' },
  { value: 100, label: '100 Emissions' },
];

// Custom options for how to view the table (cards or table)
export const CUSTOM_PREFERENCE_OPTIONS = [{ value: 'table', label: 'Table' }, { value: 'cards', label: 'Cards' }];

// ** Default preferences for table **
// pageSize - how many rows on each page
// visibleContent - which rows are visible on component render (page load)
export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent:
  ['activity_event_id',
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
  'state',
],
  wraplines: false,
  custom: CUSTOM_PREFERENCE_OPTIONS[0].value
};
