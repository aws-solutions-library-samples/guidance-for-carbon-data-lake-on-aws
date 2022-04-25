"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkBaseStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
class CdkBaseStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // create a VPC with no private subnets. 
        // this is for our demo purpose as this will be 
        // cheaper since you do not need a nat gateway
        const vpc = new ec2.Vpc(this, `VPC-${props === null || props === void 0 ? void 0 : props.stage}`, {
            natGateways: 0,
            maxAzs: 2,
        });
        this.vpc = vpc;
    }
    get stackVpc() {
        return this.vpc;
    }
}
exports.CdkBaseStack = CdkBaseStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyYm9ubGFrZS1xdWlja3N0YXJ0LWJhc2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJib25sYWtlLXF1aWNrc3RhcnQtYmFzZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBZ0Q7QUFNaEQsTUFBYSxZQUFhLFNBQVEsbUJBQUs7SUFFckMsWUFBWSxLQUFvQixFQUFFLEVBQVUsRUFDaEIsS0FBeUI7UUFDbkQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIseUNBQXlDO1FBQ3pDLGdEQUFnRDtRQUNoRCw4Q0FBOEM7UUFDOUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxLQUFLLEVBQUUsRUFBRTtZQUNuRCxXQUFXLEVBQUMsQ0FBQztZQUNiLE1BQU0sRUFBRSxDQUFDO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDakIsQ0FBQztJQUNELElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNsQixDQUFDO0NBQ0Y7QUFuQkQsb0NBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2RrQmFzZVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHN0YWdlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDZGtCYXNlU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHByaXZhdGUgcmVhZG9ubHkgdnBjOmVjMi5WcGM7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzPzogQ2RrQmFzZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIGNyZWF0ZSBhIFZQQyB3aXRoIG5vIHByaXZhdGUgc3VibmV0cy4gXG4gICAgLy8gdGhpcyBpcyBmb3Igb3VyIGRlbW8gcHVycG9zZSBhcyB0aGlzIHdpbGwgYmUgXG4gICAgLy8gY2hlYXBlciBzaW5jZSB5b3UgZG8gbm90IG5lZWQgYSBuYXQgZ2F0ZXdheVxuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsIGBWUEMtJHtwcm9wcz8uc3RhZ2V9YCwge1xuICAgICAgbmF0R2F0ZXdheXM6MCxcbiAgICAgIG1heEF6czogMixcbiAgICB9KTsgICAgXG5cbiAgICB0aGlzLnZwYyA9IHZwYztcbiAgfVxuICBnZXQgc3RhY2tWcGMoKSA6IGVjMi5WcGN7XG4gICAgcmV0dXJuIHRoaXMudnBjO1xuICB9ICBcbn0iXX0=