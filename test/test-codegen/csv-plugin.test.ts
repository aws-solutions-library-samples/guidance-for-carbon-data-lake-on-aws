import { buildSchema } from 'graphql'
import { plugin } from '../../lib/codegen/csv'

describe('csv template generator', () => {
  it('Should output the right headers', async () => {
    // GIVEN
    const schema = buildSchema(/* GraphQL */ `
      type Activity {
        # TOC level information
        transportOperatorCompanyId: String!
        transportOperatorCompanyName: String!
      }

      type ToBeIgnored {
        ignoredField: String!
      }
    `)
    
    // WHEN
    const result = await plugin(schema, [], {
      targetType: 'Activity',
    })

    // THEN
    expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n')
  })
})
