export const PRICE_CLASS_OPTIONS = [
  { label: 'Use all edge locations (best performance)', value: '0' },
  { label: 'Use only US, Canada, and Europe', value: '1' },
  { label: 'Use only US, Canada, Europe, and Asia', value: '2' }
];

export const SSL_CERTIFICATE_OPTIONS = [
  {
    label: 'Default CloudFront SSL/TLS certificate',
    value: 'default',
    description: 'Provides HTTPS or HTTP access to your content using a CloudFront domain name.'
  },
  {
    label: 'Custom SSL/TLS certificate (example.com)',
    value: 'custom',
    description: 'Grants access by using an alternate domain name, such as https://www.example.com/.'
  }
];

export const SUPPORTED_HTTP_VERSIONS_OPTIONS = [
  { label: 'HTTP 2', value: 'http2' },
  { label: 'HTTP 1', value: 'http1' }
];

export const VIEWER_PROTOCOL_POLICY_OPTIONS = [
  { label: 'HTTP and HTTPS', value: '0' },
  { label: 'Redirect HTTP to HTTPS', value: '1' },
  { label: 'HTTPS Only', value: '2' }
];

export const ALLOWED_HTTP_METHOD_OPTIONS = [
  { label: 'GET, HEAD', value: '0' },
  { label: 'GET, HEAD, OPTIONS', value: '1' },
  { label: 'GET, HEAD, OPTIONS, PUT, POST, PATCH', value: '2' }
];

export const FORWARD_HEADER_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Allowlist', value: 'allowlist' },
  { label: 'All', value: 'all' }
];

export const COOKIE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Allowlist', value: 'allowlist' },
  { label: 'All', value: 'all' }
];

export const QUERY_STRING_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Allowlist', value: 'allowlist' },
  { label: 'All', value: 'all' }
];

export const CURRENT_COMPRESSION_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Automatic', value: 'automatic' }
];

export const DELIVERY_METHOD = [
  {
    label: 'Web',
    value: 'web',
    description: 'Deliver all types of content (including streaming). This is the most common choice.'
  },
  {
    label: 'RTMP',
    value: 'rtmp',
    description: 'Deliver streaming content using Adobe Media Server and the Adobe Real-Time Messaging Protocol (RTMP).'
  }
];
