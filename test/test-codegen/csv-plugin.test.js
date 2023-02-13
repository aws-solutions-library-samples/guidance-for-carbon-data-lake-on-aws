"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@graphql-codegen/cli");
const graphql_1 = require("graphql");
const codegen_1 = require("../../lib/codegen");
describe('xlsx template generator', () => {
    // GIVEN
    const schema = (0, graphql_1.buildSchema)(/* GraphQL */ `
    type Activity {
      # TOC level information
      transportOperatorCompanyId: String! @description(text: "Transport operator company id")
      transportOperatorCompanyName: String!
    }
    directive @description(text: String!) on FIELD_DEFINITION
  `);
    it('Should output the right headers', async () => {
        const result = await (0, codegen_1.plugin)(schema, [], {
            fileFormat: codegen_1.FileFormat.CSV,
        });
        expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n');
    });
    it('Should generate the right file', async () => {
        // GIVEN
        const context = {
            schema: __dirname + '/resources/activity-schema.graphql',
            generates: {
                [__dirname + '/__generated__/test.csv']: {
                    plugins: ['./src/index.ts'],
                    config: {
                        fileFormat: codegen_1.FileFormat.CSV,
                    },
                },
            },
        };
        // WHEN
        const generatedFiles = await (0, cli_1.generate)(context, true);
        console.log(generatedFiles);
        //THEN
        expect(generatedFiles).toHaveLength(1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2LXBsdWdpbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3N2LXBsdWdpbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQWdEO0FBQ2hELHFDQUFzQztBQUN0QywrQ0FBdUQ7QUFFdkQsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxRQUFRO0lBQ1IsTUFBTSxNQUFNLEdBQUcsSUFBQSxxQkFBVyxFQUFDLGFBQWEsQ0FBQzs7Ozs7OztHQU94QyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLGdCQUFNLEVBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTtZQUN0QyxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxHQUFHO1NBQzNCLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsa0VBQWtFLENBQUMsQ0FBQztJQUMxRixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxLQUFLLElBQUksRUFBRTtRQUM5QyxRQUFRO1FBQ1IsTUFBTSxPQUFPLEdBQUc7WUFDZCxNQUFNLEVBQUUsU0FBUyxHQUFHLG9DQUFvQztZQUN4RCxTQUFTLEVBQUU7Z0JBQ1QsQ0FBQyxTQUFTLEdBQUcseUJBQXlCLENBQUMsRUFBRTtvQkFDdkMsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7b0JBQzNCLE1BQU0sRUFBRTt3QkFDTixVQUFVLEVBQUUsb0JBQVUsQ0FBQyxHQUFHO3FCQUMzQjtpQkFDRjthQUNGO1NBQ0YsQ0FBQztRQUVGLE9BQU87UUFDUCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUEsY0FBUSxFQUNuQyxPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTVCLE1BQU07UUFDTixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vY2xpJztcbmltcG9ydCB7IGJ1aWxkU2NoZW1hIH0gZnJvbSAnZ3JhcGhxbCc7XG5pbXBvcnQgeyBGaWxlRm9ybWF0LCBwbHVnaW4gfSBmcm9tICcuLi8uLi9saWIvY29kZWdlbic7XG5cbmRlc2NyaWJlKCd4bHN4IHRlbXBsYXRlIGdlbmVyYXRvcicsICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEoLyogR3JhcGhRTCAqLyBgXG4gICAgdHlwZSBBY3Rpdml0eSB7XG4gICAgICAjIFRPQyBsZXZlbCBpbmZvcm1hdGlvblxuICAgICAgdHJhbnNwb3J0T3BlcmF0b3JDb21wYW55SWQ6IFN0cmluZyEgQGRlc2NyaXB0aW9uKHRleHQ6IFwiVHJhbnNwb3J0IG9wZXJhdG9yIGNvbXBhbnkgaWRcIilcbiAgICAgIHRyYW5zcG9ydE9wZXJhdG9yQ29tcGFueU5hbWU6IFN0cmluZyFcbiAgICB9XG4gICAgZGlyZWN0aXZlIEBkZXNjcmlwdGlvbih0ZXh0OiBTdHJpbmchKSBvbiBGSUVMRF9ERUZJTklUSU9OXG4gIGApO1xuXG4gIGl0KCdTaG91bGQgb3V0cHV0IHRoZSByaWdodCBoZWFkZXJzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbihzY2hlbWEsIFtdLCB7XG4gICAgICBmaWxlRm9ybWF0OiBGaWxlRm9ybWF0LkNTVixcbiAgICB9KTtcblxuICAgIGV4cGVjdChyZXN1bHQpLnRvQmUoJ3RyYW5zcG9ydF9vcGVyYXRvcl9jb21wYW55X2lkLHRyYW5zcG9ydF9vcGVyYXRvcl9jb21wYW55X25hbWUsXFxuJyk7XG4gIH0pO1xuXG4gIGl0KCdTaG91bGQgZ2VuZXJhdGUgdGhlIHJpZ2h0IGZpbGUnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgc2NoZW1hOiBfX2Rpcm5hbWUgKyAnL3Jlc291cmNlcy9hY3Rpdml0eS1zY2hlbWEuZ3JhcGhxbCcsXG4gICAgICBnZW5lcmF0ZXM6IHtcbiAgICAgICAgW19fZGlybmFtZSArICcvX19nZW5lcmF0ZWRfXy90ZXN0LmNzdiddOiB7XG4gICAgICAgICAgcGx1Z2luczogWycuL3NyYy9pbmRleC50cyddLFxuICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgZmlsZUZvcm1hdDogRmlsZUZvcm1hdC5DU1YsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIFdIRU5cbiAgICBjb25zdCBnZW5lcmF0ZWRGaWxlcyA9IGF3YWl0IGdlbmVyYXRlKFxuICAgICAgY29udGV4dCxcbiAgICAgIHRydWUsXG4gICAgKTtcbiAgICBjb25zb2xlLmxvZyhnZW5lcmF0ZWRGaWxlcyk7XG5cbiAgICAvL1RIRU5cbiAgICBleHBlY3QoZ2VuZXJhdGVkRmlsZXMpLnRvSGF2ZUxlbmd0aCgxKTtcbiAgfSk7XG59KTtcbiJdfQ==