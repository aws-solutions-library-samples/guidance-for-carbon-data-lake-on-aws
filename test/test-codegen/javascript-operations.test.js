"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const javascript_operations_1 = require("../../lib/codegen/javascript-operations");
describe('javascript graphql operations generator', () => {
    it('Should create the right operations for @model types', async () => {
        // GIVEN
        const schema = (0, graphql_1.buildSchema)(/* GraphQL */ `
      type Activity @model {
        # TOC level information
        transportOperatorCompanyId: String! @input
        transportOperatorCompanyName: String!
      }
      directive @input on FIELD_DEFINITION
    `, {
            assumeValidSDL: true,
        });
        const config = {
            target: 'javascript',
            codegenVersion: '1',
        };
        // WHEN
        const result = await (0, javascript_operations_1.plugin)(schema, [], config);
        // THEN
        expect(result).toMatchSnapshot();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamF2YXNjcmlwdC1vcGVyYXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJqYXZhc2NyaXB0LW9wZXJhdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUFxQztBQUNyQyxtRkFBZ0U7QUFFaEUsUUFBUSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtJQUN2RCxFQUFFLENBQUMscURBQXFELEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDbkUsUUFBUTtRQUNSLE1BQU0sTUFBTSxHQUFHLElBQUEscUJBQVcsRUFBQyxhQUFhLENBQUM7Ozs7Ozs7S0FPeEMsRUFDRDtZQUNFLGNBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQUMsQ0FBQTtRQUNGLE1BQU0sTUFBTSxHQUEwQjtZQUNwQyxNQUFNLEVBQUUsWUFBWTtZQUNwQixjQUFjLEVBQUUsR0FBRztTQUNwQixDQUFDO1FBRUYsT0FBTztRQUNQLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSw4QkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFL0MsT0FBTztRQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUNuQyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmF3QXBwU3luY01vZGVsQ29uZmlnIH0gZnJvbSAnQGF3cy1hbXBsaWZ5L2FwcHN5bmMtbW9kZWxnZW4tcGx1Z2luL2xpYi92aXNpdG9ycy9hcHBzeW5jLXZpc2l0b3InXG5pbXBvcnQgeyBidWlsZFNjaGVtYSB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgeyBwbHVnaW4gfSBmcm9tICcuLi8uLi9saWIvY29kZWdlbi9qYXZhc2NyaXB0LW9wZXJhdGlvbnMnXG5cbmRlc2NyaWJlKCdqYXZhc2NyaXB0IGdyYXBocWwgb3BlcmF0aW9ucyBnZW5lcmF0b3InLCAoKSA9PiB7XG4gIGl0KCdTaG91bGQgY3JlYXRlIHRoZSByaWdodCBvcGVyYXRpb25zIGZvciBAbW9kZWwgdHlwZXMnLCBhc3luYyAoKSA9PiB7XG4gICAgLy8gR0lWRU5cbiAgICBjb25zdCBzY2hlbWEgPSBidWlsZFNjaGVtYSgvKiBHcmFwaFFMICovIGBcbiAgICAgIHR5cGUgQWN0aXZpdHkgQG1vZGVsIHtcbiAgICAgICAgIyBUT0MgbGV2ZWwgaW5mb3JtYXRpb25cbiAgICAgICAgdHJhbnNwb3J0T3BlcmF0b3JDb21wYW55SWQ6IFN0cmluZyEgQGlucHV0XG4gICAgICAgIHRyYW5zcG9ydE9wZXJhdG9yQ29tcGFueU5hbWU6IFN0cmluZyFcbiAgICAgIH1cbiAgICAgIGRpcmVjdGl2ZSBAaW5wdXQgb24gRklFTERfREVGSU5JVElPTlxuICAgIGAsXG4gICAge1xuICAgICAgYXNzdW1lVmFsaWRTREw6IHRydWUsXG4gICAgfSlcbiAgICBjb25zdCBjb25maWc6IFJhd0FwcFN5bmNNb2RlbENvbmZpZyA9IHtcbiAgICAgIHRhcmdldDogJ2phdmFzY3JpcHQnLFxuICAgICAgY29kZWdlblZlcnNpb246ICcxJyxcbiAgICB9O1xuICAgIFxuICAgIC8vIFdIRU5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwbHVnaW4oc2NoZW1hLCBbXSwgY29uZmlnKVxuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChyZXN1bHQpLnRvTWF0Y2hTbmFwc2hvdCgpO1xuICB9KVxufSlcbiJdfQ==