"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const csv_1 = require("../../lib/codegen/csv");
describe('csv template generator', () => {
    const schema = (0, graphql_1.buildSchema)(/* GraphQL */ `
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
  `);
    it('Should include only the directive given in onlyIncludeDirectives', async () => {
        // GIVEN
        const config = {
            targetType: 'Activity',
            onlyIncludeDirectives: ['input'],
        };
        // WHEN
        const result = await (0, csv_1.plugin)(schema, [], config);
        // THEN
        expect(result).toBe('transport_operator_company_id,transport_operator_company_name,\n');
    });
    it('Should include all fields if onlyIncludeDirectives not specified', async () => {
        // GIVEN
        const config = {
            targetType: 'Activity',
        };
        // WHEN
        const result = await (0, csv_1.plugin)(schema, [], config);
        // THEN
        expect(result).toBe('transport_operator_company_id,transport_operator_company_name,output,\n');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3N2LXBsdWdpbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3N2LXBsdWdpbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXFDO0FBQ3JDLCtDQUF3RTtBQUV4RSxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUEscUJBQVcsRUFBQyxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7R0FheEMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ2hGLFFBQVE7UUFDUixNQUFNLE1BQU0sR0FBNkI7WUFDdkMsVUFBVSxFQUFFLFVBQVU7WUFDdEIscUJBQXFCLEVBQUUsQ0FBQyxPQUFPLENBQUM7U0FDakMsQ0FBQTtRQUVELE9BQU87UUFDUCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsWUFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFL0MsT0FBTztRQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsa0VBQWtFLENBQUMsQ0FBQTtJQUN6RixDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNoRixRQUFRO1FBQ1IsTUFBTSxNQUFNLEdBQTZCO1lBQ3ZDLFVBQVUsRUFBRSxVQUFVO1NBQ3ZCLENBQUE7UUFFRCxPQUFPO1FBQ1AsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLFlBQU0sRUFBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRS9DLE9BQU87UUFDUCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLHlFQUF5RSxDQUFDLENBQUE7SUFDaEcsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGJ1aWxkU2NoZW1hIH0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCB7IElucHV0RmlsZUdlbmVyYXRvckNvbmZpZywgcGx1Z2luIH0gZnJvbSAnLi4vLi4vbGliL2NvZGVnZW4vY3N2J1xuXG5kZXNjcmliZSgnY3N2IHRlbXBsYXRlIGdlbmVyYXRvcicsICgpID0+IHtcbiAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEoLyogR3JhcGhRTCAqLyBgXG4gICAgdHlwZSBBY3Rpdml0eSB7XG4gICAgICAjIFRPQyBsZXZlbCBpbmZvcm1hdGlvblxuICAgICAgdHJhbnNwb3J0T3BlcmF0b3JDb21wYW55SWQ6IFN0cmluZyEgQGlucHV0XG4gICAgICB0cmFuc3BvcnRPcGVyYXRvckNvbXBhbnlOYW1lOiBTdHJpbmchIEBpbnB1dFxuICAgICAgb3V0cHV0OiBTdHJpbmdcbiAgICB9XG5cbiAgICB0eXBlIFRvQmVJZ25vcmVkIHtcbiAgICAgIGlnbm9yZWRGaWVsZDogU3RyaW5nIVxuICAgIH1cblxuICAgIGRpcmVjdGl2ZSBAaW5wdXQgb24gRklFTERfREVGSU5JVElPTlxuICBgKVxuXG4gIGl0KCdTaG91bGQgaW5jbHVkZSBvbmx5IHRoZSBkaXJlY3RpdmUgZ2l2ZW4gaW4gb25seUluY2x1ZGVEaXJlY3RpdmVzJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIEdJVkVOXG4gICAgY29uc3QgY29uZmlnOiBJbnB1dEZpbGVHZW5lcmF0b3JDb25maWcgPSB7XG4gICAgICB0YXJnZXRUeXBlOiAnQWN0aXZpdHknLFxuICAgICAgb25seUluY2x1ZGVEaXJlY3RpdmVzOiBbJ2lucHV0J10sXG4gICAgfVxuXG4gICAgLy8gV0hFTlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbihzY2hlbWEsIFtdLCBjb25maWcpXG5cbiAgICAvLyBUSEVOXG4gICAgZXhwZWN0KHJlc3VsdCkudG9CZSgndHJhbnNwb3J0X29wZXJhdG9yX2NvbXBhbnlfaWQsdHJhbnNwb3J0X29wZXJhdG9yX2NvbXBhbnlfbmFtZSxcXG4nKVxuICB9KVxuXG4gIGl0KCdTaG91bGQgaW5jbHVkZSBhbGwgZmllbGRzIGlmIG9ubHlJbmNsdWRlRGlyZWN0aXZlcyBub3Qgc3BlY2lmaWVkJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIEdJVkVOXG4gICAgY29uc3QgY29uZmlnOiBJbnB1dEZpbGVHZW5lcmF0b3JDb25maWcgPSB7XG4gICAgICB0YXJnZXRUeXBlOiAnQWN0aXZpdHknLFxuICAgIH1cblxuICAgIC8vIFdIRU5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4oc2NoZW1hLCBbXSwgY29uZmlnKVxuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChyZXN1bHQpLnRvQmUoJ3RyYW5zcG9ydF9vcGVyYXRvcl9jb21wYW55X2lkLHRyYW5zcG9ydF9vcGVyYXRvcl9jb21wYW55X25hbWUsb3V0cHV0LFxcbicpXG4gIH0pXG59KVxuIl19