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
const aws_cdk_lib_1 = require("aws-cdk-lib");
const assertions_1 = require("aws-cdk-lib/assertions");
const CarbonlakeQuickstart = __importStar(require("../lib/carbonlake-quickstart-stack"));
test('Snapshot', () => {
    const app = new aws_cdk_lib_1.App();
    const stack = new CarbonlakeQuickstart(app, 'test');
    //Add your own required test outputs here
    const template = assertions_1.Template.fromStack(stack);
    template.hasOutput('APIURL', assertions_1.Match.objectLike({})); // Check to make sure the APIURL is output
    template.hasOutput('password', assertions_1.Match.objectLike({})); // Check to make sure there is password ouput
    template.hasOutput('WebAppUrl', assertions_1.Match.objectLike({})); // Check to make sure the web app outputs a url
    template.hasOutput('S3LandingZoneInputBucketARN', assertions_1.Match.objectLike({})); // Check to make sure the S3 landing zone bucket input ARN is output
    template.resourceCountIs('AWS::CloudFormation::Stack', 5);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLXF1aWNrc3RhcnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBa0M7QUFDbEMsdURBQXlEO0FBQ3pELHlGQUEyRTtBQUUzRSxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtJQUNsQixNQUFNLEdBQUcsR0FBRyxJQUFJLGlCQUFHLEVBQUUsQ0FBQztJQUN0QixNQUFNLEtBQUssR0FBRyxJQUFJLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRCx5Q0FBeUM7SUFDekMsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0MsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsa0JBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFLLDBDQUEwQztJQUNsRyxRQUFRLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxrQkFBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUcsNkNBQTZDO0lBQ3JHLFFBQVEsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLGtCQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBRSwrQ0FBK0M7SUFDdkcsUUFBUSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsRUFBRSxrQkFBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUUsb0VBQW9FO0lBQzlJLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHAgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBUZW1wbGF0ZSwgTWF0Y2ggfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJztcbmltcG9ydCAqIGFzIENhcmJvbmxha2VRdWlja3N0YXJ0IGZyb20gJy4uL2xpYi9jYXJib25sYWtlLXF1aWNrc3RhcnQtc3RhY2snO1xuXG50ZXN0KCdTbmFwc2hvdCcsICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgQXBwKCk7XG4gICAgY29uc3Qgc3RhY2sgPSBuZXcgQ2FyYm9ubGFrZVF1aWNrc3RhcnQoYXBwLCAndGVzdCcpO1xuICAgIC8vQWRkIHlvdXIgb3duIHJlcXVpcmVkIHRlc3Qgb3V0cHV0cyBoZXJlXG4gICAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soc3RhY2spO1xuICAgIHRlbXBsYXRlLmhhc091dHB1dCgnQVBJVVJMJywgTWF0Y2gub2JqZWN0TGlrZSh7fSkpOyAgICAgLy8gQ2hlY2sgdG8gbWFrZSBzdXJlIHRoZSBBUElVUkwgaXMgb3V0cHV0XG4gICAgdGVtcGxhdGUuaGFzT3V0cHV0KCdwYXNzd29yZCcsIE1hdGNoLm9iamVjdExpa2Uoe30pKTsgICAvLyBDaGVjayB0byBtYWtlIHN1cmUgdGhlcmUgaXMgcGFzc3dvcmQgb3VwdXRcbiAgICB0ZW1wbGF0ZS5oYXNPdXRwdXQoJ1dlYkFwcFVybCcsIE1hdGNoLm9iamVjdExpa2Uoe30pKTsgIC8vIENoZWNrIHRvIG1ha2Ugc3VyZSB0aGUgd2ViIGFwcCBvdXRwdXRzIGEgdXJsXG4gICAgdGVtcGxhdGUuaGFzT3V0cHV0KCdTM0xhbmRpbmdab25lSW5wdXRCdWNrZXRBUk4nLCBNYXRjaC5vYmplY3RMaWtlKHt9KSk7ICAvLyBDaGVjayB0byBtYWtlIHN1cmUgdGhlIFMzIGxhbmRpbmcgem9uZSBidWNrZXQgaW5wdXQgQVJOIGlzIG91dHB1dFxuICAgIHRlbXBsYXRlLnJlc291cmNlQ291bnRJcygnQVdTOjpDbG91ZEZvcm1hdGlvbjo6U3RhY2snLCA1KTtcbn0pO1xuIl19