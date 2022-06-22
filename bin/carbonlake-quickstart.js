#!/usr/bin/env node
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
require("source-map-support/register");
const cdk = __importStar(require("aws-cdk-lib"));
const carbonlake_qs_stack_1 = require("../lib/carbonlake-qs-stack");
const carbonlake_qs_ci_cd_pipeline_stack_1 = require("../lib/ci-cd/carbonlake-qs-ci-cd-pipeline-stack");
const app = new cdk.App();
// Creates a reference to the CarbonLake pipeline in the stack deployment
new carbonlake_qs_ci_cd_pipeline_stack_1.CarbonlakeQuickstartCiCdStack(app, 'CarbonLakeQuickstartCiCdStack');
new carbonlake_qs_stack_1.CarbonlakeQuickstartStack(app, 'CarbonlakeQuickstartStack');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBcUM7QUFDckMsaURBQW1DO0FBQ25DLG9FQUF1RTtBQUN2RSx3R0FBZ0c7QUFHaEcsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIseUVBQXlFO0FBQ3pFLElBQUksa0VBQTZCLENBQUMsR0FBRyxFQUFFLCtCQUErQixDQUFDLENBQUM7QUFHeEUsSUFBSSwrQ0FBeUIsQ0FBQyxHQUFHLEVBQUUsMkJBQTJCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDYXJib25sYWtlUXVpY2tzdGFydFN0YWNrIH0gZnJvbSAnLi4vbGliL2NhcmJvbmxha2UtcXMtc3RhY2snO1xuaW1wb3J0IHsgQ2FyYm9ubGFrZVF1aWNrc3RhcnRDaUNkU3RhY2sgfSBmcm9tICcuLi9saWIvY2ktY2QvY2FyYm9ubGFrZS1xcy1jaS1jZC1waXBlbGluZS1zdGFjayc7XG5cblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuLy8gQ3JlYXRlcyBhIHJlZmVyZW5jZSB0byB0aGUgQ2FyYm9uTGFrZSBwaXBlbGluZSBpbiB0aGUgc3RhY2sgZGVwbG95bWVudFxubmV3IENhcmJvbmxha2VRdWlja3N0YXJ0Q2lDZFN0YWNrKGFwcCwgJ0NhcmJvbkxha2VRdWlja3N0YXJ0Q2lDZFN0YWNrJyk7XG5cblxubmV3IENhcmJvbmxha2VRdWlja3N0YXJ0U3RhY2soYXBwLCAnQ2FyYm9ubGFrZVF1aWNrc3RhcnRTdGFjaycpO1xuIl19