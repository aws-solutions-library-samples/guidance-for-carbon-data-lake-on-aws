"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeQuickstartCalculatorStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const aws_cdk_lib_4 = require("aws-cdk-lib");
const emissions_factor_model_2022_04_26_json_1 = __importDefault(require("./emissions_factor_model_2022-04-26.json"));
const path = __importStar(require("path"));
const DDB_BATCH_WRITE_ITEM_CHUNK_SIZE = 25;
class CarbonlakeQuickstartCalculatorStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.generateBatch = (chunk) => {
            const result = [];
            chunk.forEach((emission_factor) => {
                result.push({ PutRequest: { Item: this.generateItem(emission_factor) } });
            });
            return result;
        };
        this.generateItem = (emission_factor) => {
            const coefficients = emission_factor.emissions_factor_standards.ghg.coefficients;
            return {
                activity: { S: emission_factor.activity },
                category: { S: emission_factor.category },
                scope: { N: emission_factor.scope },
                emissions_factor_standards: { M: {
                        ghg: { M: {
                                coefficients: { M: {
                                        co2_factor: { S: coefficients.co2_factor },
                                        ch4_factor: { S: coefficients.ch4_factor },
                                        n2o_factor: { S: coefficients.n2o_factor },
                                        biofuel_co2: { S: coefficients.biofuel_co2 },
                                        AR4_kgco2e: { S: coefficients['AR4-kgco2e'] },
                                        AR5_kgco2e: { S: coefficients['AR5-kgco2e'] },
                                        units: { S: coefficients.units },
                                    }
                                },
                                last_updated: { S: emission_factor.emissions_factor_standards.ghg.last_updated },
                                source: { S: emission_factor.emissions_factor_standards.ghg.source },
                                source_origin: { S: emission_factor.emissions_factor_standards.ghg.source_origin },
                            } }
                    } }
            };
        };
        const emissionsFactorReferenceTable = new aws_cdk_lib_2.aws_dynamodb.Table(this, "carbonLakeEmissionsFactorReferenceTable", {
            partitionKey: { name: "category", type: aws_cdk_lib_2.aws_dynamodb.AttributeType.STRING },
            sortKey: { name: "activity", type: aws_cdk_lib_2.aws_dynamodb.AttributeType.STRING },
        });
        // Define DynamoDB Table for calculator output
        this.calculatorOutputTable = new aws_cdk_lib_2.aws_dynamodb.Table(this, "carbonlakeCalculatorOutputTable", {
            partitionKey: { name: "activity_id", type: aws_cdk_lib_2.aws_dynamodb.AttributeType.STRING },
        });
        const calculatorLambda = new aws_cdk_lib_3.aws_lambda.Function(this, "carbonLakeCalculatorHandler", {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            handler: "calculatorLambda",
            environment: {
                EMISSIONS_FACTOR_TABLE_NAME: emissionsFactorReferenceTable.tableName,
                CALCULATOR_OUTPUT_TABLE_NAME: this.calculatorOutputTable.tableName
            }
        });
        //We popupate the Emission Factors DB with data from a JSON file
        //We split into chunks because BatchWriteItem has a limitation of 25 items per batch
        //See https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
        for (let i = 0; i < emissions_factor_model_2022_04_26_json_1.default.length; i += DDB_BATCH_WRITE_ITEM_CHUNK_SIZE) {
            const chunk = emissions_factor_model_2022_04_26_json_1.default.slice(i, i + DDB_BATCH_WRITE_ITEM_CHUNK_SIZE);
            new aws_cdk_lib_4.custom_resources.AwsCustomResource(this, `initCarbonLakeEmissionsFactorReferenceTable${i}`, {
                onCreate: {
                    service: 'DynamoDB',
                    action: 'batchWriteItem',
                    parameters: {
                        RequestItems: {
                            [emissionsFactorReferenceTable.tableName]: this.generateBatch(chunk),
                        },
                    },
                    physicalResourceId: aws_cdk_lib_4.custom_resources.PhysicalResourceId.of(emissionsFactorReferenceTable.tableName + '_initialization')
                },
                policy: aws_cdk_lib_4.custom_resources.AwsCustomResourcePolicy.fromSdkCalls({ resources: [emissionsFactorReferenceTable.tableArn] }),
            });
        }
    }
}
exports.CarbonlakeQuickstartCalculatorStack = CarbonlakeQuickstartCalculatorStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LWNhbGN1bGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLXF1aWNrc3RhcnQtY2FsY3VsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQXFEO0FBQ3JELDZDQUFzRDtBQUN0RCw2Q0FBbUQ7QUFDbkQsNkNBQXFEO0FBQ3JELHNIQUF3RTtBQUN4RSwyQ0FBNkI7QUFFN0IsTUFBTSwrQkFBK0IsR0FBRyxFQUFFLENBQUM7QUErQzNDLE1BQWEsbUNBQW9DLFNBQVEsbUJBQUs7SUFHMUQsWUFBWSxLQUFVLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQ2xELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBNENwQixrQkFBYSxHQUFHLENBQUMsS0FBMkIsRUFBa0QsRUFBRTtZQUNwRyxNQUFNLE1BQU0sR0FBcUQsRUFBRSxDQUFDO1lBQ3BFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDO1FBRU0saUJBQVksR0FBRyxDQUFDLGVBQW1DLEVBQXNCLEVBQUU7WUFDL0UsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7WUFDakYsT0FBTztnQkFDSCxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsZUFBZSxDQUFDLFFBQVEsRUFBRTtnQkFDekMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JB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SSw4QkFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSw4Q0FBOEMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlFLFFBQVEsRUFBRTtvQkFDTixPQUFPLEVBQUUsVUFBVTtvQkFDbkIsTUFBTSxFQUFFLGdCQUFnQjtvQkFDeEIsVUFBVSxFQUFFO3dCQUNSLFlBQVksRUFBRTs0QkFDVixDQUFDLDZCQUE2QixDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO3lCQUN2RTtxQkFDSjtvQkFDRCxrQkFBa0IsRUFBRSw4QkFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7aUJBQzVHO2dCQUNELE1BQU0sRUFBRSw4QkFBRSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7YUFDM0csQ0FBQyxDQUFDO1NBQ047SUFFTCxDQUFDO0NBbUNKO0FBakZELGtGQWlGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcCwgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfZHluYW1vZGIgYXMgZHluYW1vZGIgfSBmcm9tICdhd3MtY2RrLWxpYidcbmltcG9ydCB7IGF3c19sYW1iZGEgYXMgbGFtYmRhIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgY3VzdG9tX3Jlc291cmNlcyBhcyBjciB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCBlbWlzc2lvbl9mYWN0b3JzIGZyb20gJy4vZW1pc3Npb25zX2ZhY3Rvcl9tb2RlbF8yMDIyLTA0LTI2Lmpzb24nO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgRERCX0JBVENIX1dSSVRFX0lURU1fQ0hVTktfU0laRSA9IDI1O1xuXG5pbnRlcmZhY2UgSURkYkVtaXNzaW9uRmFjdG9yIHtcbiAgICBjYXRlZ29yeTogeyBTOiBzdHJpbmcgfTtcbiAgICBhY3Rpdml0eTogeyBTOiBzdHJpbmcgfTtcbiAgICBzY29wZTogeyBOOiBzdHJpbmcgfTtcbiAgICBlbWlzc2lvbnNfZmFjdG9yX3N0YW5kYXJkczogeyBNOiB7XG4gICAgICAgIGdoZzogeyBNOiB7XG4gICAgICAgICAgICBjb2VmZmljaWVudHM6IHsgTToge1xuICAgICAgICAgICAgICAgICAgICBjbzJfZmFjdG9yOiB7IFM6IHN0cmluZyB9OyAvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICBjaDRfZmFjdG9yOiB7IFM6IHN0cmluZyB9OyAvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICBuMm9fZmFjdG9yOiB7IFM6IHN0cmluZyB9OyAvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICBiaW9mdWVsX2NvMjogeyBTOiBzdHJpbmcgfTsvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICBBUjRfa2djbzJlOiB7IFM6IHN0cmluZyB9OyAvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICBBUjVfa2djbzJlOiB7IFM6IHN0cmluZyB9OyAvL1RPRE8gdXNlIG51bWJlciAoSSB1c2VkIHN0cmluZyBiZWNhdXNlIHNvbWUgdmFsdWVzIGFyZSBlbXB0eSBpbiBKU09OKVxuICAgICAgICAgICAgICAgICAgICB1bml0czogeyBTOiBzdHJpbmcgfTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogeyBTOiBzdHJpbmcgfTtcbiAgICAgICAgICAgIHNvdXJjZTogeyBTOiBzdHJpbmcgfTtcbiAgICAgICAgICAgIHNvdXJjZV9vcmlnaW46IHsgUzogc3RyaW5nIH07XG4gICAgICAgIH19O1xuICAgIH19O1xufVxuXG5pbnRlcmZhY2UgSUdoZ0VtaXNzaW9uRmFjdG9yIHtcbiAgICBjYXRlZ29yeTogc3RyaW5nO1xuICAgIGFjdGl2aXR5OiBzdHJpbmc7XG4gICAgc2NvcGU6IHN0cmluZztcbiAgICBlbWlzc2lvbnNfZmFjdG9yX3N0YW5kYXJkczoge1xuICAgICAgICBnaGc6IHtcbiAgICAgICAgICAgIGNvZWZmaWNpZW50czoge1xuICAgICAgICAgICAgICAgIGNvMl9mYWN0b3I6IHN0cmluZztcbiAgICAgICAgICAgICAgICBjaDRfZmFjdG9yOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgbjJvX2ZhY3Rvcjogc3RyaW5nO1xuICAgICAgICAgICAgICAgIGJpb2Z1ZWxfY28yOiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgXCJBUjQta2djbzJlXCI6IHN0cmluZztcbiAgICAgICAgICAgICAgICBcIkFSNS1rZ2NvMmVcIjogc3RyaW5nO1xuICAgICAgICAgICAgICAgIHVuaXRzOiBzdHJpbmc7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGFzdF91cGRhdGVkOiBzdHJpbmc7XG4gICAgICAgICAgICBzb3VyY2U6IHN0cmluZztcbiAgICAgICAgICAgIHNvdXJjZV9vcmlnaW46IHN0cmluZztcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG5leHBvcnQgY2xhc3MgQ2FyYm9ubGFrZVF1aWNrc3RhcnRDYWxjdWxhdG9yU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gICAgcHVibGljIHJlYWRvbmx5IGNhbGN1bGF0b3JPdXRwdXRUYWJsZTogZHluYW1vZGIuVGFibGU7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZW1pc3Npb25zRmFjdG9yUmVmZXJlbmNlVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgXCJjYXJib25MYWtlRW1pc3Npb25zRmFjdG9yUmVmZXJlbmNlVGFibGVcIiwge1xuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6IFwiY2F0ZWdvcnlcIiwgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICAgIHNvcnRLZXk6IHsgbmFtZTogXCJhY3Rpdml0eVwiLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgRHluYW1vREIgVGFibGUgZm9yIGNhbGN1bGF0b3Igb3V0cHV0XG4gICAgICAgIHRoaXMuY2FsY3VsYXRvck91dHB1dFRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsIFwiY2FyYm9ubGFrZUNhbGN1bGF0b3JPdXRwdXRUYWJsZVwiLCB7XG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJhY3Rpdml0eV9pZFwiLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjYWxjdWxhdG9yTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcImNhcmJvbkxha2VDYWxjdWxhdG9ySGFuZGxlclwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185LFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xhbWJkYScpKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiY2FsY3VsYXRvckxhbWJkYVwiLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBFTUlTU0lPTlNfRkFDVE9SX1RBQkxFX05BTUU6IGVtaXNzaW9uc0ZhY3RvclJlZmVyZW5jZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICBDQUxDVUxBVE9SX09VVFBVVF9UQUJMRV9OQU1FOiB0aGlzLmNhbGN1bGF0b3JPdXRwdXRUYWJsZS50YWJsZU5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvL1dlIHBvcHVwYXRlIHRoZSBFbWlzc2lvbiBGYWN0b3JzIERCIHdpdGggZGF0YSBmcm9tIGEgSlNPTiBmaWxlXG4gICAgICAgIC8vV2Ugc3BsaXQgaW50byBjaHVua3MgYmVjYXVzZSBCYXRjaFdyaXRlSXRlbSBoYXMgYSBsaW1pdGF0aW9uIG9mIDI1IGl0ZW1zIHBlciBiYXRjaFxuICAgICAgICAvL1NlZSBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L0FQSVJlZmVyZW5jZS9BUElfQmF0Y2hXcml0ZUl0ZW0uaHRtbFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaTxlbWlzc2lvbl9mYWN0b3JzLmxlbmd0aDsgaSs9RERCX0JBVENIX1dSSVRFX0lURU1fQ0hVTktfU0laRSkge1xuICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBlbWlzc2lvbl9mYWN0b3JzLnNsaWNlKGksIGkgKyBEREJfQkFUQ0hfV1JJVEVfSVRFTV9DSFVOS19TSVpFKTtcbiAgICAgICAgICAgIG5ldyBjci5Bd3NDdXN0b21SZXNvdXJjZSh0aGlzLCBgaW5pdENhcmJvbkxha2VFbWlzc2lvbnNGYWN0b3JSZWZlcmVuY2VUYWJsZSR7aX1gLCB7XG4gICAgICAgICAgICAgICAgb25DcmVhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZTogJ0R5bmFtb0RCJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnYmF0Y2hXcml0ZUl0ZW0nLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBSZXF1ZXN0SXRlbXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZW1pc3Npb25zRmFjdG9yUmVmZXJlbmNlVGFibGUudGFibGVOYW1lXTogdGhpcy5nZW5lcmF0ZUJhdGNoKGNodW5rKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBoeXNpY2FsUmVzb3VyY2VJZDogY3IuUGh5c2ljYWxSZXNvdXJjZUlkLm9mKGVtaXNzaW9uc0ZhY3RvclJlZmVyZW5jZVRhYmxlLnRhYmxlTmFtZSArICdfaW5pdGlhbGl6YXRpb24nKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcG9saWN5OiBjci5Bd3NDdXN0b21SZXNvdXJjZVBvbGljeS5mcm9tU2RrQ2FsbHMoeyByZXNvdXJjZXM6IFtlbWlzc2lvbnNGYWN0b3JSZWZlcmVuY2VUYWJsZS50YWJsZUFybl0gfSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUJhdGNoID0gKGNodW5rOiBJR2hnRW1pc3Npb25GYWN0b3JbXSk6IHsgUHV0UmVxdWVzdDogeyBJdGVtOiBJRGRiRW1pc3Npb25GYWN0b3IgfSB9W10gPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQ6IHsgUHV0UmVxdWVzdDogeyBJdGVtOiBJRGRiRW1pc3Npb25GYWN0b3I7IH07IH1bXSA9IFtdO1xuICAgICAgICBjaHVuay5mb3JFYWNoKChlbWlzc2lvbl9mYWN0b3IpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHsgUHV0UmVxdWVzdDogeyBJdGVtOiB0aGlzLmdlbmVyYXRlSXRlbShlbWlzc2lvbl9mYWN0b3IpIH0gfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlSXRlbSA9IChlbWlzc2lvbl9mYWN0b3I6IElHaGdFbWlzc2lvbkZhY3Rvcik6IElEZGJFbWlzc2lvbkZhY3RvciA9PiB7XG4gICAgICAgIGNvbnN0IGNvZWZmaWNpZW50cyA9IGVtaXNzaW9uX2ZhY3Rvci5lbWlzc2lvbnNfZmFjdG9yX3N0YW5kYXJkcy5naGcuY29lZmZpY2llbnRzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWN0aXZpdHk6IHsgUzogZW1pc3Npb25fZmFjdG9yLmFjdGl2aXR5IH0sXG4gICAgICAgICAgICBjYXRlZ29yeTogeyBTOiBlbWlzc2lvbl9mYWN0b3IuY2F0ZWdvcnkgfSxcbiAgICAgICAgICAgIHNjb3BlOiB7IE46IGVtaXNzaW9uX2ZhY3Rvci5zY29wZSB9LFxuICAgICAgICAgICAgZW1pc3Npb25zX2ZhY3Rvcl9zdGFuZGFyZHM6IHsgTToge1xuICAgICAgICAgICAgICAgIGdoZzogeyBNOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZWZmaWNpZW50czogeyBNOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY28yX2ZhY3RvcjogeyBTOiBjb2VmZmljaWVudHMuY28yX2ZhY3RvciB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoNF9mYWN0b3I6IHsgUzogY29lZmZpY2llbnRzLmNoNF9mYWN0b3IgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuMm9fZmFjdG9yOiB7IFM6IGNvZWZmaWNpZW50cy5uMm9fZmFjdG9yIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlvZnVlbF9jbzI6IHsgUzogY29lZmZpY2llbnRzLmJpb2Z1ZWxfY28yIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQVI0X2tnY28yZTogeyBTOiBjb2VmZmljaWVudHNbJ0FSNC1rZ2NvMmUnXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFSNV9rZ2NvMmU6IHsgUzogY29lZmZpY2llbnRzWydBUjUta2djbzJlJ10gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0czogeyBTOiBjb2VmZmljaWVudHMudW5pdHMgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiB7IFM6IGVtaXNzaW9uX2ZhY3Rvci5lbWlzc2lvbnNfZmFjdG9yX3N0YW5kYXJkcy5naGcubGFzdF91cGRhdGVkIH0sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogeyBTOiBlbWlzc2lvbl9mYWN0b3IuZW1pc3Npb25zX2ZhY3Rvcl9zdGFuZGFyZHMuZ2hnLnNvdXJjZSB9LFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2Vfb3JpZ2luOiB7IFM6IGVtaXNzaW9uX2ZhY3Rvci5lbWlzc2lvbnNfZmFjdG9yX3N0YW5kYXJkcy5naGcuc291cmNlX29yaWdpbiB9LFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICB9fVxuICAgICAgICB9O1xuICAgIH1cbn0iXX0=