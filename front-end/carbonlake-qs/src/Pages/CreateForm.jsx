import React from 'react';
import DataProvider from '../resources/data-provider';
import ServiceNavigation from './ServiceNavigation.jsx';
import {
  ALLOWED_HTTP_METHOD_OPTIONS,
  COOKIE_OPTIONS,
  CURRENT_COMPRESSION_OPTIONS,
  FORWARD_HEADER_OPTIONS,
  PRICE_CLASS_OPTIONS,
  QUERY_STRING_OPTIONS,
  SSL_CERTIFICATE_OPTIONS,
  SUPPORTED_HTTP_VERSIONS_OPTIONS,
  VIEWER_PROTOCOL_POLICY_OPTIONS,
  DELIVERY_METHOD
} from '../resources/form-config.jsx';
import {
  AppLayout,
  AttributeEditor,
  BreadcrumbGroup,
  Button,
  Checkbox,
  ColumnLayout,
  ExpandableSection,
  Form,
  FormField,
  Input,
  Multiselect,
  RadioGroup,
  Select,
  Textarea,
  Tiles,
  Header,
  SpaceBetween,
  Container,
  Link,
  HelpPanel,
  Box,
  Icon
} from '@awsui/components-react';

import '../styles/form.scss';

// Class CreateForm is a skeleton of a Single page create form using AWS-UI React components.
export default class CreateForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { contentOrigins: [], toolsIndex: 0, toolsOpen: false };
  }
  componentDidMount() {
    let dataProvider = new DataProvider();
    dataProvider.getData('content-origins', contentOrigins => this.setState({ contentOrigins: contentOrigins }));
  }

  render() {
    return (
      <AppLayout
        navigation={<ServiceNavigation />} // Navigation panel content imported from './ServiceNavigation.jsx'
        breadcrumbs={<Breadcrumbs />}
        contentHeader={<Header variant="h1">Create CloudFront distribution</Header>}
        content={
          <Content
            // Changes the Help panel content when the user clicks an 'info' link
            replaceToolsContent={index => this.setState({ toolsIndex: index, toolsOpen: true })}
            contentOrigins={this.state.contentOrigins}
          />
        }
        contentType="form"
        tools={Tools[this.state.toolsIndex]}
        onToolsChange={({ detail }) => this.setState({ toolsOpen: detail.open })}
        toolsOpen={this.state.toolsOpen}
      />
    );
  }
}

// The content in the main content area of the App layout
const Content = props => {
  return (
    <Form
      actions={
        // located at the bottom of the form
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link">Cancel</Button>
          <Button href="#/table" variant="primary">
            Create distribution
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <ContentDeliveryPanel replaceToolsContent={props.replaceToolsContent} />

        <Container header={<Header variant="h2">Distribution settings</Header>} footer={<DistributionsFooter />}>
          <SpaceBetween size="l">
            <FormField
              label="Price class"
              info={
                <Link variant="info" onFollow={() => props.replaceToolsContent(2)}>
                  Info
                </Link>
              }
              stretch={true}
            >
              <RadioGroup items={PRICE_CLASS_OPTIONS} value="0" />
            </FormField>
            <FormField
              label={
                <span>
                  Alternative domain names (CNAMEs)<i> - optional</i>
                </span>
              }
              info={
                <Link variant="info" onFollow={() => props.replaceToolsContent(3)}>
                  Info
                </Link>
              }
              description="You must list any custom domain names that you use in addition to the CloudFront domain name for the URLs for your files."
              constraintText="Specify up to 100 CNAMEs separated with commas or put each on a new line."
              stretch={true}
            >
              <Textarea placeholder={'www.example1.com\nwww.example2.com'} />
            </FormField>
            <FormField
              label="SSL/TLS certificate"
              info={
                <Link variant="info" onFollow={() => props.replaceToolsContent(4)}>
                  Info
                </Link>
              }
              stretch={true}
            >
              <RadioGroup items={SSL_CERTIFICATE_OPTIONS} value="default" />
            </FormField>
            <Button> Request or import a certificate with AWS Certificate Manager (ACM) </Button>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Origin settings</Header>}>
          <SpaceBetween size="l">
            <FormField
              label="Content origin"
              info={
                <Link variant="info" onFollow={() => props.replaceToolsContent(5)}>
                  Info
                </Link>
              }
              description="The Amazon S3 bucket or web server from which you want CloudFront to get your web content."
            >
              <Select
                options={props.contentOrigins}
                placeholder="Select an S3 bucket or web server from which you want CloudFront to get your web content."
                filteringType="auto"
              />
            </FormField>
            <FormField
              label="Content origin (multiselect version)"
              description="The Amazon S3 bucket or web server from which you want CloudFront to get your web content."
            >
              <Multiselect
                options={props.contentOrigins}
                placeholder="Select an S3 bucket or web server from which you want CloudFront to get your web content."
                filteringType="auto"
              />
            </FormField>
            <FormField
              label="Path to content"
              description="The directory in your Amazon S3 bucket or your custom origin."
            >
              <Input placeholder="/images" />
            </FormField>
            <FormField
              label="Origin ID"
              description="This value lets you distinguish multiple origins in the same distribution from one another"
            >
              <Input />
            </FormField>
            <AttributeEditor
              addButtonText="Add header"
              removeButtonText="Remove header"
              items={[
                {
                  name: '',
                  value: ''
                }
              ]}
              definition={[
                {
                  label: 'Custom header name',
                  info: (
                    <Link variant="info" onFollow={() => props.replaceToolsContent(6)}>
                      Info
                    </Link>
                  ),

                  control: item => <Input value={item.name} placeholder="Location" />
                },
                {
                  label: (
                    <span>
                      Custom header value<i> - optional</i>
                    </span>
                  ),
                  control: item => <Input value={item.value} placeholder="Germany" />
                }
              ]}
            />
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Cache behavior settings</Header>} footer={<BehaviorsFooter />}>
          <SpaceBetween size="l">
            <FormField label="Viewer protocol policy" stretch={true}>
              <RadioGroup items={VIEWER_PROTOCOL_POLICY_OPTIONS} value="0" />
            </FormField>
            <FormField label="Allowed HTTP methods" stretch={true}>
              <RadioGroup items={ALLOWED_HTTP_METHOD_OPTIONS} value="0" />
            </FormField>
            <FormField label="Forward headers" description="Cache your objects based on header values" stretch={true}>
              <RadioGroup items={FORWARD_HEADER_OPTIONS} value="none" />
            </FormField>
            <FormField label="Object caching" description="Cache your objects based on header values" stretch={true}>
              <ColumnLayout columns={4}>
                <FormField label="Minimum TTL">
                  <Input type="number" value="0" />
                </FormField>
                <FormField label="Maximum TTL">
                  <Input type="number" value="31536000" />
                </FormField>
                <FormField label="Default TTL">
                  <Input type="number" value="86400" />
                </FormField>
                <div className="custom-header">
                  <Button> Set to default </Button>
                </div>
              </ColumnLayout>
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
};

// First form section titled 'Distribution content delivery'
const ContentDeliveryPanel = props => {
  return (
    <Container header={<Header>Distribution content delivery</Header>}>
      <FormField
        label="Delivery method"
        info={
          <Link variant="info" onFollow={() => props.replaceToolsContent(1)}>
            Info
          </Link>
        }
        stretch={true}
      >
        <Tiles items={DELIVERY_METHOD} value="web" />
      </FormField>
    </Container>
  );
};

// Footer content (Additional configuration section) for 'Distribution settings' form section
const DistributionsFooter = () => (
  <ExpandableSection header="Additional configuration" variant="footer">
    <SpaceBetween size="l">
      <FormField
        label="Supported HTTP versions"
        description="Choose the version of the HTTP protocol that you want CloudFront to accept for viewer requests."
        stretch={true}
      >
        <RadioGroup items={SUPPORTED_HTTP_VERSIONS_OPTIONS} value="http2" />
      </FormField>
      <FormField
        label="Root object"
        description="Type the name of the object that you want CloudFront to return when a viewer request points to your root URL."
      >
        <Input />
      </FormField>
      <FormField label="Logging">
        <Checkbox checked={false}>Enable logging</Checkbox>
      </FormField>
      <FormField label="IPv6">
        <Checkbox checked={false}>Enabled</Checkbox>
      </FormField>
      <FormField label="Comment">
        <Textarea />
      </FormField>
    </SpaceBetween>
  </ExpandableSection>
);

// Footer content (Additional configuration section) for 'Cache behavior settings' form section
const BehaviorsFooter = () => (
  <ExpandableSection header="Additional configuration" variant="footer">
    <SpaceBetween size="l">
      <div>
        <Box variant="awsui-key-label">Path pattern</Box>
        <div>Default (*)</div>
      </div>
      <FormField
        label="Cookies"
        description="Include all user cookies in the request URLs that it forwards to your origin."
        stretch={true}
      >
        <RadioGroup items={COOKIE_OPTIONS} value="none" />
      </FormField>
      <FormField
        label="Query string forwarding and caching"
        description="Query string parameters you want CloudFront to forward to the origin."
        stretch={true}
      >
        <RadioGroup items={QUERY_STRING_OPTIONS} value="none" />
      </FormField>
      <FormField label="Smooth streaming">
        <Checkbox checked={false}>Enable Microsoft smooth streaming</Checkbox>
      </FormField>
      <FormField label="Viewer access">
        <Checkbox checked={false}>Require signed URL or signed cookie </Checkbox>
      </FormField>
      <FormField label="Content compression" stretch={true}>
        <RadioGroup items={CURRENT_COMPRESSION_OPTIONS} value="manual" />
      </FormField>
      <FormField
        label="Lambda function associations"
        description="A Lambda trigger causes a function to execute. For example, you can create a trigger that causes the function to execute when CloudFront receives a request from a viewer for a specific cache behavior you set up for your distribution."
        stretch={true}
      >
        <ColumnLayout columns={3}>
          <FormField label="Type">
            <Input />
          </FormField>
          <FormField label="ARN">
            <Input />
          </FormField>
          <div className="custom-header">
            <Button> Add lambda</Button>
          </div>
        </ColumnLayout>
      </FormField>
    </SpaceBetween>
  </ExpandableSection>
);

// Breadcrumb content
const Breadcrumbs = () => (
  <BreadcrumbGroup
    items={[
      {
        text: 'CloudFront',
        href: '#/service-home'
      },
      {
        text: 'Distributions',
        href: '#/table'
      },
      {
        text: 'Create CloudFront distribution',
        href: '#/create'
      }
    ]}
  />
);

// List of Help (right) panel content, changes depending on which 'info' link the user clicks on.
const Tools = [
  <HelpPanel
    header={<h2>CloudFront</h2>}
    footer={
      <div>
        <h3>
          Learn more <Icon name="external" />
        </h3>
        <ul>
          <li>
            <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html">
              What is Amazon CloudFront?
            </a>
          </li>
          <li>
            <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html">
              Getting started
            </a>
          </li>
          <li>
            <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html">
              Working with distributions
            </a>
          </li>
        </ul>
      </div>
    }
  >
    <p>
      When you create an Amazon CloudFront distribution, you tell CloudFront where to find your content by specifying
      your origin servers. An origin stores the original version of your objects (your files).
    </p>
  </HelpPanel>,
  <HelpPanel header={<h2>Delivery Method</h2>}>
    <h4>Web</h4>
    <p>Create a web distribution if you want to:</p>
    <p>
      Speed up distribution of static and dynamic content, for example .html, .css, .php and graphics files. Distribute
      media files using HTTP or HTTPS.
    </p>
    <p>Add, update or delete objects and submit data from web forms.</p>
    <p>Use live streaming to stream an event in real time.</p>
    <p>
      You store your files in an origin - either an Amazon S3 bucket or a web server. After you create the distribution,
      you can add more origins to the distributions.
    </p>
    <Box variant="h4" margin={{ top: 'm' }}>
      RTMP
    </Box>
    <p>
      Create an RTMP distribution to speed up distribution of your streaming media files using Adobe Flash Media
      Server's RTMP protocol. An RTMP distribution allows an end user to begin playing a media file before the file has
      finished downloading from a CloudFront edge location. Note the following:
    </p>
    <p>To create an RTMP distribution, you must store the media files in an Amazon S3 bucket.</p>
    <p>To use CloudFront live streaming, create a web distribution.</p>
  </HelpPanel>,
  <HelpPanel header={<h2>Price class</h2>}>
    <p>
      Select the price class associated with the maximum price that you want to pay for CloudFront service. If you
      select a price class other than All, some of your users may experience higher latency.
    </p>
  </HelpPanel>,
  <HelpPanel header={<h2>Alternate domain names (CNAMEs)</h2>}>
    <div>
      <p>
        You must list any custom domain names (for example, www.example.com) that you use in addition to the CloudFront
        domain name (for example, d1234.cloudfront.net) for the URLs for your files.
      </p>
      <p>
        Specify up to 100 CNAMEs separated with commas or put each on a new line. You also must create a CNAME record
        with your DNS service to route queries for www.example.com to d1234.cloudfront.net. For more information, see
        the <a href="">Help</a>.
      </p>
    </div>
  </HelpPanel>,
  <HelpPanel header={<h2>SSL certificate</h2>}>
    <div>
      <div>
        <h4>Default CloudFront SSL certificate</h4>
        <p>
          Choose this option if you want your users to use HTTPS or HTTP to access your content with the CloudFront
          domain name (such as https://d111111abcdef8.cloudfront.net/logo.jpg).
        </p>
        <p>
          Important: If you choose this option, CloudFront requires that browsers or devices support TLSv1 or later to
          access your content.
        </p>
        <Box variant="h4" margin={{ top: 'm' }}>
          Custom SSL certificate
        </Box>
        <p>
          Choose this option if you want your users to access your content by using an alternate domain name, such as
          https://www.example.com/logo.jpg.
        </p>
        <p>
          You can use a certificate stored in AWS Certificate Manager (ACM) in the US East (N. Virginia) Region, or you
          can use a certificate stored in IAM.
        </p>
      </div>
    </div>
  </HelpPanel>,
  <HelpPanel header={<h2>Content origin</h2>}>
    <div>
      <p>
        Specify the domain name for your origin - the Amazon S3 bucket or web server from which you want CloudFront to
        get your web content. The dropdown list enumerates the AWS resources associated with the current AWS account.
      </p>
      <p>
        To use a resource from a different AWS account, type the domain name of the resource. For example, for an Amazon
        S3 bucket, type the name in the format bucketname.s3.amazonaws.com. The files in your origin must be publicly
        readable.
      </p>
    </div>
  </HelpPanel>,
  <HelpPanel header={<h2>Custom header name</h2>}>
    <p>Headers let you distinguish multiple origins in the same distribution from another.</p>
  </HelpPanel>
];
