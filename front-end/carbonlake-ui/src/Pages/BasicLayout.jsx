// /************************************************************************
//                             DISCLAIMER

// This is just a playground package. It does not comply with best practices
// of using AWS-UI components. For production code, follow the integration
// guidelines:

//  https://polaris.a2z.com/develop/integration/react/
// ************************************************************************/
// import React from 'react';
// import ServiceNavigation from './ServiceNavigation.jsx';
// import {
//   // import the components that you use in the file here
//   AppLayout,
//   BreadcrumbGroup,
//   HelpPanel,
//   Icon
// } from '@awsui/components-react';

// // Component Basic is a skeleton of the basic App layout using AWS-UI React components.
// export default function Basic() {
//   return (
//     <AppLayout
//       navigation={<ServiceNavigation />} // Navigation panel content imported from './ServiceNavigation.jsx'
//       breadcrumbs={<Breadcrumbs />} // Breadcrumbs element defined below
//       content={<Content />} // Main content on the page, defined below
//       contentType="default" // Sets default app layout settings for widths
//       tools={Tools} // Tools panel content defined below
//     />
//   );
// }

// // Breadcrumb content
// const Breadcrumbs = () => (
//   <BreadcrumbGroup
//     items={[
//       {
//         text: 'CloudFront',
//         href: '#/service-home'
//       },
//       {
//         text: 'Cache statistics',
//         href: '#/basic'
//       }
//     ]}
//   />
// );

// // Main content area (fill it in with components!)
// const Content = () => <div> </div>;

// // Help panel content
// const Tools = (
//   <HelpPanel
//     header={<h2>CloudFront</h2>}
//     footer={
//       <div>
//         <h3>
//           Learn more <Icon name="external" />
//         </h3>
//         <ul>
//           <li>
//             <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html">
//               What is Amazon CloudFront?
//             </a>
//           </li>
//           <li>
//             <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html">
//               Getting started
//             </a>
//           </li>
//           <li>
//             <a href="http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-working-with.html">
//               Working with distributions
//             </a>
//           </li>
//         </ul>
//       </div>
//     }
//   >
//     <p>
//       Amazon CloudFront is a web service that speeds up distribution of your static and dynamic web content, such as
//       .html, .css, .js, and image files, to your users.
//     </p>
//   </HelpPanel>
// );
