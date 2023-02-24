import {generate} from '@aws-amplify/graphql-docs-generator';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import {plugin as modelGenPlugin} from './appsync-schema';
import tmp from 'tmp';
import fs from 'fs';

export const plugin: PluginFunction = async (schema: GraphQLSchema, _documents: Types.DocumentFile[], _config: any) => {


  const schemaString = await modelGenPlugin(schema, [], _config)
  const schemaFile = writeSyncToTemporaryFile(schemaString.toString(), '.graphql');

  const tmpOutput = createTemporaryOutputFilePath('.js');

  generate(schemaFile, tmpOutput, {
    language: 'javascript',
    separateFiles: false,
    maxDepth: 2,
  });
  const result = fs.readFileSync(tmpOutput, 'utf8');
  return result;
};

const writeSyncToTemporaryFile = (content: string, extension: string) => {
  const path = tmp.fileSync({ postfix: extension }).name;
  fs.writeFileSync(path, content);
  return path;
};

const createTemporaryOutputFilePath = (extension: string) => {
  const path = tmp.fileSync({ postfix: extension }).name;
  return path;
}
