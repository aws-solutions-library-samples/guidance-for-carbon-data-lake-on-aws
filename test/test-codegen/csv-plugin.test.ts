import { generate } from '@graphql-codegen/cli';
import { buildSchema } from 'graphql';
import { FileFormat, plugin } from '../../lib/codegen';

describe('xlsx template generator', () => {
  // GIVEN
  const schema = buildSchema(/* GraphQL */ `
    type Activity {
      # TOC level information
      transportOperatorCompanyId: String! @description(text: "Transport operator company id")
      transportOperatorCompanyName: String!
    }
    directive @description(text: String!) on FIELD_DEFINITION
  `);

  it('Should output the right headers', async () => {
    const result = await plugin(schema, [], {
      fileFormat: FileFormat.CSV,
    });

    expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n');
  });

  it('Should generate the right file', async () => {
    // GIVEN
    const context = {
      schema: __dirname + '/resources/activity-schema.graphql',
      generates: {
        [__dirname + '/__generated__/test.csv']: {
          plugins: ['../../lib/codegen/index.ts'],
          config: {
            fileFormat: FileFormat.CSV,
          },
        },
      },
    };

    // WHEN
    const generatedFiles = await generate(
      context,
      true,
    );

    //THEN
    expect(generatedFiles).toHaveLength(1);
  });
});
