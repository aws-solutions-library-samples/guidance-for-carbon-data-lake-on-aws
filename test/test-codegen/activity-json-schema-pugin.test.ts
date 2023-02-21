import { buildSchema } from 'graphql'
import { plugin } from '../../lib/codegen/activity-json-schema'

describe('activity json schema generator', () => {
  it('Should output a json schema from a graphql type for Activity', async () => {
    // GIVEN
    const schema = buildSchema(
      /* GraphQL */ `
      scalar AWSDate
      scalar AWSTime
      scalar AWSDateTime
      scalar AWSTimestamp
      scalar AWSEmail
      scalar AWSJSON
      scalar AWSURL
      scalar AWSPhone
      scalar AWSIPAddress
      
      type Activity @model {
          id: ID #required
          activity_event_id: String! @input
          asset_id: String @input
          activity: String @input
          category: String @input
          scope: String @input
          geo: AWSJSON @input
          origin_measurement_timestamp: String @input
          raw_data: Float @input
          source: String @input
          units: String @input
          emissions_output: AWSJSON
          createdAt: AWSDateTime #required
          updatedAt: AWSDateTime #required
      }
      
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
      
      directive @lookup on FIELD_DEFINITION
      directive @input on FIELD_DEFINITION
      `,
      {
        assumeValidSDL: true,
      }
    )

    // WHEN
    const result = await plugin(schema, [], {})

    // THEN
    expect(result).toMatchSnapshot()
  })
})
