"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const appsync_schema_1 = require("../../lib/codegen/appsync-schema");
describe('appsync schema generator', () => {
    it('Should output the right headers', async () => {
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
        type Activity @model @testObject {
          # TOC level information
          transportOperatorCompanyId: String! @testField
          transportOperatorCompanyName: AWSJSON!
        }
        directive @testObject on OBJECT
        directive @testField on FIELD_DEFINITION
      `, {
            assumeValidSDL: true,
        });
        // WHEN
        const result = await (0, appsync_schema_1.plugin)(schema, [], {});
        // THEN
        expect(result).toMatchSnapshot();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwc3luYy1zY2hlbWEtcGx1Z2luLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBzeW5jLXNjaGVtYS1wbHVnaW4udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFDQUFxQztBQUNyQyxxRUFBeUQ7QUFFekQsUUFBUSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtJQUN4QyxFQUFFLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDL0MsUUFBUTtRQUNSLE1BQU0sTUFBTSxHQUFHLElBQUEscUJBQVc7UUFDeEIsYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztPQWlCYixFQUNEO1lBQ0UsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FDRixDQUFBO1FBRUQsT0FBTztRQUNQLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSx1QkFBTSxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFM0MsT0FBTztRQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtJQUNsQyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYnVpbGRTY2hlbWEgfSBmcm9tICdncmFwaHFsJ1xuaW1wb3J0IHsgcGx1Z2luIH0gZnJvbSAnLi4vLi4vbGliL2NvZGVnZW4vYXBwc3luYy1zY2hlbWEnXG5cbmRlc2NyaWJlKCdhcHBzeW5jIHNjaGVtYSBnZW5lcmF0b3InLCAoKSA9PiB7XG4gIGl0KCdTaG91bGQgb3V0cHV0IHRoZSByaWdodCBoZWFkZXJzJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIEdJVkVOXG4gICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEoXG4gICAgICAvKiBHcmFwaFFMICovIGBcbiAgICAgICAgc2NhbGFyIEFXU0RhdGVcbiAgICAgICAgc2NhbGFyIEFXU1RpbWVcbiAgICAgICAgc2NhbGFyIEFXU0RhdGVUaW1lXG4gICAgICAgIHNjYWxhciBBV1NUaW1lc3RhbXBcbiAgICAgICAgc2NhbGFyIEFXU0VtYWlsXG4gICAgICAgIHNjYWxhciBBV1NKU09OXG4gICAgICAgIHNjYWxhciBBV1NVUkxcbiAgICAgICAgc2NhbGFyIEFXU1Bob25lXG4gICAgICAgIHNjYWxhciBBV1NJUEFkZHJlc3NcbiAgICAgICAgdHlwZSBBY3Rpdml0eSBAbW9kZWwgQHRlc3RPYmplY3Qge1xuICAgICAgICAgICMgVE9DIGxldmVsIGluZm9ybWF0aW9uXG4gICAgICAgICAgdHJhbnNwb3J0T3BlcmF0b3JDb21wYW55SWQ6IFN0cmluZyEgQHRlc3RGaWVsZFxuICAgICAgICAgIHRyYW5zcG9ydE9wZXJhdG9yQ29tcGFueU5hbWU6IEFXU0pTT04hXG4gICAgICAgIH1cbiAgICAgICAgZGlyZWN0aXZlIEB0ZXN0T2JqZWN0IG9uIE9CSkVDVFxuICAgICAgICBkaXJlY3RpdmUgQHRlc3RGaWVsZCBvbiBGSUVMRF9ERUZJTklUSU9OXG4gICAgICBgLFxuICAgICAge1xuICAgICAgICBhc3N1bWVWYWxpZFNETDogdHJ1ZSxcbiAgICAgIH1cbiAgICApXG5cbiAgICAvLyBXSEVOXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGx1Z2luKHNjaGVtYSwgW10sIHt9KVxuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChyZXN1bHQpLnRvTWF0Y2hTbmFwc2hvdCgpXG4gIH0pXG59KVxuIl19