// Description: Codegen configuration file for GraphQL Code Generator
// @see https://graphql-code-generator.com/docs/getting-started/codegen-config

import { CodegenConfig } from '@graphql-codegen/cli'


// For GLEC compliance copy content from ./configuration-examples/GLEC/activity-schema.graphql into ./activity-schema.graphql file

export const config = (framework: string): CodegenConfig =>  {
  const schemaLocation = `./framework_configurations/${framework}/schema.graphql`;

  return {
  emitLegacyCommonJSImports: true,
  schema: schemaLocation,
  generates: {
    // Generate CSV input template for Activity input
    './lib/stacks/stack-web/app/sample-ui-cloudscape/public/assets/activity-input-template.csv': {
      plugins: ['./lib/codegen/csv.ts'],
      config: {
        targetType: 'Activity',
        onlyIncludeDirectives: ['input'],
      },
    },
    './lib/constructs/construct-rest-api/activity-schema.json': {
      plugins: ['./lib/codegen/activity-json-schema.ts']
    },
    // TODO: Graphql javascript operations generator
    // 'lib/stacks/stack-web/app/sample-ui-cloudscape/src/graphql/types.ts': {
    //   schema: ['lib/stacks/stack-api/schema.graphql', 'lib/stacks/stack-api/appsync.graphql'],
    //   plugins: ['typescript', 'typescript-operations'],
    //   config: {
    //     scalars: {
    //       AWSJSON: 'string',
    //       AWSDate: 'string',
    //       AWSTime: 'string',
    //       AWSDateTime: 'string',
    //       AWSTimestamp: 'number',
    //       AWSEmail: 'string',
    //       AWSURL: 'string',
    //       AWSPhone: 'string',
    //       AWSIPAddress: 'string',
    //     },
    //   },
    // },
    // Generate AppSync schema for the API
    './lib/stacks/stack-api/schema.graphql': {
      plugins: ['./lib/codegen/appsync-schema.ts'],
    },
    // Generate GraphQL operations for the UI
    './lib/stacks/stack-web/app/sample-ui-cloudscape/src/graphql/operations.js': {
      plugins: ['./lib/codegen/javascript-operations.ts'],
    },
    // TODO: DQ generator
    // lib/stacks/stack-data-pipeline/construct-data-quality/lambda/manage_dq_resources/dq_rules.json': {
    //   schema: schemaLocation,
    //   plugins: [__dirname + './lib/codegen/dq-rules.ts'],
    // },
    // Emission Factors keys
    './lib/stacks/stack-data-pipeline/construct-calculator/lambda/emissionFactorsLookupFields.json': {
      plugins: ['./lib/codegen/field-directives-to-json-array.ts'],
      config: {
        targetType: 'EmissionFactor',
        directive: 'lookup'
      },
    },
  },
}};

export default config
