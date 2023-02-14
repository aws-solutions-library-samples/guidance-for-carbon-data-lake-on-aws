import { getCachedDocumentNodeFromSchema, PluginFunction, Types } from '@graphql-codegen/plugin-helpers'
import { FieldDefinitionNode, GraphQLSchema, ObjectTypeDefinitionNode, visit } from 'graphql'

export type InputFileGeneratorConfig = {
  targetType: string
}

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: InputFileGeneratorConfig
) => {

  const astNode = getCachedDocumentNodeFromSchema(schema);
  let result = '';

  const visitor = {
    FieldDefinition(node: FieldDefinitionNode) {
      // Transform the field AST node into a string, containing only the name of the field
      return node.name.value;
    },
    ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
      // "node.fields" is an array of strings, because we transformed it using "FieldDefinition".
      if(config.targetType === node.name.value) {
        node.fields?.map((field) => {
          result += `${field.name.value.replace(/([A-Z])/g, '_$1').toLowerCase()},`;
        })
      }
    },
  };
  visit(astNode, visitor);
  result += '\n';

  return result;
}
