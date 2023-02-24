import { buildSchema } from 'graphql'
import { InputFileGeneratorConfig, plugin } from '../../lib/codegen/csv'

describe('csv template generator', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Activity {
      # TOC level information
      transportOperatorCompanyId: String! @input
      transportOperatorCompanyName: String! @input
      output: String
    }

    type ToBeIgnored {
      ignoredField: String!
    }

    directive @input on FIELD_DEFINITION
  `)

  it('Should include only the directive given in onlyIncludeDirectives', async () => {
    // GIVEN
    const config: InputFileGeneratorConfig = {
      targetType: 'Activity',
      onlyIncludeDirectives: ['input'],
    }

    // WHEN
    const result = await plugin(schema, [], config)

    // THEN
    expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n')
  })

  it('Should include all fields if onlyIncludeDirectives not specified', async () => {
    // GIVEN
    const config: InputFileGeneratorConfig = {
      targetType: 'Activity',
    }

    // WHEN
    const result = await plugin(schema, [], config)

    // THEN
    expect(result).toBe('transport_operator_company_id,transport_operator_company_name,output,\n')
  })
})
