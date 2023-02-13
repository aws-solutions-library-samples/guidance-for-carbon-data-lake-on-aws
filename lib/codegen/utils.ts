import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FieldDefinitionNode, GraphQLSchema, ObjectTypeDefinitionNode, visit } from 'graphql';

export const schemaToHeaders = (schema: GraphQLSchema) => {
  const astNode = getCachedDocumentNodeFromSchema(schema);

  const data: any[] = [];
  const visitor = {
    FieldDefinition(node: FieldDefinitionNode) {
      // Transform the field AST node into a string, containing only the name of the field
      return node.name.value;
    },
    ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
      // "node.fields" is an array of strings, because we transformed it using "FieldDefinition".
      data.push({
        sheet: node.name.value,
        columns: node.fields?.map((field) => {
          // Extract description from @description directive
          const description: any = field.directives
            ?.find((directive) => directive.name.value === 'description')
            ?.arguments?.find((argument) => argument.name.value === 'text')?.value;
          const column = {
            label: field.name.value,
            description: description?.value,
            // TODO: add allowed value if enum type
          };
          return column;
        }),
      });
      return node.fields
        ?.map((field: any) => {
          return `${node.name.value}.${field.name.value}`;
        })
        .join('\n');
    },
  };
  visit(astNode, visitor);

  return data;
};
