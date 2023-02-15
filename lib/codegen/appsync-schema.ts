import { ModelTransformer } from '@aws-amplify/graphql-model-transformer'
import { GraphQLTransform } from '@aws-amplify/graphql-transformer-core'
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'
import { DirectiveNode, GraphQLDirective, GraphQLSchema, isSpecifiedDirective, isSpecifiedScalarType, print } from 'graphql'

export const plugin: PluginFunction = async (schema: GraphQLSchema, _documents: Types.DocumentFile[], _config: any) => {
  const modelTransformer = new ModelTransformer();
  const transformer = new GraphQLTransform({
    transformers: [modelTransformer],
  })

  const schemaAsString = printSchemaWithDirectives(schema, ['model'])

  const out = transformer.transform(schemaAsString)

  return out.schema
}

export const printSchemaWithDirectives = (schema: GraphQLSchema, includeDirectives: string[]): string => {
  const str = Object.keys(schema.getTypeMap())
    .filter(k => !k.match(/^__/))
    .reduce((accum: string, name: string) => {
      const type = schema.getType(name)
      if (
        type !== undefined &&
        type !== null &&
        !isSpecifiedScalarType(type as any) &&
        type?.astNode?.kind != 'ScalarTypeDefinition'
      ) {
        let printAST = print(type.astNode as any)
        // remove directives that are not in the includeDirectives list
        const directives: DirectiveNode[] = [];
        if(type.astNode?.directives) directives.push(...type.astNode.directives);
        if(type.astNode?.kind === 'ObjectTypeDefinition' && type.astNode?.fields) {
          type.astNode.fields.forEach(f => {if(f.directives) directives.push(...f.directives)});
        }
        console.log(`directives for ${name}: ${directives.map(d => d.name.value)}`)
        const toRemoveDirectives = directives.filter(d => !includeDirectives.includes(d?.name.value))
      
        if (toRemoveDirectives && toRemoveDirectives?.length > 0) {
          for (const directive of toRemoveDirectives) {
            console.log(`removing directive ${directive.name.value}`)
            const regex = new RegExp(`@${directive.name.value}`, 'g')
            printAST = printAST.replace(regex, '')
          }
        }

        accum += `${printAST}\n`
      }

      return accum
    }, '')

  return schema.getDirectives().reduce((accum: string, d: GraphQLDirective) => {
    return !isSpecifiedDirective(d) && d.astNode ? (accum += `${print(d.astNode)}\n`) : accum
  }, str + `\n`)
}
