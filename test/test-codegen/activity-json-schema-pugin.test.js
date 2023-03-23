"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const activity_json_schema_1 = require("../../lib/codegen/activity-json-schema");
describe('activity json schema generator', () => {
    it('Should output a json schema from a graphql type for Activity', async () => {
        // GIVEN
        const schema = (0, graphql_1.buildSchema)(
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
      `, {
            assumeValidSDL: true,
        });
        // WHEN
        const result = await (0, activity_json_schema_1.plugin)(schema, [], {});
        // THEN
        expect(result).toMatchSnapshot();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHktanNvbi1zY2hlbWEtcHVnaW4udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFjdGl2aXR5LWpzb24tc2NoZW1hLXB1Z2luLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBcUM7QUFDckMsaUZBQStEO0FBRS9ELFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7SUFDOUMsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzVFLFFBQVE7UUFDUixNQUFNLE1BQU0sR0FBRyxJQUFBLHFCQUFXO1FBQ3hCLGFBQWEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQThDYixFQUNEO1lBQ0UsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FDRixDQUFBO1FBRUQsT0FBTztRQUNQLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSw2QkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFM0MsT0FBTztRQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtJQUNsQyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYnVpbGRTY2hlbWEgfSBmcm9tICdncmFwaHFsJ1xuaW1wb3J0IHsgcGx1Z2luIH0gZnJvbSAnLi4vLi4vbGliL2NvZGVnZW4vYWN0aXZpdHktanNvbi1zY2hlbWEnXG5cbmRlc2NyaWJlKCdhY3Rpdml0eSBqc29uIHNjaGVtYSBnZW5lcmF0b3InLCAoKSA9PiB7XG4gIGl0KCdTaG91bGQgb3V0cHV0IGEganNvbiBzY2hlbWEgZnJvbSBhIGdyYXBocWwgdHlwZSBmb3IgQWN0aXZpdHknLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBzY2hlbWEgPSBidWlsZFNjaGVtYShcbiAgICAgIC8qIEdyYXBoUUwgKi8gYFxuICAgICAgc2NhbGFyIEFXU0RhdGVcbiAgICAgIHNjYWxhciBBV1NUaW1lXG4gICAgICBzY2FsYXIgQVdTRGF0ZVRpbWVcbiAgICAgIHNjYWxhciBBV1NUaW1lc3RhbXBcbiAgICAgIHNjYWxhciBBV1NFbWFpbFxuICAgICAgc2NhbGFyIEFXU0pTT05cbiAgICAgIHNjYWxhciBBV1NVUkxcbiAgICAgIHNjYWxhciBBV1NQaG9uZVxuICAgICAgc2NhbGFyIEFXU0lQQWRkcmVzc1xuICAgICAgXG4gICAgICB0eXBlIEFjdGl2aXR5IEBtb2RlbCB7XG4gICAgICAgICAgaWQ6IElEICNyZXF1aXJlZFxuICAgICAgICAgIGFjdGl2aXR5X2V2ZW50X2lkOiBTdHJpbmchIEBpbnB1dFxuICAgICAgICAgIGFzc2V0X2lkOiBTdHJpbmcgQGlucHV0XG4gICAgICAgICAgYWN0aXZpdHk6IFN0cmluZyBAaW5wdXRcbiAgICAgICAgICBjYXRlZ29yeTogU3RyaW5nIEBpbnB1dFxuICAgICAgICAgIHNjb3BlOiBTdHJpbmcgQGlucHV0XG4gICAgICAgICAgZ2VvOiBBV1NKU09OIEBpbnB1dFxuICAgICAgICAgIG9yaWdpbl9tZWFzdXJlbWVudF90aW1lc3RhbXA6IFN0cmluZyBAaW5wdXRcbiAgICAgICAgICByYXdfZGF0YTogRmxvYXQgQGlucHV0XG4gICAgICAgICAgc291cmNlOiBTdHJpbmcgQGlucHV0XG4gICAgICAgICAgdW5pdHM6IFN0cmluZyBAaW5wdXRcbiAgICAgICAgICBlbWlzc2lvbnNfb3V0cHV0OiBBV1NKU09OXG4gICAgICAgICAgY3JlYXRlZEF0OiBBV1NEYXRlVGltZSAjcmVxdWlyZWRcbiAgICAgICAgICB1cGRhdGVkQXQ6IEFXU0RhdGVUaW1lICNyZXF1aXJlZFxuICAgICAgfVxuICAgICAgXG4gICAgICB0eXBlIEVtaXNzaW9uRmFjdG9yIHtcbiAgICAgICAgICBjYXRlZ29yeTogU3RyaW5nISBAbG9va3VwXG4gICAgICAgICAgYWN0aXZpdHk6IFN0cmluZyEgQGxvb2t1cFxuICAgICAgICAgIHNjb3BlOiBJbnQhIEBsb29rdXBcbiAgICAgICAgICBjbzJfZmFjdG9yOiBGbG9hdFxuICAgICAgICAgIGNoNF9mYWN0b3I6IEZsb2F0XG4gICAgICAgICAgbjJvX2ZhY3RvcjogRmxvYXRcbiAgICAgICAgICBiaW9mdWVsX2NvMjogRmxvYXRcbiAgICAgICAgICBBUjRfa2djbzJlOiBGbG9hdFxuICAgICAgICAgIEFSNV9rZ2NvMmU6IEZsb2F0XG4gICAgICAgICAgdW5pdHM6IFN0cmluZyFcbiAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IFN0cmluZ1xuICAgICAgICAgIHNvdXJjZTogU3RyaW5nXG4gICAgICAgICAgc291cmNlX29yaWdpbjogU3RyaW5nXG4gICAgICB9XG4gICAgICBcbiAgICAgIGRpcmVjdGl2ZSBAbG9va3VwIG9uIEZJRUxEX0RFRklOSVRJT05cbiAgICAgIGRpcmVjdGl2ZSBAaW5wdXQgb24gRklFTERfREVGSU5JVElPTlxuICAgICAgYCxcbiAgICAgIHtcbiAgICAgICAgYXNzdW1lVmFsaWRTREw6IHRydWUsXG4gICAgICB9XG4gICAgKVxuXG4gICAgLy8gV0hFTlxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBsdWdpbihzY2hlbWEsIFtdLCB7fSlcblxuICAgIC8vIFRIRU5cbiAgICBleHBlY3QocmVzdWx0KS50b01hdGNoU25hcHNob3QoKVxuICB9KVxufSlcbiJdfQ==