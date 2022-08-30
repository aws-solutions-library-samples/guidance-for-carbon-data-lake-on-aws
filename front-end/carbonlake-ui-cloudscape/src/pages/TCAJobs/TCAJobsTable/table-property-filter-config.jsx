import React from 'react';
import { CollectionPreferences, FormField, RadioGroup, StatusIndicator, Link } from '@cloudscape-design/components';
import { addColumnSortLabels } from '../labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'JobName',
    header: 'Job Name',
    cell: item => <Link>{item.JobName}</Link>,
    minWidth: 200,
    sortingField: 'JobName'
  },
  {
    id: 'AccountId',
    cell: item => item.AccountId,
    header: 'Account ID',
    minWidth: 120,
    maxWidth: 200,
    sortingField: 'AccountId'
  },
  {
    id: 'Categories',
    header: 'Categories',
    cell: item => item.Categories,
    minWidth: 160,
    maxWidth: 200,
    sortingField: ' Categories'
  },
  {
    id: 'Channel',
    header: 'Channel',
    cell: item => item.Channel,
    minWidth: 100,
    maxWidth: 100,
    sortingField: 'Channel'
  },

  {
    id: 'ContentMetadata',
    header: 'Content Metadata',
    cell: item => item.ContentMetadata,
    minWidth: 100,
    sortingField: 'ContentMetadata'
  },
  {
    id: 'ConversationCharacteristics',
    header: 'Conversation Characteristics',
    cell: item => item.ConversationCharacteristics,
    minWidth: 100,
    sortingField: 'ConversationCharacteristics'
  },
  {
    id: 'LanguageCode',
    header: 'Language Code',
    cell: item => item.LanguageCode,
    minWidth: 100,
    sortingField: 'LanguageCode'
  },
  {
    id: 'Participants',
    header: 'Participants',
    cell: item => item.Participants,
    minWidth: 100,
    sortingField: 'Participants'
  },
  {
    id: 'Transcript',
    header: 'Transcript',
    cell: item => item.Transcript,
    minWidth: 100,
    sortingField: 'Transcript'
  },
  {
    id: 'CreatedAt',
    header: 'Created At',
    cell: item => item.createdAt,
    minWidth: 100,
    sortingField: 'CreatedAt'
  },
  {
    id: 'UpdatedAt',
    header: 'Updated At',
    cell: item => item.updatedAt,
    minWidth: 100,
    sortingField: 'UpdatedAt'
  },
  {
    id: 'FilePath',
    header: 'File Path',
    cell: item => item.filePath,
    minWidth: 100,
    sortingField: 'FilePath'
  },
   // This eventually could be used for error handling
   // Could maybe have State of 'Verified', 'Unverified', 'Failed', etc. to give more info
   {
     id: 'JobStatus',
     header: 'Job Status',
    //  cell: item => item.JobStatus,
     cell: item => (
      item.JobStatus,
       <StatusIndicator type={item.state === 'Disabled' ? 'error' : 'success'}> {item.state}{item.JobStatus}</StatusIndicator>
     ),
     minWidth: 100,
     sortingField: 'JobStatus'
   },
]);

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Jobs' },
  { value: 30, label: '30 Jobs' },
  { value: 50, label: '50 Jobs' },
];

export const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'Job Name',
    key: 'JobName',
    groupValuesLabel: 'Job Name values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Account ID',
    key: 'AccountId',
    groupValuesLabel: 'Account ID values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Channel',
    key: 'Channel',
    groupValuesLabel: 'Channel values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Job Status',
    key: 'JobStatus',
    groupValuesLabel: 'Job Status values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Language Code',
    key: 'LanguageCode',
    groupValuesLabel: 'Language Code values',
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
    'JobName',
    'AccountId',
    'Categories',
    'Channel',
    'ContentMetadata',
    'ConversationCharacteristics',
    'CreatedAt',
    'UpdatedAt',
    'FilePath',
    'JobStatus',
    'LanguageCode',
    'Participants',
    'Transcript',
  ],
   wraplines: false,
   custom: CUSTOM_PREFERENCE_OPTIONS[0].value
};

export const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main TCA Job properties',
    options: [
      { id: 'JobName', label: 'Job Name', editable: false },
      { id: 'AccountId', label: 'Account ID', editable: true },
      { id: 'Categories', label: 'Categories', editable: true },
      { id: 'Channel', label: 'Channel', editable: true },
      { id: 'ContentMetadata', label: 'Content Metadata', editable: true },
      { id: 'ConversationCharacteristics', label: 'ConversationCharacteristics', editable: true },
      { id: 'CreatedAt', label: 'Created At', editable: true },
      { id: 'UpdatedAt', label: 'Updated At', editable: true },
      { id: 'FilePath', label: 'File Path', editable: true },
      { id: 'JobStatus', label: 'Job Status', editable: false },
      { id: 'LanguageCode', label: 'Language Code', editable: true },
      { id: 'Participants', label: 'Participants', editable: true },
      { id: 'Transcript', label: 'Transcript', editable: true },
    ],
  },
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
