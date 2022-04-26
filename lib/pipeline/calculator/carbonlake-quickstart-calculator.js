"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeQuickstartCalculatorStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib"); // core constructs
const aws_cdk_lib_2 = require("aws-cdk-lib");
const aws_cdk_lib_3 = require("aws-cdk-lib");
const path = require("path");
class CarbonlakeQuickstartCalculatorStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const emissionsFactorReferenceTable = new aws_cdk_lib_2.aws_dynamodb.Table(this, "carbonLakeEmissionsFactorReferenceTable", {
            partitionKey: { name: "activity_id", type: aws_cdk_lib_2.aws_dynamodb.AttributeType.STRING },
        });
        // Define DynamoDB Table for calculator output
        const calculatorOutputTable = new aws_cdk_lib_2.aws_dynamodb.Table(this, "carbonlakeCalculatorOutputTable", {
            partitionKey: { name: "activity_id", type: aws_cdk_lib_2.aws_dynamodb.AttributeType.STRING },
        });
        const calculatorLambda = new aws_cdk_lib_3.aws_lambda.Function(this, "CarbonLakeCalculatorHandler", {
            runtime: aws_cdk_lib_3.aws_lambda.Runtime.PYTHON_3_9,
            code: aws_cdk_lib_3.aws_lambda.Code.fromAsset(path.join(__dirname, './lambda')),
            handler: "calculatorLambda",
            environment: {
                EMISSIONS_FACTOR_DATABASE_NAME: emissionsFactorReferenceTable.tableName,
                CALCULATOR_OUTPUT_TABLE_NAME: calculatorOutputTable.tableName
            }
        });
    }
}
exports.CarbonlakeQuickstartCalculatorStack = CarbonlakeQuickstartCalculatorStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LWNhbGN1bGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLXF1aWNrc3RhcnQtY2FsY3VsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBbUUsQ0FBaUIsa0JBQWtCO0FBRXRHLDZDQUFvRDtBQUNwRCw2Q0FBbUQ7QUFDbkQsNkJBQTZCO0FBRTdCLE1BQWEsbUNBQW9DLFNBQVEsbUJBQUs7SUFDMUQsWUFBWSxLQUFVLEVBQUUsRUFBVSxFQUFFLEtBQWtCO1FBQ2xELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sNkJBQTZCLEdBQUcsSUFBSSwwQkFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUseUNBQXlDLEVBQUU7WUFDdEcsWUFBWSxFQUFFLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsMEJBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1NBQzVFLENBQUMsQ0FBQztRQUVILDhDQUE4QztRQUM5QyxNQUFNLHFCQUFxQixHQUFHLElBQUksMEJBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGlDQUFpQyxFQUFFO1lBQ3RGLFlBQVksRUFBRSxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLDBCQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtTQUM1RSxDQUFDLENBQUM7UUFFSCxNQUFNLGdCQUFnQixHQUFHLElBQUksd0JBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQzlFLE9BQU8sRUFBRSx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVO1lBQ2xDLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDN0QsT0FBTyxFQUFFLGtCQUFrQjtZQUMzQixXQUFXLEVBQUU7Z0JBQ1QsOEJBQThCLEVBQUUsNkJBQTZCLENBQUMsU0FBUztnQkFDdkUsNEJBQTRCLEVBQUUscUJBQXFCLENBQUMsU0FBUzthQUNoRTtTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FDSjtBQXZCRCxrRkF1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEFwcCwgYXdzX2R5bmFtb2RiLCBTdGFjaywgU3RhY2tQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliJzsgICAgICAgICAgICAgICAgIC8vIGNvcmUgY29uc3RydWN0c1xuaW1wb3J0IHsgYXdzX2FwaWdhdGV3YXkgYXMgYXBpZ3cgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQge2F3c19keW5hbW9kYiBhcyBkeW5hbW9kYn0gZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBjbGFzcyBDYXJib25sYWtlUXVpY2tzdGFydENhbGN1bGF0b3JTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IFN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgZW1pc3Npb25zRmFjdG9yUmVmZXJlbmNlVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgXCJjYXJib25MYWtlRW1pc3Npb25zRmFjdG9yUmVmZXJlbmNlVGFibGVcIiwge1xuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7bmFtZTogXCJhY3Rpdml0eV9pZFwiLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmUgRHluYW1vREIgVGFibGUgZm9yIGNhbGN1bGF0b3Igb3V0cHV0XG4gICAgICAgIGNvbnN0IGNhbGN1bGF0b3JPdXRwdXRUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCBcImNhcmJvbmxha2VDYWxjdWxhdG9yT3V0cHV0VGFibGVcIiwge1xuICAgICAgICAgICAgcGFydGl0aW9uS2V5OiB7bmFtZTogXCJhY3Rpdml0eV9pZFwiLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjYWxjdWxhdG9yTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcIkNhcmJvbkxha2VDYWxjdWxhdG9ySGFuZGxlclwiLCB7XG4gICAgICAgICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM185LFxuICAgICAgICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2xhbWJkYScpKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiY2FsY3VsYXRvckxhbWJkYVwiLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBFTUlTU0lPTlNfRkFDVE9SX0RBVEFCQVNFX05BTUU6IGVtaXNzaW9uc0ZhY3RvclJlZmVyZW5jZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICAgICAgICBDQUxDVUxBVE9SX09VVFBVVF9UQUJMRV9OQU1FOiBjYWxjdWxhdG9yT3V0cHV0VGFibGUudGFibGVOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufSJdfQ==