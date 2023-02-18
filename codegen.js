"use strict";
// Description: Codegen configuration file for GraphQL Code Generator
// @see https://graphql-code-generator.com/docs/getting-started/codegen-config
Object.defineProperty(exports, "__esModule", { value: true });
const schemaLocation = ['lib/stacks/stack-api/schema.graphql', 'lib/stacks/stack-api/appsync.graphql'];
// For GLEC compliance copy content from ./configuration-examples/GLEC/activity-schema.graphql into ./activity-schema.graphql file
const config = {
    emitLegacyCommonJSImports: true,
    schema: schemaLocation,
    generates: {
        './lib/stacks/stack-web/app/sample-ui-cloudscape/public/assets/activity-input-template.csv': {
            plugins: ['./lib/codegen/csv.ts'],
            config: {
                targetType: 'Activity',
            },
        },
        // TODO: Graphql javascript operations generator
        // 'lib/stacks/stack-web/app/sample-ui-cloudscape/src/graphql/types.ts': {
        //   schema: ['lib/stacks/stack-api/schema.graphql', 'lib/stacks/stack-api/appsync.graphql'],
        //   plugins: ['typescript', 'typescript-operations'],
        //   config: {
        //     scalars: {
        //       AWSJSON: 'string',
        //       AWSDate: 'string',
        //       AWSTime: 'string',
        //       AWSDateTime: 'string',
        //       AWSTimestamp: 'number',
        //       AWSEmail: 'string',
        //       AWSURL: 'string',
        //       AWSPhone: 'string',
        //       AWSIPAddress: 'string',
        //     },
        //   },
        // },
        // TODO: DQ generator
        // lib/stacks/stack-data-pipeline/construct-data-quality/lambda/manage_dq_resources/dq_rules.json': {
        //   schema: schemaLocation,
        //   plugins: [__dirname + './lib/codegen/dq-rules.ts'],
        // },
        // TODO: Python types generator for calculator
        // 'lib/stacks/stack-data-pipeline/construct-calculator/lambda/types.py': {
        //   schema: schemaLocation,
        //   plugins: [__dirname + './lib/codegen/python-types.ts'],
        // },
    },
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWdlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZGVnZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFFQUFxRTtBQUNyRSw4RUFBOEU7O0FBSTlFLE1BQU0sY0FBYyxHQUFHLENBQUMscUNBQXFDLEVBQUUsc0NBQXNDLENBQUMsQ0FBQTtBQUV0RyxrSUFBa0k7QUFFbEksTUFBTSxNQUFNLEdBQWtCO0lBQzVCLHlCQUF5QixFQUFFLElBQUk7SUFDL0IsTUFBTSxFQUFFLGNBQWM7SUFDdEIsU0FBUyxFQUFFO1FBQ1QsMkZBQTJGLEVBQUU7WUFDM0YsT0FBTyxFQUFFLENBQUMsc0JBQXNCLENBQUM7WUFDakMsTUFBTSxFQUFFO2dCQUNOLFVBQVUsRUFBRSxVQUFVO2FBQ3ZCO1NBQ0Y7UUFDRCxnREFBZ0Q7UUFDaEQsMEVBQTBFO1FBQzFFLDZGQUE2RjtRQUM3RixzREFBc0Q7UUFDdEQsY0FBYztRQUNkLGlCQUFpQjtRQUNqQiwyQkFBMkI7UUFDM0IsMkJBQTJCO1FBQzNCLDJCQUEyQjtRQUMzQiwrQkFBK0I7UUFDL0IsZ0NBQWdDO1FBQ2hDLDRCQUE0QjtRQUM1QiwwQkFBMEI7UUFDMUIsNEJBQTRCO1FBQzVCLGdDQUFnQztRQUNoQyxTQUFTO1FBQ1QsT0FBTztRQUNQLEtBQUs7UUFDTCxxQkFBcUI7UUFDckIscUdBQXFHO1FBQ3JHLDRCQUE0QjtRQUM1Qix3REFBd0Q7UUFDeEQsS0FBSztRQUNMLDhDQUE4QztRQUM5QywyRUFBMkU7UUFDM0UsNEJBQTRCO1FBQzVCLDREQUE0RDtRQUM1RCxLQUFLO0tBQ047Q0FDRixDQUFBO0FBRUQsa0JBQWUsTUFBTSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRGVzY3JpcHRpb246IENvZGVnZW4gY29uZmlndXJhdGlvbiBmaWxlIGZvciBHcmFwaFFMIENvZGUgR2VuZXJhdG9yXG4vLyBAc2VlIGh0dHBzOi8vZ3JhcGhxbC1jb2RlLWdlbmVyYXRvci5jb20vZG9jcy9nZXR0aW5nLXN0YXJ0ZWQvY29kZWdlbi1jb25maWdcblxuaW1wb3J0IHsgQ29kZWdlbkNvbmZpZyB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vY2xpJ1xuXG5jb25zdCBzY2hlbWFMb2NhdGlvbiA9IFsnbGliL3N0YWNrcy9zdGFjay1hcGkvc2NoZW1hLmdyYXBocWwnLCAnbGliL3N0YWNrcy9zdGFjay1hcGkvYXBwc3luYy5ncmFwaHFsJ11cblxuLy8gRm9yIEdMRUMgY29tcGxpYW5jZSBjb3B5IGNvbnRlbnQgZnJvbSAuL2NvbmZpZ3VyYXRpb24tZXhhbXBsZXMvR0xFQy9hY3Rpdml0eS1zY2hlbWEuZ3JhcGhxbCBpbnRvIC4vYWN0aXZpdHktc2NoZW1hLmdyYXBocWwgZmlsZVxuXG5jb25zdCBjb25maWc6IENvZGVnZW5Db25maWcgPSB7XG4gIGVtaXRMZWdhY3lDb21tb25KU0ltcG9ydHM6IHRydWUsXG4gIHNjaGVtYTogc2NoZW1hTG9jYXRpb24sXG4gIGdlbmVyYXRlczoge1xuICAgICcuL2xpYi9zdGFja3Mvc3RhY2std2ViL2FwcC9zYW1wbGUtdWktY2xvdWRzY2FwZS9wdWJsaWMvYXNzZXRzL2FjdGl2aXR5LWlucHV0LXRlbXBsYXRlLmNzdic6IHtcbiAgICAgIHBsdWdpbnM6IFsnLi9saWIvY29kZWdlbi9jc3YudHMnXSxcbiAgICAgIGNvbmZpZzoge1xuICAgICAgICB0YXJnZXRUeXBlOiAnQWN0aXZpdHknLFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFRPRE86IEdyYXBocWwgamF2YXNjcmlwdCBvcGVyYXRpb25zIGdlbmVyYXRvclxuICAgIC8vICdsaWIvc3RhY2tzL3N0YWNrLXdlYi9hcHAvc2FtcGxlLXVpLWNsb3Vkc2NhcGUvc3JjL2dyYXBocWwvdHlwZXMudHMnOiB7XG4gICAgLy8gICBzY2hlbWE6IFsnbGliL3N0YWNrcy9zdGFjay1hcGkvc2NoZW1hLmdyYXBocWwnLCAnbGliL3N0YWNrcy9zdGFjay1hcGkvYXBwc3luYy5ncmFwaHFsJ10sXG4gICAgLy8gICBwbHVnaW5zOiBbJ3R5cGVzY3JpcHQnLCAndHlwZXNjcmlwdC1vcGVyYXRpb25zJ10sXG4gICAgLy8gICBjb25maWc6IHtcbiAgICAvLyAgICAgc2NhbGFyczoge1xuICAgIC8vICAgICAgIEFXU0pTT046ICdzdHJpbmcnLFxuICAgIC8vICAgICAgIEFXU0RhdGU6ICdzdHJpbmcnLFxuICAgIC8vICAgICAgIEFXU1RpbWU6ICdzdHJpbmcnLFxuICAgIC8vICAgICAgIEFXU0RhdGVUaW1lOiAnc3RyaW5nJyxcbiAgICAvLyAgICAgICBBV1NUaW1lc3RhbXA6ICdudW1iZXInLFxuICAgIC8vICAgICAgIEFXU0VtYWlsOiAnc3RyaW5nJyxcbiAgICAvLyAgICAgICBBV1NVUkw6ICdzdHJpbmcnLFxuICAgIC8vICAgICAgIEFXU1Bob25lOiAnc3RyaW5nJyxcbiAgICAvLyAgICAgICBBV1NJUEFkZHJlc3M6ICdzdHJpbmcnLFxuICAgIC8vICAgICB9LFxuICAgIC8vICAgfSxcbiAgICAvLyB9LFxuICAgIC8vIFRPRE86IERRIGdlbmVyYXRvclxuICAgIC8vIGxpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jb25zdHJ1Y3QtZGF0YS1xdWFsaXR5L2xhbWJkYS9tYW5hZ2VfZHFfcmVzb3VyY2VzL2RxX3J1bGVzLmpzb24nOiB7XG4gICAgLy8gICBzY2hlbWE6IHNjaGVtYUxvY2F0aW9uLFxuICAgIC8vICAgcGx1Z2luczogW19fZGlybmFtZSArICcuL2xpYi9jb2RlZ2VuL2RxLXJ1bGVzLnRzJ10sXG4gICAgLy8gfSxcbiAgICAvLyBUT0RPOiBQeXRob24gdHlwZXMgZ2VuZXJhdG9yIGZvciBjYWxjdWxhdG9yXG4gICAgLy8gJ2xpYi9zdGFja3Mvc3RhY2stZGF0YS1waXBlbGluZS9jb25zdHJ1Y3QtY2FsY3VsYXRvci9sYW1iZGEvdHlwZXMucHknOiB7XG4gICAgLy8gICBzY2hlbWE6IHNjaGVtYUxvY2F0aW9uLFxuICAgIC8vICAgcGx1Z2luczogW19fZGlybmFtZSArICcuL2xpYi9jb2RlZ2VuL3B5dGhvbi10eXBlcy50cyddLFxuICAgIC8vIH0sXG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbmZpZ1xuIl19