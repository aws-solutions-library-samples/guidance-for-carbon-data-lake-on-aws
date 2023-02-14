// Description: Codegen configuration file for GraphQL Code Generator
// @see https://graphql-code-generator.com/docs/getting-started/codegen-config

import { CodegenConfig } from '@graphql-codegen/cli'

const schemaLocation = ['lib/stacks/stack-api/schema.graphql', 'lib/stacks/stack-api/appsync.graphql']

// For GLEC compliance copy content from ./configuration-examples/GLEC/activity-schema.graphql into ./activity-schema.graphql file

const config: CodegenConfig = {
  emitLegacyCommonJSImports: true,
  schema: schemaLocation,
  generates: {
    './lib/stacks/stack-web/app/sample-ui-cloudscape/public/assets/activity-input-template.csv': {
      plugins: ['./lib/codegen/csv.ts'],
      config: {
        targetType: 'Activity',
      },
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
    // TODO: DQ generator
    // lib/stacks/stack-data-pipeline/construct-data-quality/lambda/manage_dq_resources/dq_rules.json': {
    //   schema: schemaLocation,
    //   plugins: [__dirname + './lib/codegen/dq-rules.ts'],
    // },
    // TODO: Python types generator for calculator
    // 'lib/stacks/stack-data-pipeline/construct-calculator/lambda/types.py': {
    //   schema: schemaLocation,
    //   plugins: [__dirname + './lib/codegen/python-types.ts'],
    // },
  },
}

export default config
