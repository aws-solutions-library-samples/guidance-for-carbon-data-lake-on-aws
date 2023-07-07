"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkContextFilePresent = exports.checkQuicksightSetup = exports.checkServerAccessLogsUseBucketPolicy = exports.checkAdminEmailSetup = void 0;
const cdk_context_template_json_1 = __importDefault(require("../../cdk.context.template.json"));
function checkAdminEmailSetup(adminEmail) {
    if (adminEmail === undefined) {
        console.warn('****************************************************************');
        console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***');
        console.warn('*** you can do this by editing cdk.context.json 🚀            ***');
        console.warn('****************************************************************');
        console.error('🛑 No adminEmail entered. Please try again');
        process.exit(1);
    }
    else {
        console.info('✅ Successfully set up adminEmail');
    }
}
exports.checkAdminEmailSetup = checkAdminEmailSetup;
function checkServerAccessLogsUseBucketPolicy(scope) {
    if (scope.node.tryGetContext('@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy') !== true) {
        throw new Error("@aws-cdk/aws-s3:serverAccessLogsUseBucketPolicy is not enforced, please switch it to true in your cdk.json");
    }
}
exports.checkServerAccessLogsUseBucketPolicy = checkServerAccessLogsUseBucketPolicy;
function checkQuicksightSetup(scope) {
    console.log('Logging all quicksight stuff...');
    const templateQuicksightUsername = cdk_context_template_json_1.default['quicksightUserName'];
    const quicksightUsername = scope.node.tryGetContext("quicksightUserName");
    const deployQuicksightStack = scope.node.tryGetContext("deployQuicksightStack");
    console.log(templateQuicksightUsername);
    console.log(quicksightUsername);
    console.log(deployQuicksightStack);
    if (deployQuicksightStack === true && quicksightUsername === templateQuicksightUsername) {
        console.warn('**********************************************************************************');
        console.warn(`⛔️ WARNING: You are seeing this message because you have set deployQuicksightStack as true but you have not followed all steps to set up Quicksight. You seem to have set your quicksightUserName as ${quicksightUsername} \n\n`);
        console.warn(`Hmmmm 🧐 this is mysteriously similar to ${templateQuicksightUsername} -- which is the default email placeholder in our context file template. This seems like a clue that you may not have updated cdk.context.json 👀👀👀👀`);
        console.warn('You can fix this! 🛠  Read on for directions...\n\n');
        console.warn('##################################################################################');
        console.warn('*** First follow the directions for Quicksight module setup 👇   *****************');
        console.warn('*** lib/stacks/stack-quicksight/documentation/README.md          *****************');
        console.warn('*** 🚨 Please note that you MUST follow ALL directions IN ORDER  *****************');
        console.warn('*** ###################################################          *****************');
        console.warn('*** ❓ Did you set up a Quicksight account?                      *****************');
        console.warn('*** ❓ Did you create a Quicksight user with author privileges?   *****************');
        console.warn('*** ❓ Did you accept the email invite and log in as that user?   *****************');
        console.warn('*** ❓ Did you enter the email for that user in cdk context?      *****************');
        console.warn('*** do this at cdk.context.json under quicksightUserName         *****************');
        console.warn('**********************************************************************************');
        console.error('🛑 Quicksight module enabled, but not set up. Please follow directions above and try again');
        process.exit(1);
    }
    else {
        console.info('✅ Successfully set up quicksightUsername');
    }
}
exports.checkQuicksightSetup = checkQuicksightSetup;
function checkContextFilePresent(scope) {
    for (const key in cdk_context_template_json_1.default) {
        const context = scope.node.tryGetContext(key);
        if (context === undefined) {
            console.warn('****************************************************************************************');
            console.warn(`*** ⛔️ WARNING: You must provide a valid ${key} value in cdk.context.json ******`);
            console.warn('*** ❓ Did you make a copy of cdk.context.template.json?                    ************');
            console.warn('*** ❓ Did you fill in all the required values for cdk context?             ************');
            console.warn('*** 💻 you can do this by editing cdk.context.json 🚀                       ************');
            console.warn('****************************************************************************************');
            console.error(`🛑 No ${key} entered. Please try again`);
            console.error(`🛑 You may need to copy cdk.context.template.json and rename the copied file as cdk.context.json`);
            process.exit(1);
        }
        else {
            console.info(`✅ Successfully defined ${key} as ${context} in context 🎉`);
        }
    }
}
exports.checkContextFilePresent = checkContextFilePresent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBDaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNldHVwQ2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsZ0dBQTZEO0FBRTdELFNBQWdCLG9CQUFvQixDQUFDLFVBQWtCO0lBQ3JELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUE7UUFDaEYsT0FBTyxDQUFDLElBQUksQ0FBQyxtRUFBbUUsQ0FBQyxDQUFBO1FBQ2pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQTtRQUNqRixPQUFPLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxDQUFDLENBQUE7UUFDaEYsT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1FBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEI7U0FBTTtRQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtLQUNqRDtBQUNILENBQUM7QUFYRCxvREFXQztBQUVELFNBQWdCLG9DQUFvQyxDQUFDLEtBQWM7SUFDakUsSUFBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpREFBaUQsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN2RixNQUFNLElBQUksS0FBSyxDQUFDLDRHQUE0RyxDQUFDLENBQUM7S0FDL0g7QUFDSCxDQUFDO0FBSkQsb0ZBSUM7QUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxLQUFjO0lBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtJQUM5QyxNQUFNLDBCQUEwQixHQUFHLG1DQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUN4RSxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDekUsTUFBTSxxQkFBcUIsR0FBRyxL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J1xuaW1wb3J0IGNvbnRleHRUZW1wbGF0ZSBmcm9tICcuLi8uLi9jZGsuY29udGV4dC50ZW1wbGF0ZS5qc29uJ1xuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBZG1pbkVtYWlsU2V0dXAoYWRtaW5FbWFpbDogc3RyaW5nKSB7XG4gIGlmIChhZG1pbkVtYWlsID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zb2xlLndhcm4oJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUud2FybignKioqIOKblO+4jyBXQVJOSU5HOiBZb3UgbXVzdCBwcm92aWRlIGEgdmFsaWQgYWRtaW5FbWFpbCBhZGRyZXNzICAgKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKiB5b3UgY2FuIGRvIHRoaXMgYnkgZWRpdGluZyBjZGsuY29udGV4dC5qc29uIPCfmoAgICAgICAgICAgICAqKionKVxuICAgIGNvbnNvbGUud2FybignKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKicpXG4gICAgY29uc29sZS5lcnJvcign8J+bkSBObyBhZG1pbkVtYWlsIGVudGVyZWQuIFBsZWFzZSB0cnkgYWdhaW4nKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbygn4pyFIFN1Y2Nlc3NmdWxseSBzZXQgdXAgYWRtaW5FbWFpbCcpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrU2VydmVyQWNjZXNzTG9nc1VzZUJ1Y2tldFBvbGljeShzY29wZTogY2RrLkFwcCkge1xuICBpZihzY29wZS5ub2RlLnRyeUdldENvbnRleHQoJ0Bhd3MtY2RrL2F3cy1zMzpzZXJ2ZXJBY2Nlc3NMb2dzVXNlQnVja2V0UG9saWN5JykgIT09IHRydWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJAYXdzLWNkay9hd3MtczM6c2VydmVyQWNjZXNzTG9nc1VzZUJ1Y2tldFBvbGljeSBpcyBub3QgZW5mb3JjZWQsIHBsZWFzZSBzd2l0Y2ggaXQgdG8gdHJ1ZSBpbiB5b3VyIGNkay5qc29uXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1F1aWNrc2lnaHRTZXR1cChzY29wZTogY2RrLkFwcCkge1xuICBjb25zb2xlLmxvZygnTG9nZ2luZyBhbGwgcXVpY2tzaWdodCBzdHVmZi4uLicpXG4gIGNvbnN0IHRlbXBsYXRlUXVpY2tzaWdodFVzZXJuYW1lID0gY29udGV4dFRlbXBsYXRlWydxdWlja3NpZ2h0VXNlck5hbWUnXVxuICBjb25zdCBxdWlja3NpZ2h0VXNlcm5hbWUgPSBzY29wZS5ub2RlLnRyeUdldENvbnRleHQoXCJxdWlja3NpZ2h0VXNlck5hbWVcIilcbiAgY29uc3QgZGVwbG95UXVpY2tzaWdodFN0YWNrID0gc2NvcGUubm9kZS50cnlHZXRDb250ZXh0KFwiZGVwbG95UXVpY2tzaWdodFN0YWNrXCIpXG4gIGNvbnNvbGUubG9nKHRlbXBsYXRlUXVpY2tzaWdodFVzZXJuYW1lKVxuICBjb25zb2xlLmxvZyhxdWlja3NpZ2h0VXNlcm5hbWUpXG4gIGNvbnNvbGUubG9nKGRlcGxveVF1aWNrc2lnaHRTdGFjaylcbiAgaWYgKGRlcGxveVF1aWNrc2lnaHRTdGFjayA9PT0gdHJ1ZSAmJiBxdWlja3NpZ2h0VXNlcm5hbWUgPT09IHRlbXBsYXRlUXVpY2tzaWdodFVzZXJuYW1lKSB7XG4gICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBg4puU77iPIFdBUk5JTkc6IFlvdSBhcmUgc2VlaW5nIHRoaXMgbWVzc2FnZSBiZWNhdXNlIHlvdSBoYXZlIHNldCBkZXBsb3lRdWlja3NpZ2h0U3RhY2sgYXMgdHJ1ZSBidXQgeW91IGhhdmUgbm90IGZvbGxvd2VkIGFsbCBzdGVwcyB0byBzZXQgdXAgUXVpY2tzaWdodC4gWW91IHNlZW0gdG8gaGF2ZSBzZXQgeW91ciBxdWlja3NpZ2h0VXNlck5hbWUgYXMgJHtxdWlja3NpZ2h0VXNlcm5hbWV9IFxcblxcbmBcbiAgICApXG4gICAgY29uc29sZS53YXJuKFxuICAgICAgYEhtbW1tIPCfp5AgdGhpcyBpcyBteXN0ZXJpb3VzbHkgc2ltaWxhciB0byAke3RlbXBsYXRlUXVpY2tzaWdodFVzZXJuYW1lfSAtLSB3aGljaCBpcyB0aGUgZGVmYXVsdCBlbWFpbCBwbGFjZWhvbGRlciBpbiBvdXIgY29udGV4dCBmaWxlIHRlbXBsYXRlLiBUaGlzIHNlZW1zIGxpa2UgYSBjbHVlIHRoYXQgeW91IG1heSBub3QgaGF2ZSB1cGRhdGVkIGNkay5jb250ZXh0Lmpzb24g8J+RgPCfkYDwn5GA8J+RgGBcbiAgICApXG4gICAgY29uc29sZS53YXJuKCdZb3UgY2FuIGZpeCB0aGlzISDwn5ugICBSZWFkIG9uIGZvciBkaXJlY3Rpb25zLi4uXFxuXFxuJylcbiAgICBjb25zb2xlLndhcm4oJyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMnKVxuICAgIGNvbnNvbGUud2FybignKioqIEZpcnN0IGZvbGxvdyB0aGUgZGlyZWN0aW9ucyBmb3IgUXVpY2tzaWdodCBtb2R1bGUgc2V0dXAg8J+RhyAgICoqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKiBsaWIvc3RhY2tzL3N0YWNrLXF1aWNrc2lnaHQvZG9jdW1lbnRhdGlvbi9SRUFETUUubWQgICAgICAgICAgKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUud2FybignKioqIPCfmqggUGxlYXNlIG5vdGUgdGhhdCB5b3UgTVVTVCBmb2xsb3cgQUxMIGRpcmVjdGlvbnMgSU4gT1JERVIgICoqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgICAgICAgICAgKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUud2FybignKioqIOKdkyBEaWQgeW91IHNldCB1cCBhIFF1aWNrc2lnaHQgYWNjb3VudD8gICAgICAgICAgICAgICAgICAgICAgKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUud2FybignKioqIOKdkyBEaWQgeW91IGNyZWF0ZSBhIFF1aWNrc2lnaHQgdXNlciB3aXRoIGF1dGhvciBwcml2aWxlZ2VzPyAgICoqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLndhcm4oJyoqKiDinZMgRGlkIHlvdSBhY2NlcHQgdGhlIGVtYWlsIGludml0ZSBhbmQgbG9nIGluIGFzIHRoYXQgdXNlcj8gICAqKioqKioqKioqKioqKioqKicpXG4gICAgY29uc29sZS53YXJuKCcqKiog4p2TIERpZCB5b3UgZW50ZXIgdGhlIGVtYWlsIGZvciB0aGF0IHVzZXIgaW4gY2RrIGNvbnRleHQ/ICAgICAgKioqKioqKioqKioqKioqKionKVxuICAgIGNvbnNvbGUud2FybignKioqIGRvIHRoaXMgYXQgY2RrLmNvbnRleHQuanNvbiB1bmRlciBxdWlja3NpZ2h0VXNlck5hbWUgICAgICAgICAqKioqKioqKioqKioqKioqKicpXG4gICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJylcbiAgICBjb25zb2xlLmVycm9yKCfwn5uRIFF1aWNrc2lnaHQgbW9kdWxlIGVuYWJsZWQsIGJ1dCBub3Qgc2V0IHVwLiBQbGVhc2UgZm9sbG93IGRpcmVjdGlvbnMgYWJvdmUgYW5kIHRyeSBhZ2FpbicpXG4gICAgcHJvY2Vzcy5leGl0KDEpXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5pbmZvKCfinIUgU3VjY2Vzc2Z1bGx5IHNldCB1cCBxdWlja3NpZ2h0VXNlcm5hbWUnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0NvbnRleHRGaWxlUHJlc2VudChzY29wZTogY2RrLkFwcCkge1xuICBmb3IgKGNvbnN0IGtleSBpbiBjb250ZXh0VGVtcGxhdGUpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gc2NvcGUubm9kZS50cnlHZXRDb250ZXh0KGtleSlcbiAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKVxuICAgICAgY29uc29sZS53YXJuKGAqKiog4puU77iPIFdBUk5JTkc6IFlvdSBtdXN0IHByb3ZpZGUgYSB2YWxpZCAke2tleX0gdmFsdWUgaW4gY2RrLmNvbnRleHQuanNvbiAqKioqKipgKVxuICAgICAgY29uc29sZS53YXJuKCcqKiog4p2TIERpZCB5b3UgbWFrZSBhIGNvcHkgb2YgY2RrLmNvbnRleHQudGVtcGxhdGUuanNvbj8gICAgICAgICAgICAgICAgICAgICoqKioqKioqKioqKicpXG4gICAgICBjb25zb2xlLndhcm4oJyoqKiDinZMgRGlkIHlvdSBmaWxsIGluIGFsbCB0aGUgcmVxdWlyZWQgdmFsdWVzIGZvciBjZGsgY29udGV4dD8gICAgICAgICAgICAgKioqKioqKioqKioqJylcbiAgICAgIGNvbnNvbGUud2FybignKioqIPCfkrsgeW91IGNhbiBkbyB0aGlzIGJ5IGVkaXRpbmcgY2RrLmNvbnRleHQuanNvbiDwn5qAICAgICAgICAgICAgICAgICAgICAgICAqKioqKioqKioqKionKVxuICAgICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJylcbiAgICAgIGNvbnNvbGUuZXJyb3IoYPCfm5EgTm8gJHtrZXl9IGVudGVyZWQuIFBsZWFzZSB0cnkgYWdhaW5gKVxuICAgICAgY29uc29sZS5lcnJvcihg8J+bkSBZb3UgbWF5IG5lZWQgdG8gY29weSBjZGsuY29udGV4dC50ZW1wbGF0ZS5qc29uIGFuZCByZW5hbWUgdGhlIGNvcGllZCBmaWxlIGFzIGNkay5jb250ZXh0Lmpzb25gKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhg4pyFIFN1Y2Nlc3NmdWxseSBkZWZpbmVkICR7a2V5fSBhcyAke2NvbnRleHR9IGluIGNvbnRleHQg8J+OiWApXG4gICAgfVxuICB9XG59XG4iXX0=