import { RawAppSyncModelConfig } from '@aws-amplify/appsync-modelgen-plugin/lib/visitors/appsync-visitor'
import { buildSchema } from 'graphql'
import { plugin } from '../../lib/codegen/javascript-operations'

describe('javascript graphql operations generator', () => {
  it('Should create the right operations for @model types', async () => {
    // GIVEN
    const schema = buildSchema(/* GraphQL */ `
      type Activity @model {
        # TOC level information
        transportOperatorCompanyId: String! @input
        transportOperatorCompanyName: String!
      }
      directive @input on FIELD_DEFINITION
    `,
    {
      assumeValidSDL: true,
    })
    const config: RawAppSyncModelConfig = {
      target: 'javascript',
      codegenVersion: '1',
    };
    
    // WHEN
    const result = await plugin(schema, [], config)

    // THEN
    expect(result).toMatchSnapshot();
  })
})
