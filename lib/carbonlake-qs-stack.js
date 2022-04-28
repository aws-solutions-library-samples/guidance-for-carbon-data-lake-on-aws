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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbonlakeQuickstartStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const carbonlake_api_stack_1 = require("./api/carbonlake-api-stack");
const carbonlake_quickstart_calculator_1 = require("./pipeline/calculator/carbonlake-quickstart-calculator");
const carbonlake_qs_storage_stack_1 = require("./pipeline/storage/carbonlake-qs-storage-stack");
class CarbonlakeQuickstartStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const app = new cdk.App();
        // TODO --> Create the carbonlake storage stack
        const storage = new carbonlake_qs_storage_stack_1.CarbonlakeQuickstartStorageStack(app, "CarbonlakeQuickstartStorageStack");
        // Create the carbonlake calculator stack
        const calculator = new carbonlake_quickstart_calculator_1.CarbonlakeQuickstartCalculatorStack(app, "CarbonlakeQuickStartCalculatorStack");
        // Create the carbonlake API stack
        const api = new carbonlake_api_stack_1.CarbonLakeQuickStartApiStack(app, "CarbonlakeApiStack", {
            calculatorOutputTableRef: calculator.calculatorOutputTable
        });
        // TODO --> Create the carbonlake etl-pipeline stack
        // TODO --> Create the carbonlake web stack
        // TODO --> Create the carbonlake grafana stack
        // TODO --> Create the carbonlake quickstart stack
        // TODO --> Create the carbonlake data lineage stack
        // TODO --> Creat the carbonlake monitoring and observability stack
    }
}
exports.CarbonlakeQuickstartStack = CarbonlakeQuickstartStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xcy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcmJvbmxha2UtcXMtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyxxRUFBMEU7QUFDMUUsNkdBQTZHO0FBQzdHLGdHQUFrRztBQUlsRyxNQUFhLHlCQUEwQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3RELFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUUxQiwrQ0FBK0M7UUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSw4REFBZ0MsQ0FBQyxHQUFHLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUU5Rix5Q0FBeUM7UUFDekMsTUFBTSxVQUFVLEdBQUcsSUFBSSxzRUFBbUMsQ0FBQyxHQUFHLEVBQUUscUNBQXFDLENBQUMsQ0FBQztRQUV2RyxrQ0FBa0M7UUFDbEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxtREFBNEIsQ0FBQyxHQUFHLEVBQUUsb0JBQW9CLEVBQUU7WUFDdEUsd0JBQXdCLEVBQUUsVUFBVSxDQUFDLHFCQUFxQjtTQUMzRCxDQUFDLENBQUM7UUFFSCxvREFBb0Q7UUFFcEQsMkNBQTJDO1FBRTNDLCtDQUErQztRQUUvQyxrREFBa0Q7UUFFbEQsb0RBQW9EO1FBRXBELG1FQUFtRTtJQUVyRSxDQUFDO0NBQ0Y7QUE5QkQsOERBOEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENhcmJvbkxha2VRdWlja1N0YXJ0QXBpU3RhY2sgfSBmcm9tICcuL2FwaS9jYXJib25sYWtlLWFwaS1zdGFjayc7XG5pbXBvcnQgeyBDYXJib25sYWtlUXVpY2tzdGFydENhbGN1bGF0b3JTdGFjayB9IGZyb20gJy4vcGlwZWxpbmUvY2FsY3VsYXRvci9jYXJib25sYWtlLXF1aWNrc3RhcnQtY2FsY3VsYXRvcic7XG5pbXBvcnQgeyBDYXJib25sYWtlUXVpY2tzdGFydFN0b3JhZ2VTdGFjayB9IGZyb20gJy4vcGlwZWxpbmUvc3RvcmFnZS9jYXJib25sYWtlLXFzLXN0b3JhZ2Utc3RhY2snO1xuXG5cblxuZXhwb3J0IGNsYXNzIENhcmJvbmxha2VRdWlja3N0YXJ0U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkFwcCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuICAgIC8vIFRPRE8gLS0+IENyZWF0ZSB0aGUgY2FyYm9ubGFrZSBzdG9yYWdlIHN0YWNrXG4gICAgY29uc3Qgc3RvcmFnZSA9IG5ldyBDYXJib25sYWtlUXVpY2tzdGFydFN0b3JhZ2VTdGFjayhhcHAsIFwiQ2FyYm9ubGFrZVF1aWNrc3RhcnRTdG9yYWdlU3RhY2tcIik7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGNhcmJvbmxha2UgY2FsY3VsYXRvciBzdGFja1xuICAgIGNvbnN0IGNhbGN1bGF0b3IgPSBuZXcgQ2FyYm9ubGFrZVF1aWNrc3RhcnRDYWxjdWxhdG9yU3RhY2soYXBwLCBcIkNhcmJvbmxha2VRdWlja1N0YXJ0Q2FsY3VsYXRvclN0YWNrXCIpO1xuICAgIFxuICAgIC8vIENyZWF0ZSB0aGUgY2FyYm9ubGFrZSBBUEkgc3RhY2tcbiAgICBjb25zdCBhcGkgPSBuZXcgQ2FyYm9uTGFrZVF1aWNrU3RhcnRBcGlTdGFjayhhcHAsIFwiQ2FyYm9ubGFrZUFwaVN0YWNrXCIsIHtcbiAgICAgIGNhbGN1bGF0b3JPdXRwdXRUYWJsZVJlZjogY2FsY3VsYXRvci5jYWxjdWxhdG9yT3V0cHV0VGFibGVcbiAgICB9KTtcblxuICAgIC8vIFRPRE8gLS0+IENyZWF0ZSB0aGUgY2FyYm9ubGFrZSBldGwtcGlwZWxpbmUgc3RhY2tcblxuICAgIC8vIFRPRE8gLS0+IENyZWF0ZSB0aGUgY2FyYm9ubGFrZSB3ZWIgc3RhY2tcblxuICAgIC8vIFRPRE8gLS0+IENyZWF0ZSB0aGUgY2FyYm9ubGFrZSBncmFmYW5hIHN0YWNrXG5cbiAgICAvLyBUT0RPIC0tPiBDcmVhdGUgdGhlIGNhcmJvbmxha2UgcXVpY2tzdGFydCBzdGFja1xuXG4gICAgLy8gVE9ETyAtLT4gQ3JlYXRlIHRoZSBjYXJib25sYWtlIGRhdGEgbGluZWFnZSBzdGFja1xuXG4gICAgLy8gVE9ETyAtLT4gQ3JlYXQgdGhlIGNhcmJvbmxha2UgbW9uaXRvcmluZyBhbmQgb2JzZXJ2YWJpbGl0eSBzdGFja1xuICAgIFxuICB9XG59XG4iXX0=