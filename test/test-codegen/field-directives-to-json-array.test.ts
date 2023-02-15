import { buildSchema } from 'graphql'
import { plugin } from '../../lib/codegen/field-directives-to-json-array'

describe('json template generator', () => {
  it('Should output the right json file', async () => {
    // GIVEN
    const schema = buildSchema(/* GraphQL */ `
      directive @lookup on FIELD_DEFINITION

      type EmissionFactor {
        category: String! @lookup
        activity: String! @lookup
        scope: Int! @lookup
        co2_factor: Float
        ch4_factor: Float
        n2o_factor: Float
        biofuel_co2: Float
        AR4_kgco2e: Float
        AR5_kgco2e: Float
        units: String!
        last_updated: String
        source: String
        source_origin: String
      }
    `)

    // WHEN
    const result = await plugin(schema, [], {
      targetType: 'EmissionFactor',
      directive: 'lookup'
    })

    // THEN
    expect(result).toBe('["category","activity","scope"]')
  })
})
