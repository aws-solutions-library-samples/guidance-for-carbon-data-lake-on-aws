import React from 'react';
import { Link, StatusIndicator } from '../../aws-ui-components';

export const COLUMN_DEFINITIONS = [
  {
    id: 'id',
    header: 'Distribution ID',
    cell: item => <Link>{item.id}</Link>,
    minWidth: '180px',
    sortingField: 'id'
  },
  {
    id: 'domainName',
    cell: item => item.domainName,
    header: 'Domain name',
    minWidth: '160px',
    sortingField: 'domainName'
  },
  {
    id: 'deliveryMethod',
    header: 'Delivery method',
    cell: item => item.deliveryMethod,
    minWidth: '100px',
    maxWidth: '200px',
    sortingField: 'deliveryMethod'
  },
  {
    id: 'priceClass',
    header: 'Price class',
    cell: item => item.priceClass,
    minWidth: '100px',
    sortingField: 'priceClass'
  },
  {
    id: 'sslCertificate',
    header: 'SSL certificate',
    cell: item => item.sslCertificate,
    minWidth: '100px',
    sortingField: 'sslCertificate'
  },
  {
    id: 'origin',
    header: 'Origin',
    cell: item => item.origin,
    minWidth: '100px',
    sortingField: 'origin'
  },
  {
    id: 'status',
    header: 'Status',
    cell: item => item.status,
    minWidth: '100px',
    sortingField: 'status'
  },
  {
    id: 'state',
    header: 'State',
    cell: item => (
      <StatusIndicator type={item.state === 'Disabled' ? 'error' : 'success'}> {item.state}</StatusIndicator>
    ),
    minWidth: '100px',
    sortingField: 'state'
  },
  {
    id: 'logging',
    header: 'Logging',
    cell: item => item.logging,
    minWidth: '100px',
    sortingField: 'logging'
  }
];

export const CONTENT_SELECTOR_OPTIONS = [
  {
    label: 'Main distribution properties',
    options: [
      { id: 'id', label: 'Distribution ID', editable: false },
      { id: 'domainName', label: 'Domain name', editable: true },
      {
        id: 'deliveryMethod',
        label: 'Delivery method',
        editable: true
      },
      {
        id: 'priceClass',
        label: 'Price class',
        editable: true
      },
      {
        id: 'sslCertificate',
        label: 'SSL certificate',
        editable: true
      },
      { id: 'origin', label: 'Origin', editable: true },
      { id: 'status', label: 'Status', editable: true },
      { id: 'state', label: 'State', editable: true },
      { id: 'logging', label: 'Logging', editable: true }
    ]
  }
];

export const PAGE_SELECTOR_OPTIONS = [
  { value: 10, label: '10 Distributions' },
  { value: 30, label: '30 Distributions' },
  { value: 50, label: '50 Distributions' }
];

export const CUSTOM_PREFERENCE_OPTIONS = [{ value: 'table', label: 'Table' }, { value: 'cards', label: 'Cards' }];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['id', 'domainName', 'deliveryMethod', 'sslCertificate', 'status', 'state'],
  wraplines: false,
  custom: CUSTOM_PREFERENCE_OPTIONS[0].value
};
