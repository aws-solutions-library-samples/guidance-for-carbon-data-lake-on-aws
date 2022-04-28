"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonLakeQuickStartApiStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_appsync_1 = require("aws-cdk-lib/aws-appsync");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const fs_1 = require("fs");
class CarbonLakeQuickStartApiStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const graphQLApi = new aws_appsync_1.CfnGraphQLApi(this, 'CarbonLakeApi', {
            name: 'carbonlake-api',
            authenticationType: 'API_KEY'
        });
        new aws_appsync_1.CfnApiKey(this, 'CarbonLakeApiKey', {
            apiId: graphQLApi.attrApiId
        });
        const apiSchema = new aws_appsync_1.CfnGraphQLSchema(this, 'CarbonLakeSchema', {
            apiId: graphQLApi.attrApiId,
            definition: fs_1.readFileSync('./lib/api/schema.graphql', 'utf8')
            /* `
                type ${tableName} {
                    record_id: ID!
                    name: String
                }
                type Paginated${tableName} {
                    items: [${tableName}!]!
                    nextToken: String
                }
                type Query {
                    all(limit: Int, nextToken: String): Paginated${tableName}!
                    getOne(${tableName}Id: ID!): ${tableName}
                }
                type Mutation {
                    save(name: String!): ${tableName}
                    delete(${tableName}Id: ID!): ${tableName}
                }
                type Schema {
                    query: Query
                    mutation: Mutation
                }
            `*/
        });
        const calculatorOutputTableRole = new aws_iam_1.Role(this, `CalculatorOutputDynamoDBRole`, {
            assumedBy: new aws_iam_1.ServicePrincipal('appsync.amazonaws.com')
        });
        calculatorOutputTableRole.addManagedPolicy(aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
        const dataSource = new aws_appsync_1.CfnDataSource(this, 'CalculatorOutputDataSource', {
            apiId: graphQLApi.attrApiId,
            name: 'CalculatorOutputDataSource',
            type: 'AMAZON_DYNAMODB',
            dynamoDbConfig: {
                tableName: props.calculatorOutputTableRef.tableName,
                awsRegion: this.region
            },
            serviceRoleArn: calculatorOutputTableRole.roleArn
        });
        const getOneResolver = new aws_appsync_1.CfnResolver(this, 'GetOneQueryResolver', {
            apiId: graphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'getOne',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "GetItem",
                "key": {
                    "record_id": $util.dynamodb.toDynamoDBJson($ctx.args.record_id)
                }
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        getOneResolver.addDependsOn(apiSchema);
        const getAllResolver = new aws_appsync_1.CfnResolver(this, 'GetAllQueryResolver', {
            apiId: graphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'all',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "Scan",
                "limit": $util.defaultIfNull($ctx.args.limit, 20),
                "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        getAllResolver.addDependsOn(apiSchema);
        const deleteResolver = new aws_appsync_1.CfnResolver(this, 'DeleteMutationResolver', {
            apiId: graphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'delete',
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
                "version": "2017-02-28",
                "operation": "DeleteItem",
                "key": {
                    "record_id": $util.dynamodb.toDynamoDBJson($ctx.args.record_id)
                }
            }`,
            responseMappingTemplate: `$util.toJson($ctx.result)`
        });
        deleteResolver.addDependsOn(apiSchema);
    }
}
exports.CarbonLakeQuickStartApiStack = CarbonLakeQuickStartApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBb0M7QUFDcEMseURBQWlIO0FBQ2pILGlEQUE0RTtBQUU1RSwyQkFBa0M7QUFNbEMsTUFBYSw0QkFBNkIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN2RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdDO1FBQzlFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQWEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3hELElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsa0JBQWtCLEVBQUUsU0FBUztTQUNoQyxDQUFDLENBQUM7UUFFSCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3BDLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUztTQUM5QixDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLDhCQUFnQixDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM3RCxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDM0IsVUFBVSxFQUFFLGlCQUFZLENBQUMsMEJBQTBCLEVBQUMsTUFBTSxDQUFDO1lBRTNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFxQkc7U0FDTixDQUFDLENBQUM7UUFFSCxNQUFNLHlCQUF5QixHQUFHLElBQUksY0FBSSxDQUFDLElBQUksRUFBRSw4QkFBOEIsRUFBRTtZQUM3RSxTQUFTLEVBQUUsSUFBSSwwQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQztTQUMzRCxDQUFDLENBQUM7UUFFSCx5QkFBeUIsQ0FBQyxnQkFBZ0IsQ0FBQyx1QkFBYSxDQUFDLHdCQUF3QixDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUUvRyxNQUFNLFVBQVUsR0FBRyxJQUFJLDJCQUFhLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQ3JFLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUztZQUMzQixJQUFJLEVBQUUsNEJBQTRCO1lBQ2xDLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsY0FBYyxFQUFFO2dCQUNaLFNBQVMsRUFBRSxLQUFLLENBQUMsd0JBQXdCLENBQUMsU0FBUztnQkFDbkQsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3pCO1lBQ0QsY0FBYyxFQUFFLHlCQUF5QixDQUFDLE9BQU87U0FDcEQsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNoRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDM0IsUUFBUSxFQUFFLE9BQU87WUFDakIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsY0FBYyxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQy9CLHNCQUFzQixFQUFFOzs7Ozs7Y0FNdEI7WUFDRix1QkFBdUIsRUFBRSwyQkFBMkI7U0FDdkQsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV2QyxNQUFNLGNBQWMsR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ2hFLEtBQUssRUFBRSxVQUFVLENBQUMsU0FBUztZQUMzQixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsS0FBSztZQUNoQixjQUFjLEVBQUUsVUFBVSxDQUFDLElBQUk7WUFDL0Isc0JBQXNCLEVBQUU7Ozs7O2NBS3RCO1lBQ0YsdUJBQXVCLEVBQUUsMkJBQTJCO1NBQ3ZELENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFdkMsTUFBTSxjQUFjLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksRUFBRSx3QkFBd0IsRUFBRTtZQUNuRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDM0IsUUFBUSxFQUFFLFVBQVU7WUFDcEIsU0FBUyxFQUFFLFFBQVE7WUFDbkIsY0FBYyxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQy9CLHNCQUFzQixFQUFFOzs7Ozs7Y0FNdEI7WUFDRix1QkFBdUIsRUFBRSwyQkFBMkI7U0FDdkQsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzQyxDQUFDO0NBQ0o7QUExR0Qsb0VBMEdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ2F3cy1jZGstbGliJyk7XG5pbXBvcnQgeyBDZm5HcmFwaFFMQXBpLCBDZm5BcGlLZXksIENmbkdyYXBoUUxTY2hlbWEsIENmbkRhdGFTb3VyY2UsIENmblJlc29sdmVyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwcHN5bmMnO1xuaW1wb3J0IHsgUm9sZSwgU2VydmljZVByaW5jaXBhbCwgTWFuYWdlZFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FyYm9uTGFrZVF1aWNrU3RhcnRBcGlTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAgIGNhbGN1bGF0b3JPdXRwdXRUYWJsZVJlZjogY2RrLmF3c19keW5hbW9kYi5UYWJsZTtcbn1cblxuZXhwb3J0IGNsYXNzIENhcmJvbkxha2VRdWlja1N0YXJ0QXBpU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDYXJib25MYWtlUXVpY2tTdGFydEFwaVN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZ3JhcGhRTEFwaSA9IG5ldyBDZm5HcmFwaFFMQXBpKHRoaXMsICdDYXJib25MYWtlQXBpJywge1xuICAgICAgICAgICAgbmFtZTogJ2NhcmJvbmxha2UtYXBpJyxcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uVHlwZTogJ0FQSV9LRVknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBDZm5BcGlLZXkodGhpcywgJ0NhcmJvbkxha2VBcGlLZXknLCB7XG4gICAgICAgICAgICBhcGlJZDogZ3JhcGhRTEFwaS5hdHRyQXBpSWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgYXBpU2NoZW1hID0gbmV3IENmbkdyYXBoUUxTY2hlbWEodGhpcywgJ0NhcmJvbkxha2VTY2hlbWEnLCB7XG4gICAgICAgICAgICBhcGlJZDogZ3JhcGhRTEFwaS5hdHRyQXBpSWQsXG4gICAgICAgICAgICBkZWZpbml0aW9uOiByZWFkRmlsZVN5bmMoJy4vbGliL2FwaS9zY2hlbWEuZ3JhcGhxbCcsJ3V0ZjgnKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvKiBgXG4gICAgICAgICAgICAgICAgdHlwZSAke3RhYmxlTmFtZX0ge1xuICAgICAgICAgICAgICAgICAgICByZWNvcmRfaWQ6IElEIVxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBTdHJpbmdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHlwZSBQYWdpbmF0ZWQke3RhYmxlTmFtZX0ge1xuICAgICAgICAgICAgICAgICAgICBpdGVtczogWyR7dGFibGVOYW1lfSFdIVxuICAgICAgICAgICAgICAgICAgICBuZXh0VG9rZW46IFN0cmluZ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0eXBlIFF1ZXJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYWxsKGxpbWl0OiBJbnQsIG5leHRUb2tlbjogU3RyaW5nKTogUGFnaW5hdGVkJHt0YWJsZU5hbWV9IVxuICAgICAgICAgICAgICAgICAgICBnZXRPbmUoJHt0YWJsZU5hbWV9SWQ6IElEISk6ICR7dGFibGVOYW1lfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0eXBlIE11dGF0aW9uIHtcbiAgICAgICAgICAgICAgICAgICAgc2F2ZShuYW1lOiBTdHJpbmchKTogJHt0YWJsZU5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSgke3RhYmxlTmFtZX1JZDogSUQhKTogJHt0YWJsZU5hbWV9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHR5cGUgU2NoZW1hIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnk6IFF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIG11dGF0aW9uOiBNdXRhdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGAqL1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjYWxjdWxhdG9yT3V0cHV0VGFibGVSb2xlID0gbmV3IFJvbGUodGhpcywgYENhbGN1bGF0b3JPdXRwdXREeW5hbW9EQlJvbGVgLCB7XG4gICAgICAgICAgICBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdhcHBzeW5jLmFtYXpvbmF3cy5jb20nKVxuICAgICAgICB9KTtcblxuICAgICAgICBjYWxjdWxhdG9yT3V0cHV0VGFibGVSb2xlLmFkZE1hbmFnZWRQb2xpY3koTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvbkR5bmFtb0RCRnVsbEFjY2VzcycpKTtcblxuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gbmV3IENmbkRhdGFTb3VyY2UodGhpcywgJ0NhbGN1bGF0b3JPdXRwdXREYXRhU291cmNlJywge1xuICAgICAgICAgICAgYXBpSWQ6IGdyYXBoUUxBcGkuYXR0ckFwaUlkLFxuICAgICAgICAgICAgbmFtZTogJ0NhbGN1bGF0b3JPdXRwdXREYXRhU291cmNlJyxcbiAgICAgICAgICAgIHR5cGU6ICdBTUFaT05fRFlOQU1PREInLFxuICAgICAgICAgICAgZHluYW1vRGJDb25maWc6IHtcbiAgICAgICAgICAgICAgICB0YWJsZU5hbWU6IHByb3BzLmNhbGN1bGF0b3JPdXRwdXRUYWJsZVJlZi50YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgYXdzUmVnaW9uOiB0aGlzLnJlZ2lvblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNlcnZpY2VSb2xlQXJuOiBjYWxjdWxhdG9yT3V0cHV0VGFibGVSb2xlLnJvbGVBcm5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZ2V0T25lUmVzb2x2ZXIgPSBuZXcgQ2ZuUmVzb2x2ZXIodGhpcywgJ0dldE9uZVF1ZXJ5UmVzb2x2ZXInLCB7XG4gICAgICAgICAgICBhcGlJZDogZ3JhcGhRTEFwaS5hdHRyQXBpSWQsXG4gICAgICAgICAgICB0eXBlTmFtZTogJ1F1ZXJ5JyxcbiAgICAgICAgICAgIGZpZWxkTmFtZTogJ2dldE9uZScsXG4gICAgICAgICAgICBkYXRhU291cmNlTmFtZTogZGF0YVNvdXJjZS5uYW1lLFxuICAgICAgICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogYHtcbiAgICAgICAgICAgICAgICBcInZlcnNpb25cIjogXCIyMDE3LTAyLTI4XCIsXG4gICAgICAgICAgICAgICAgXCJvcGVyYXRpb25cIjogXCJHZXRJdGVtXCIsXG4gICAgICAgICAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgICAgICAgICAgICBcInJlY29yZF9pZFwiOiAkdXRpbC5keW5hbW9kYi50b0R5bmFtb0RCSnNvbigkY3R4LmFyZ3MucmVjb3JkX2lkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1gLFxuICAgICAgICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGAkdXRpbC50b0pzb24oJGN0eC5yZXN1bHQpYFxuICAgICAgICB9KTtcbiAgICAgICAgZ2V0T25lUmVzb2x2ZXIuYWRkRGVwZW5kc09uKGFwaVNjaGVtYSk7XG5cbiAgICAgICAgY29uc3QgZ2V0QWxsUmVzb2x2ZXIgPSBuZXcgQ2ZuUmVzb2x2ZXIodGhpcywgJ0dldEFsbFF1ZXJ5UmVzb2x2ZXInLCB7XG4gICAgICAgICAgICBhcGlJZDogZ3JhcGhRTEFwaS5hdHRyQXBpSWQsXG4gICAgICAgICAgICB0eXBlTmFtZTogJ1F1ZXJ5JyxcbiAgICAgICAgICAgIGZpZWxkTmFtZTogJ2FsbCcsXG4gICAgICAgICAgICBkYXRhU291cmNlTmFtZTogZGF0YVNvdXJjZS5uYW1lLFxuICAgICAgICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogYHtcbiAgICAgICAgICAgICAgICBcInZlcnNpb25cIjogXCIyMDE3LTAyLTI4XCIsXG4gICAgICAgICAgICAgICAgXCJvcGVyYXRpb25cIjogXCJTY2FuXCIsXG4gICAgICAgICAgICAgICAgXCJsaW1pdFwiOiAkdXRpbC5kZWZhdWx0SWZOdWxsKCRjdHguYXJncy5saW1pdCwgMjApLFxuICAgICAgICAgICAgICAgIFwibmV4dFRva2VuXCI6ICR1dGlsLnRvSnNvbigkdXRpbC5kZWZhdWx0SWZOdWxsT3JFbXB0eSgkY3R4LmFyZ3MubmV4dFRva2VuLCBudWxsKSlcbiAgICAgICAgICAgIH1gLFxuICAgICAgICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGAkdXRpbC50b0pzb24oJGN0eC5yZXN1bHQpYFxuICAgICAgICB9KTtcbiAgICAgICAgZ2V0QWxsUmVzb2x2ZXIuYWRkRGVwZW5kc09uKGFwaVNjaGVtYSk7XG5cbiAgICAgICAgY29uc3QgZGVsZXRlUmVzb2x2ZXIgPSBuZXcgQ2ZuUmVzb2x2ZXIodGhpcywgJ0RlbGV0ZU11dGF0aW9uUmVzb2x2ZXInLCB7XG4gICAgICAgICAgICBhcGlJZDogZ3JhcGhRTEFwaS5hdHRyQXBpSWQsXG4gICAgICAgICAgICB0eXBlTmFtZTogJ011dGF0aW9uJyxcbiAgICAgICAgICAgIGZpZWxkTmFtZTogJ2RlbGV0ZScsXG4gICAgICAgICAgICBkYXRhU291cmNlTmFtZTogZGF0YVNvdXJjZS5uYW1lLFxuICAgICAgICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogYHtcbiAgICAgICAgICAgICAgICBcInZlcnNpb25cIjogXCIyMDE3LTAyLTI4XCIsXG4gICAgICAgICAgICAgICAgXCJvcGVyYXRpb25cIjogXCJEZWxldGVJdGVtXCIsXG4gICAgICAgICAgICAgICAgXCJrZXlcIjoge1xuICAgICAgICAgICAgICAgICAgICBcInJlY29yZF9pZFwiOiAkdXRpbC5keW5hbW9kYi50b0R5bmFtb0RCSnNvbigkY3R4LmFyZ3MucmVjb3JkX2lkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1gLFxuICAgICAgICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IGAkdXRpbC50b0pzb24oJGN0eC5yZXN1bHQpYFxuICAgICAgICB9KTtcbiAgICAgICAgZGVsZXRlUmVzb2x2ZXIuYWRkRGVwZW5kc09uKGFwaVNjaGVtYSk7XG5cbiAgICB9XG59Il19