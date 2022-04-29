/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using AWS-UI components. For production code, follow the integration
guidelines:

https://polaris.a2z.com/develop/integration/react/
************************************************************************/
import React from 'react';
import ServiceNavigation from './ServiceNavigation.jsx';
import {
  AppLayout,
  Button,
  ColumnLayout,
  FormField,
  Icon,
  Select,
  Container,
  Header,
  Box,
  Grid,
  SpaceBetween,
  Link
} from '@awsui/components-react';

import '../styles/servicehomepage.scss';

// Component ServiceHomepage is a skeleton of a service's homepage using AWS-UI React components.
export default () => {
  return (
    <AppLayout
      disableContentPaddings={true}
      navigation={<ServiceNavigation />} // Navigation panel content imported from './ServiceNavigation.jsx'
      content={<Content />}
      contentType="default"
      navigationOpen={false}
      toolsHide={true}
    />
  );
};

// The content in the main content area of the App layout
const Content = () => (
  <Box padding="s" margin={{ bottom: 'l' }}>
    <Grid className="custom-home__header" gridDefinition={[{ colspan: { xxs: 12 } }]}>
      <Box padding={{ vertical: 'xxxl' }}>
        <Grid
          gridDefinition={[
            { offset: { l: '2', xxs: '1' }, colspan: { l: '8', xxs: '10' } },
            { colspan: { xxs: 10, s: 6, l: 5, xl: 6 }, offset: { xxs: 1, l: 2 } },
            { colspan: { xxs: 10, s: 4, l: 3, xl: 2 }, offset: { xxs: 1, s: 0 } }
          ]}
        >
          <Box fontWeight="heavy" padding={{ top: 'xs' }}>
            <span className="custom-home__category">Networking &amp; Content Delivery</span>
          </Box>

          <div className="custom-home__header-title">
            <Box variant="h1" fontWeight="bold" padding="n" fontSize="display-l" color="inherit">
              Amazon CloudFront
            </Box>
            <Box fontWeight="light" padding={{ bottom: 's' }} fontSize="display-l" color="inherit">
              Fast and reliable delivery of your static content
            </Box>
            <Box variant="p" fontWeight="light">
              <span className="custom-home__header-sub-title">
                Amazon CloudFront is a global content delivery network service (CDN) that accelerates delivery of your
                websites, APIs, video content or other web assets through CDN caching.
              </span>
            </Box>
          </div>

          <Container>
            <SpaceBetween size="xl">
              <Box variant="h2" padding="n">
                Create CloudFront distribution
              </Box>
              <FormField stretch={true} label="Delivery method">
                <Select
                  options={[{ id: '1', label: 'Web delivery method' }]}
                  selectedOption={{ id: '1', label: 'Web delivery method' }}
                />
              </FormField>
              <Button href="#" variant="primary">
                Next step
              </Button>
            </SpaceBetween>
          </Container>
        </Grid>
      </Box>
    </Grid>

    <Box padding={{ top: 'xxxl' }}>
      <Grid
        gridDefinition={[
          { colspan: { xxs: 10, s: 6, l: 5, xl: 6 }, offset: { xxs: 1, l: 2 } },
          { colspan: { xxs: 10, s: 4, l: 3, xl: 2 }, offset: { xxs: 1, s: 0 } }
        ]}
      >
        <div>
          <SpaceBetween size="xxl">
            <div>
              <Box variant="h1" tagOverride="h2">
                How it works
              </Box>
              <Container>
                <div className="custom-home-image__placeholder" />
              </Container>
            </div>

            <div>
              <Box variant="h1" tagOverride="h2">
                Benefits and features
              </Box>
              <Container>
                <ColumnLayout columns={2} variant="text-grid">
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      CloudFront console
                    </Box>
                    <Box variant="p">
                      Create, monitor, and manage your content delivery with a few simple clicks on the CloudFront
                      console.
                    </Box>
                  </div>
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      Static and dynamic content
                    </Box>
                    <Box variant="p">
                      Deliver both static content and dynamic content that you can personalize for individual users.
                    </Box>
                  </div>
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      Reporting and analytics
                    </Box>
                    <Box variant="p">
                      Get detailed cache statistics reports, monitor your CloudFront usage in near real-time, track your
                      most popular objects, and set alarms on operational metrics.
                    </Box>
                  </div>
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      Tools and libraries
                    </Box>
                    <Box variant="p">
                      Take advantage of a variety of tools and libraries for managing your CloudFront distribution, like
                      the CloudFront API, the AWS Command Line Interface (AWS CLI), and the AWS SDKs.
                    </Box>
                  </div>
                </ColumnLayout>
              </Container>
            </div>

            <div>
              <Box variant="h1" tagOverride="h2">
                Use cases
              </Box>
              <Container>
                <ColumnLayout columns={2} variant="text-grid">
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      Configure multiple origins
                    </Box>
                    <Box variant="p">
                      Configure multiple origin servers and multiple cache behaviors based on URL path patterns on your
                      website. Use AWS origins such as Amazon S3 or Elastic Load Balancing, and add your own custom
                      origins to the mix.
                    </Box>
                    <Link href="#" external>
                      Learn more
                    </Link>
                  </div>
                  <div>
                    <Box variant="h3" padding={{ top: 'n' }}>
                      Deliver streaming video
                    </Box>
                    <Box variant="p">
                      Use CloudFront to deliver on-demand video without the need to set up or operate any media servers.
                      CloudFront supports multiple protocols for media streaming.
                    </Box>
                    <Link href="#" external>
                      Learn more
                    </Link>
                  </div>
                </ColumnLayout>
              </Container>
            </div>

            <Container header={<Header variant="h2">Related services</Header>}>
              <ColumnLayout columns={2} variant="text-grid">
                <div>
                  <Box variant="h3" padding={{ top: 'n' }}>
                    <Link fontSize="heading-m" external>
                      Amazon S3
                    </Link>
                  </Box>
                  <Box variant="p">Use Amazon S3 to store the content that CloudFront delivers.</Box>
                </div>
                <div>
                  <Box variant="h3" padding={{ top: 'n' }}>
                    <Link fontSize="heading-m" external>
                      Amazon Route 53
                    </Link>
                  </Box>
                  <Box variant="p">
                    Use Amazon Route 53 to route DNS queries for your domain name to your CloudFront distribution.
                  </Box>
                </div>
              </ColumnLayout>
            </Container>
          </SpaceBetween>
        </div>

        <div className="custom-home__sidebar">
          <SpaceBetween size="xxl">
            <Container header={<Header variant="h2">Pricing (US)</Header>}>
              <ul className="custom-list-separator">
                <li>
                  <span>10 TB/month</span>
                  <Box variant="span" color="text-body-secondary">
                    $0.085 per GB
                  </Box>
                </li>
                <li>
                  <span>100 TB/month</span>
                  <Box variant="span" color="text-body-secondary">
                    $0.065 per GB
                  </Box>
                </li>
                <li>
                  <span>524 TB/month</span>
                  <Box variant="span" color="text-body-secondary">
                    $0.035 per GB
                  </Box>
                </li>
                <li>
                  <span>4 PB/month</span>
                  <Box variant="span" color="text-body-secondary">
                    $0.025 per GB
                  </Box>
                </li>
                <li>
                  <Link href="#" external>
                    Cost calculator
                  </Link>
                </li>
              </ul>
            </Container>
            <Container
              header={
                <Header variant="h2">
                  Getting started <Icon name="external" size="inherit"/>
                </Header>
              }
            >
              <ul className="custom-list-separator">
                <li>
                  <Link
                    href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html"
                    target="_blank"
                  >
                    What is Amazon CloudFront?
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html"
                    target="_blank"
                  >
                    Getting started with CloudFront
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html"
                    target="_blank"
                  >
                    Working with CloudFront distributions
                  </Link>
                </li>
              </ul>
            </Container>
            <Container
              header={
                <Header variant="h2">
                  More resources <Icon name="external" size="inherit"/>
                </Header>
              }
            >
              <ul className="custom-list-separator">
                <li>
                  <Link href="https://aws.amazon.com/documentation/cloudfront/" target="_blank">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#">FAQ</Link>
                </li>
                <li>
                  <Link href="#">CloudFront forum</Link>
                </li>
                <li>
                  <Link href="#">Contact us</Link>
                </li>
              </ul>
            </Container>
          </SpaceBetween>
        </div>
      </Grid>
    </Box>
  </Box>
);
