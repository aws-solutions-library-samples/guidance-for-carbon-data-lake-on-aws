import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { schemaToHeaders } from './utils';

export enum FileFormat {
  CSV,
  XSLX,
}

export type InputFileGeneratorConfig = {
  includeTypes: string[];
  fileFormat: FileFormat;
};

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: InputFileGeneratorConfig,
) => {
  const data = schemaToHeaders(schema);
  let result = '';

  if (config.fileFormat === FileFormat.XSLX) {
    // Not implemented
    throw new Error('Not implemented');
  }

  if (config.fileFormat === FileFormat.CSV) {
    for (const sheet of data) {
      for (const column of sheet.columns) {
        result += `${column.label.replace(/([A-Z])/g, '_$1').toLowerCase()},`;
      }
      result += '\n';
    }
  }

  return result;
};
