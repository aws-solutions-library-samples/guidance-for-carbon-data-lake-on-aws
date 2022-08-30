/************************************************************************
                            DISCLAIMER

This is just a playground package. It does not comply with best practices
of using Cloudscape Design components. For production code, follow the
integration guidelines:

https://cloudscape.design/patterns/patterns/overview/
************************************************************************/
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// COMPONENT IMPORTS
import TopNavigationHeader from '../../common/components/TopNavigationHeader';
import {
  Alert,
  Badge,
  BreadcrumbGroup,
  Button,
  Flashbar,
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  Icon,
  TextContent,
  SpaceBetween
} from '@cloudscape-design/components';
// Common
import { useColumnWidths } from '../../common/resources/useColumnWidths';
import {
  Notifications,
  ExternalLinkItem,
  TableHeader
} from '../../common/common-components-config';
import Sidebar from '../../common/components/Sidebar'

import {
  COLUMN_DEFINITIONS,
} from './EmissionsTable/table-property-filter-config';


import EmissionsTable from './EmissionsTable';
import { resourcesBreadcrumbs } from './breadcrumbs';

// Styles
import '../../common/styles/base.scss'



const EmissionsRecords = () => {
  const [columnDefinitions, saveWidths] = useColumnWidths('React-TableServerSide-Widths', COLUMN_DEFINITIONS);
  const [toolsOpen, setToolsOpen] = useState(false);
  return (
    <>
      <AppLayout
            navigation={<Sidebar activeHref="/tca-jobs" />}
            // notifications={<Notifications successNotification={false} />}
            breadcrumbs={<Breadcrumbs />} // define these values in /breadcrumbs/index.js
            content={
              <>
                <EmissionsTable
                columnDefinitions={columnDefinitions} // define these values in /EmissionsTable/table-property-filter-config.jsx
                saveWidths={saveWidths}
                updateTools={() => setToolsOpen(true)}
                />
              </>
            }
            contentType="table"
            tools={<ToolsContent />}
            toolsOpen={toolsOpen}
            onToolsChange={({ detail }) => setToolsOpen(detail.open)}
            stickyNotifications={true}
      />
 </>
  );

}

export default EmissionsRecords

const Content = () => {
  const [columnDefinitions, saveWidths] = useColumnWidths('React-TableServerSide-Widths', COLUMN_DEFINITIONS);
  let { userId } = useParams()
  return (
    <>
     <EmissionsTable
        columnDefinitions={columnDefinitions} // define these values in /EmissionsTable/table-property-filter-config.jsx
        saveWidths={saveWidths}
        updateTools={() => setToolsOpen(true)}
        />
    </>
  )
}

const Tools = [
  <HelpPanel
    header={<h2>CarbonLake 101</h2>}
    footer={
      <div>
        <h3>
          Learn more <Icon name="external" />
        </h3>
        <ul>
          <li>
            <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html">
              Working with distributions
            </a>
          </li>
          <li>
            <a href="https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-returned.html">
              Values that CloudFront displays on the console
            </a>
          </li>
        </ul>
      </div>
    }
  >
    <p>
      View your current distributions and related information such as the associated domain names, delivery methods, SSL
      certificates, and more. To drill down even further into the details, choose the name of an individual
      distribution.
    </p>
  </HelpPanel>
];





export const Breadcrumbs = () => (
  <BreadcrumbGroup items={resourcesBreadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);



export const FullPageHeader = ({

  resourceName = 'Emissions Records',
  createButtonText = 'Upload Emission Data',
  // createButtonText = 'Upload File',
  ...props
}) => {
  const navigate = useNavigate();
  const isOnlyOneSelected = props.selectedItems.length === 1;

  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
          <Button disabled={!isOnlyOneSelected}>View details</Button>
          <Button disabled={!isOnlyOneSelected}>Edit</Button>
          <Button disabled={props.selectedItems.length === 0}>Delete</Button>
          {/* <Button onClick={() => navigate("/data-uploader")} variant="primary">{createButtonText}</Button> */}
          <Button onClick={() => navigate("/data-uploader")} variant="primary">{createButtonText}</Button>
        </SpaceBetween>
      }
      {...props}
    />
  );
};

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>Emissions Records</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/Third-Party-Databases/IPCC-Emissions-Factor-Database"
              text="IPCC Emissions Factor Database"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/energy/"
              text="AWS Energy & Utilities"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://ghgprotocol.org/"
              text="GHG Protocol Guidance"
            />
          </li>
          {/* <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/transcribe/faqs/?nc=sn&loc=5"
              text="Amazon Transcribe FAQs"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://docs.aws.amazon.com/transcribe/latest/dg/custom-language-models.html"
              text="Amazon Transcribe Custom Language Models"
            />
          </li>
          <li>
            <ExternalLinkItem
              href="https://docs.aws.amazon.com/transcribe/latest/dg/custom-vocabulary.html"
              text="Amazon Transcribe Custom Vocabularies"
            />
          </li> */}
        </ul>
      </>
    }
  >
    <p>
      View your Emissions Records and related information such as the activity id, asset id, geo, timestamp,
      and more. To drill down even further into the details, choose the name of an individual Emission Record.
      By default, CarbonLake is referencing the public IPCC Emissions Factor Database.
    </p>
  </HelpPanel>
);

export const EC2ToolsContent = () => (
  <HelpPanel header={<h2>Instances</h2>}>
    <p>
      View your current instances and related information such as the instance ID, instance type, instance status, and
      more. To drill down even further into the details, select an individual instance.
    </p>
  </HelpPanel>
);

export const InstanceHeader = ({ ...props }) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;

  return (
    <TableHeader
      {...props}
      title="Instances"
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
          <Button disabled={!isOnlyOneSelected}>View details</Button>
          <Button disabled={!isOnlyOneSelected}>Edit</Button>
          <Button disabled={props.selectedItems.length === 0}>Delete</Button>
          <Button variant="primary">Create instance</Button>
        </SpaceBetween>
      }
    />
  );
};

export const EmissionsTableEmptyState = ({ resourceName }) => {
  const navigate = useNavigate();


  return (

    <Box margin={{ vertical: 'xs' }} textAlign="center" color="inherit">
      <SpaceBetween size="xxs">
        <div>
          <b>No {resourceName}s</b>
          <Box variant="p" color="inherit">
            No {resourceName}s found. Click 'Create {resourceName}' to start the pipeline.
          </Box>
        </div>
        <Button onClick={() => navigate("/data-uploader")}>Create {resourceName}</Button>
      </SpaceBetween>
    </Box>
  );


}

