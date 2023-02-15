import { buildSchema } from 'graphql'
import { plugin } from '../../lib/codegen/appsync-schema'

describe('appsync schema generator', () => {
  it('Should output the right headers', async () => {
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
        type Activity @model @testObject {
          # TOC level information
          transportOperatorCompanyId: String! @testField
          transportOperatorCompanyName: AWSJSON!
        }
        directive @testObject on OBJECT
        directive @testField on FIELD_DEFINITION
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
