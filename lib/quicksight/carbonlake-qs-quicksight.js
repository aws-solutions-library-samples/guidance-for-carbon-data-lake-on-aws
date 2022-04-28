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
exports.HelloCdkStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const aws_cdk_lib_1 = require("aws-cdk-lib");
class HelloCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        new aws_cdk_lib_1.aws_s3.Bucket(this, 'MyFirstBucket', {
            versioned: true
        });
    }
}
exports.HelloCdkStack = HelloCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xcy1xdWlja3NpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FyYm9ubGFrZS1xcy1xdWlja3NpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsNkNBQTJDO0FBRTNDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBYyxFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkMsU0FBUyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBUkQsc0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX3MzIGFzIHMzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgY2xhc3MgSGVsbG9DZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQXBwLCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBuZXcgczMuQnVja2V0KHRoaXMsICdNeUZpcnN0QnVja2V0Jywge1xuICAgICAgdmVyc2lvbmVkOiB0cnVlXG4gICAgfSk7XG4gIH1cbn0iXX0=