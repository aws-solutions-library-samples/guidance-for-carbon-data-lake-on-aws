"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const field_directives_to_json_array_1 = require("../../lib/codegen/field-directives-to-json-array");
describe('json template generator', () => {
    it('Should output the right json file', async () => {
        // GIVEN
        const schema = (0, graphql_1.buildSchema)(/* GraphQL */ `
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
    `);
        // WHEN
        const result = await (0, field_directives_to_json_array_1.plugin)(schema, [], {
            targetType: 'EmissionFactor',
            directive: 'lookup'
        });
        // THEN
        expect(result).toBe('["category","activity","scope"]');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtZGlyZWN0aXZlcy10by1qc29uLWFycmF5LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWVsZC1kaXJlY3RpdmVzLXRvLWpzb24tYXJyYXkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQyxxR0FBeUU7QUFFekUsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxFQUFFLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDakQsUUFBUTtRQUNSLE1BQU0sTUFBTSxHQUFHLElBQUEscUJBQVcsRUFBQyxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQWtCeEMsQ0FBQyxDQUFBO1FBRUYsT0FBTztRQUNQLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx1Q0FBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDdEMsVUFBVSxFQUFFLGdCQUFnQjtZQUM1QixTQUFTLEVBQUUsUUFBUTtTQUNwQixDQUFDLENBQUE7UUFFRixPQUFPO1FBQ1AsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO0lBQ3hELENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBidWlsZFNjaGVtYSB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgeyBwbHVnaW4gfSBmcm9tICcuLi8uLi9saWIvY29kZWdlbi9maWVsZC1kaXJlY3RpdmVzLXRvLWpzb24tYXJyYXknXG5cbmRlc2NyaWJlKCdqc29uIHRlbXBsYXRlIGdlbmVyYXRvcicsICgpID0+IHtcbiAgaXQoJ1Nob3VsZCBvdXRwdXQgdGhlIHJpZ2h0IGpzb24gZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICAvLyBHSVZFTlxuICAgIGNvbnN0IHNjaGVtYSA9IGJ1aWxkU2NoZW1hKC8qIEdyYXBoUUwgKi8gYFxuICAgICAgZGlyZWN0aXZlIEBsb29rdXAgb24gRklFTERfREVGSU5JVElPTlxuXG4gICAgICB0eXBlIEVtaXNzaW9uRmFjdG9yIHtcbiAgICAgICAgY2F0ZWdvcnk6IFN0cmluZyEgQGxvb2t1cFxuICAgICAgICBhY3Rpdml0eTogU3RyaW5nISBAbG9va3VwXG4gICAgICAgIHNjb3BlOiBJbnQhIEBsb29rdXBcbiAgICAgICAgY28yX2ZhY3RvcjogRmxvYXRcbiAgICAgICAgY2g0X2ZhY3RvcjogRmxvYXRcbiAgICAgICAgbjJvX2ZhY3RvcjogRmxvYXRcbiAgICAgICAgYmlvZnVlbF9jbzI6IEZsb2F0XG4gICAgICAgIEFSNF9rZ2NvMmU6IEZsb2F0XG4gICAgICAgIEFSNV9rZ2NvMmU6IEZsb2F0XG4gICAgICAgIHVuaXRzOiBTdHJpbmchXG4gICAgICAgIGxhc3RfdXBkYXRlZDogU3RyaW5nXG4gICAgICAgIHNvdXJjZTogU3RyaW5nXG4gICAgICAgIHNvdXJjZV9vcmlnaW46IFN0cmluZ1xuICAgICAgfVxuICAgIGApXG5cbiAgICAvLyBXSEVOXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luKHNjaGVtYSwgW10sIHtcbiAgICAgIHRhcmdldFR5cGU6ICdFbWlzc2lvbkZhY3RvcicsXG4gICAgICBkaXJlY3RpdmU6ICdsb29rdXAnXG4gICAgfSlcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3QocmVzdWx0KS50b0JlKCdbXCJjYXRlZ29yeVwiLFwiYWN0aXZpdHlcIixcInNjb3BlXCJdJylcbiAgfSlcbn0pXG4iXX0=