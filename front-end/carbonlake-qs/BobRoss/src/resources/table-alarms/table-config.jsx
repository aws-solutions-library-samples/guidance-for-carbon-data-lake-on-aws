import React from 'react';
import { Link } from '../../aws-ui-components';

export const COLUMN_DEFINITIONS = [
  {
    id: 'alarmName',
    cell: item => <Link>{item.alarmName}</Link>,
    header: 'Alarm name',
    minWidth: '160px'
  },
  {
    id: 'state',
    header: 'State',
    cell: item => item.state,
    minWidth: '100px'
  },
  {
    id: 'lastUpdate',
    header: 'Last state update',
    cell: item => item.lastUpdate,
    minWidth: '100px',
    maxWidth: '150px'
  },
  {
    id: 'conditions',
    header: 'Conditions',
    cell: item => item.conditions,
    minWidth: '200px'
  }
];
