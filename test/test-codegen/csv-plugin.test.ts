import { generate } from '@graphql-codegen/cli';
import { buildSchema } from 'graphql';
import { FileFormat, plugin } from '../../lib/codegen';

describe('xlsx template generator', () => {
  // GIVEN
  const schema = buildSchema(/* GraphQL */ `
    type Activity {
      # TOC level information
      transportOperatorCompanyId: String! @description(text: "Transport operator company id") @allowedValues(values: ["1", "2", "3"])
      transportOperatorCompanyName: String!
    }
    directive @description(text: String!) on FIELD_DEFINITION
    directive @allowedValues(values: [String!]!) on FIELD_DEFINITION
  `);

  it('Should output the right headers', async () => {
    const result = await plugin(schema, [], {
      fileFormat: FileFormat.CSV,
    });

    expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n');
  });
});
