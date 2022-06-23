// import React from 'react';
// import { Link, StatusIndicator } from '@awsui/components-react';

// export const COLUMN_DEFINITIONS = [
//   {
//     id: 'activity_event_id',
//     header: 'Activity Event ID',
//     cell: item => <Link>{item.activity_event_id}</Link>,
//     minWidth: '180px',
//     sortingField: 'activity_event_id'
//   },
//   {
//     id: 'activity',
//     cell: item => item.activity,
//     header: 'Activity',
//     minWidth: '160px',
//     sortingField: 'activity'
//   },
//   {
//     id: 'deliveryMethod',
//     header: 'Asset ID',
//     cell: item => item.asset_id,
//     minWidth: '100px',
//     maxWidth: '200px',
//     sortingField: 'deliveryMethod'
//   },
//   {
//     id: 'deliveryMethod2',
//     header: 'Category',
//     cell: item => item.category,
//     minWidth: '100px',
//     maxWidth: '200px',
//     sortingField: 'deliveryMethod2'
//   },

//   {
//     id: 'sslCertificate',
//     header: 'Emissions Output',
//     cell: item => item.sslCertificate,
//     minWidth: '100px',
//     sortingField: 'sslCertificate'
//   },
//   {
//     id: 'origin',
//     header: 'Geo',
//     cell: item => item.origin,
//     minWidth: '100px',
//     sortingField: 'origin'
//   },
//   {
//     id: 'status',
//     header: 'Origin Measurement Timestamp',
//     cell: item => item.status,
//     minWidth: '100px',
//     sortingField: 'status'
//   },
//   {
//     id: 'status2',
//     header: 'Raw Data',
//     cell: item => item.status,
//     minWidth: '100px',
//     sortingField: 'status2'
//   },
//   {
//     id: 'status3',
//     header: 'Scope',
//     cell: item => item.status,
//     minWidth: '100px',
//     sortingField: 'status3'
//   },
//   {
//     id: 'status4',
//     header: 'Source',
//     cell: item => item.status,
//     minWidth: '100px',
//     sortingField: 'status4'
//   },
//   {
//     id: 'status5',
//     header: 'Units',
//     cell: item => item.status,
//     minWidth: '100px',
//     sortingField: 'status5'
//   },
//   {
//     id: 'state',
//     header: 'State',
//     cell: item => (
//       <StatusIndicator type={item.state === 'Disabled' ? 'error' : 'success'}> {item.state}</StatusIndicator>
//     ),
//     minWidth: '100px',
//     sortingField: 'state'
//   },
//   {
//     id: 'logging',
//     header: 'Logging',
//     cell: item => item.logging,
//     minWidth: '100px',
//     sortingField: 'logging'
//   }
// ];

// export const CONTENT_SELECTOR_OPTIONS = [
//   {
//     label: 'Main distribution properties',
//     options: [
//       { id: 'id', label: 'Distribution ID', editable: false },
//       { id: 'domainName', label: 'Domain name', editable: true },
//       {
//         id: 'deliveryMethod',
//         label: 'Delivery method',
//         editable: true
//       },
//       {
//         id: 'deliveryMethod2',
//         label: 'Delivery method',
//         editable: true
//       },
//       {
//         id: 'priceClass',
//         label: 'Price class',
//         editable: true
//       },
//       {
//         id: 'sslCertificate',
//         label: 'SSL certificate',
//         editable: true
//       },
//       { id: 'origin', label: 'Origin', editable: true },
//       { id: 'status', label: 'Status', editable: true },
//       { id: 'state', label: 'State', editable: true },
//       { id: 'logging', label: 'Logging', editable: true }
//     ]
//   }
// ];

// export const PAGE_SELECTOR_OPTIONS = [
//   { value: 10, label: '10 Distributions' },
//   { value: 30, label: '30 Distributions' },
//   { value: 50, label: '50 Distributions' }
// ];

// export const CUSTOM_PREFERENCE_OPTIONS = [{ value: 'table', label: 'Table' }, { value: 'cards', label: 'Cards' }];

// export const DEFAULT_PREFERENCES = {
//   pageSize: 30,
//   visibleContent: ['activity_event_id', 'domainName', 'deliveryMethod', 'deliveryMethod2', 'sslCertificate', 'status', 'state'],
//   wraplines: false,
//   custom: CUSTOM_PREFERENCE_OPTIONS[0].value
// };
