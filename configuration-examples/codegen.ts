import { CodegenConfig } from '@graphql-codegen/cli';
import { FileFormat } from '../lib/codegen';

const config: CodegenConfig = {
  emitLegacyCommonJSImports: false,
  generates: {
    './__generated__/activity.csv': {
      schema: './activity-schema.graphql',
      plugins: ['../lib/index.js'],
      config: {
        fileFormat: FileFormat.CSV,
      },
    },
  },
};

export default config;