"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkQuicksightSetup = exports.checkAdminEmailSetup = void 0;
function checkAdminEmailSetup(adminEmail) {
    if (adminEmail === "enter-context-parameter") {
        console.warn('****************************************************************');
        console.warn('*** ⛔️ WARNING: You must provide a valid adminEmail address   ***');
        console.warn('*** you can do this by editing cdk.context.json 🚀            ***');
        console.warn('****************************************************************');
        console.error('🛑 No adminEmail entered. Please try again');
        process.exit(1);
    }
    else {
        console.info("✅ Successfully set up adminEmail");
    }
}
exports.checkAdminEmailSetup = checkAdminEmailSetup;
function checkQuicksightSetup(quicksightUsername) {
    if (quicksightUsername === "enter-context-parameter") {
        console.warn('********************************************************************');
        console.warn('*** ⛔️ WARNING: You are seeing this message because              ***');
        console.warn('*** you have set deployQuicksightStack as true                   ***');
        console.warn('*** but you have not followed all steps to set up Quicksight     ***');
        console.warn('*** You can fix this! 🛠  Read on for directions...              ***');
        console.warn('*** ###################################################          ***');
        console.warn('*** First follow the directions for Quicksight module setup 👇   ***');
        console.warn('*** lib/stacks/stack-quicksight/documentation/README.md          ***');
        console.warn('*** 🚨 Please note that you MUST follow ALL directions IN ORDER  ***');
        console.warn('*** ###################################################          ***');
        console.warn('*** ❓ Did you set up a Quicksight account?                      ***');
        console.warn('*** ❓ Did you create a Quicksight user with author privileges?   ***');
        console.warn('*** ❓ Did you accept the email invite and log in as that user?   ***');
        console.warn('*** ❓ Did you enter the email for that user in cdk context?      ***');
        console.warn('*** do this at cdk.context.json under quicksightUserName         ***');
        console.warn('********************************************************************');
        console.error('🛑 Quicksight module enabled, but not set up. Please follow directions above and try again');
        process.exit(1);
    }
    else {
        console.info("✅ Successfully set up quicksightUsername");
    }
}
exports.checkQuicksightSetup = checkQuicksightSetup;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXBDaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNldHVwQ2hlY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsU0FBZ0Isb0JBQW9CLENBQUMsVUFBaUI7SUFDbEQsSUFBSSxVQUFVLEtBQUsseUJBQXlCLEVBQUU7UUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQztRQUNsRixPQUFPLENBQUMsSUFBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7UUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ2pGLE9BQU8sQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO1NBQU07UUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUE7S0FDakQ7QUFDTCxDQUFDO0FBWEgsb0RBV0c7QUFFSCxTQUFnQixvQkFBb0IsQ0FBQyxrQkFBeUI7SUFDMUQsSUFBSSxrQkFBa0IsS0FBSyx5QkFBeUIsRUFBRTtRQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO1FBQ3BGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLHNFQUFzRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLEtBQUssQ0FBQyw0RkFBNEYsQ0FBQyxDQUFBO1FBQzNHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7U0FBTTtRQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQTtLQUN6RDtBQUNMLENBQUM7QUF2Qkgsb0RBdUJHIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBZG1pbkVtYWlsU2V0dXAoYWRtaW5FbWFpbDpzdHJpbmcpe1xuICAgIGlmIChhZG1pbkVtYWlsID09PSBcImVudGVyLWNvbnRleHQtcGFyYW1ldGVyXCIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqJyk7XG4gICAgICAgIGNvbnNvbGUud2FybignKioqIOKblO+4jyBXQVJOSU5HOiBZb3UgbXVzdCBwcm92aWRlIGEgdmFsaWQgYWRtaW5FbWFpbCBhZGRyZXNzICAgKioqJyk7XG4gICAgICAgIGNvbnNvbGUud2FybignKioqIHlvdSBjYW4gZG8gdGhpcyBieSBlZGl0aW5nIGNkay5jb250ZXh0Lmpzb24g8J+agCAgICAgICAgICAgICoqKicpO1xuICAgICAgICBjb25zb2xlLndhcm4oJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKTtcbiAgICAgICAgY29uc29sZS5lcnJvcign8J+bkSBObyBhZG1pbkVtYWlsIGVudGVyZWQuIFBsZWFzZSB0cnkgYWdhaW4nKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5pbmZvKFwi4pyFIFN1Y2Nlc3NmdWxseSBzZXQgdXAgYWRtaW5FbWFpbFwiKVxuICAgICAgfVxuICB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1F1aWNrc2lnaHRTZXR1cChxdWlja3NpZ2h0VXNlcm5hbWU6c3RyaW5nKXtcbiAgICBpZiAocXVpY2tzaWdodFVzZXJuYW1lID09PSBcImVudGVyLWNvbnRleHQtcGFyYW1ldGVyXCIpIHtcbiAgICAgIGNvbnNvbGUud2FybignKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKionKTtcbiAgICAgIGNvbnNvbGUud2FybignKioqIOKblO+4jyBXQVJOSU5HOiBZb3UgYXJlIHNlZWluZyB0aGlzIG1lc3NhZ2UgYmVjYXVzZSAgICAgICAgICAgICAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiB5b3UgaGF2ZSBzZXQgZGVwbG95UXVpY2tzaWdodFN0YWNrIGFzIHRydWUgICAgICAgICAgICAgICAgICAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiBidXQgeW91IGhhdmUgbm90IGZvbGxvd2VkIGFsbCBzdGVwcyB0byBzZXQgdXAgUXVpY2tzaWdodCAgICAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiBZb3UgY2FuIGZpeCB0aGlzISDwn5ugICBSZWFkIG9uIGZvciBkaXJlY3Rpb25zLi4uICAgICAgICAgICAgICAqKionKTtcbiAgICAgIGNvbnNvbGUud2FybignKioqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyAgICAgICAgICAqKionKTtcbiAgICAgIGNvbnNvbGUud2FybignKioqIEZpcnN0IGZvbGxvdyB0aGUgZGlyZWN0aW9ucyBmb3IgUXVpY2tzaWdodCBtb2R1bGUgc2V0dXAg8J+RhyAgICoqKicpO1xuICAgICAgY29uc29sZS53YXJuKCcqKiogbGliL3N0YWNrcy9zdGFjay1xdWlja3NpZ2h0L2RvY3VtZW50YXRpb24vUkVBRE1FLm1kICAgICAgICAgICoqKicpO1xuICAgICAgY29uc29sZS53YXJuKCcqKiog8J+aqCBQbGVhc2Ugbm90ZSB0aGF0IHlvdSBNVVNUIGZvbGxvdyBBTEwgZGlyZWN0aW9ucyBJTiBPUkRFUiAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgICAgICAgICAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiDinZMgRGlkIHlvdSBzZXQgdXAgYSBRdWlja3NpZ2h0IGFjY291bnQ/ICAgICAgICAgICAgICAgICAgICAgICoqKicpO1xuICAgICAgY29uc29sZS53YXJuKCcqKiog4p2TIERpZCB5b3UgY3JlYXRlIGEgUXVpY2tzaWdodCB1c2VyIHdpdGggYXV0aG9yIHByaXZpbGVnZXM/ICAgKioqJyk7XG4gICAgICBjb25zb2xlLndhcm4oJyoqKiDinZMgRGlkIHlvdSBhY2NlcHQgdGhlIGVtYWlsIGludml0ZSBhbmQgbG9nIGluIGFzIHRoYXQgdXNlcj8gICAqKionKTtcbiAgICAgIGNvbnNvbGUud2FybignKioqIOKdkyBEaWQgeW91IGVudGVyIHRoZSBlbWFpbCBmb3IgdGhhdCB1c2VyIGluIGNkayBjb250ZXh0PyAgICAgICoqKicpO1xuICAgICAgY29uc29sZS53YXJuKCcqKiogZG8gdGhpcyBhdCBjZGsuY29udGV4dC5qc29uIHVuZGVyIHF1aWNrc2lnaHRVc2VyTmFtZSAgICAgICAgICoqKicpO1xuICAgICAgY29uc29sZS53YXJuKCcqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKicpO1xuICAgICAgY29uc29sZS5lcnJvcign8J+bkSBRdWlja3NpZ2h0IG1vZHVsZSBlbmFibGVkLCBidXQgbm90IHNldCB1cC4gUGxlYXNlIGZvbGxvdyBkaXJlY3Rpb25zIGFib3ZlIGFuZCB0cnkgYWdhaW4nKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIuKchSBTdWNjZXNzZnVsbHkgc2V0IHVwIHF1aWNrc2lnaHRVc2VybmFtZVwiKVxuICAgICAgfVxuICB9Il19