export const resourcesBreadcrumbs = [
  {
    text: ' Carbon Data Lake',
    href: '#',
  },
  {
    text: 'Emissions Records',
    href: '#',
  },
];

export const resourceDetailBreadcrumbs = [
  ...resourcesBreadcrumbs,
  {
    text: 'SampleRecord1234',
    href: '#',
  },
];

export const resourceManageTagsBreadcrumbs = [
  ...resourceDetailBreadcrumbs,
  {
    text: 'Manage tags',
    href: '#',
  },
];

export const resourceEditBreadcrumbs = [
  ...resourceDetailBreadcrumbs,
  {
    text: 'Edit',
    href: '#',
  },
];

export const resourceCreateBreadcrumbs = [
  ...resourcesBreadcrumbs,
  {
    text: 'Upload Emissions',
    href: '#',
  },
];

export const readFromS3Breadcrumbs = [
  ...resourceDetailBreadcrumbs,
  {
    text: 'Run simulation',
    href: '#',
  },
];

export const writeToS3Breadcrumbs = [
  ...resourceDetailBreadcrumbs,
  {
    text: 'Create simulation',
    href: '#',
  },
];
