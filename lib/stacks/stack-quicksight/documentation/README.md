# CarbonLake Quicksight Module Setup

Placeholder for internal Amazon use: to set up quicksight follow the directions found here: https://quip-amazon.com/I8uHA8P3XriO/CarbonLake-Quickstart-V1-Release-Document#temp:C:KHA67d5b118d37b4619b3a86b145

## Quicksight Setup: Console

1. Log into AWS Console and navigate to *Amazon QuickSight*

<img src="./images/image%20(13).png" alt="qs-step-1" width="50%">

1. If you haven’t used QuickSight before, click on *S**ign up for QuickSight*, otherwise skip this step and proceed to *Set Up a QuickSight User*

   <img alt="qs-step-2" src="./images/image%20(14).png" width="50%">

2. Select the *Enterprise* edition, and click *Continue*

   <img alt="qs-step-3" src="./images/image%20(15).png" width="50%">

3. Under *Create your QuickSight account*, ** fill in the following:
    1. Authentication method: Use IAM federated identities & QuickSight users
    2. QuickSight region: Select the region used for your QuickStart deployment
    3. QuickSight account name: Account name must be globally unique (i.e. “carbonlake-{account-number}”)
    4. Notification email address: Enter your email address

    <img alt="qs-step-4" src="./images/image%20(16).png" width="50%">

4. Under *QuickSight access to AWS services*, fill in the following:
    1. IAM Role: *Use QuickSight-managed role (default)*
    2. Check *Amazon Athena*

   <img alt="qs-step-5" src="./images/image%20(17).png" width="50%">

5. Click *Finish* to complete your account setup

## *Set up Amazon QuickSight user*

1. Click your username in the upper right corner to expand admin options and select *Manage QuickSight*

    <img alt="qs-step-6" src="./images/image%20(18).png" width="50%">

2. Select *Invite Users*

   <img alt="qs-step-7" src="./images/image%20(19).png" width="50%">

3. Enter your desired username into the input field and click *+*. Note: for simplicity, we recommend using your email address as your username. However, QuickSight usernames only allow lowercase letters, uppercase letters, numbers, ‘_’, ‘-’ or ‘.’. If your email address does not fit those requirements, specify a different username.

   <img alt="qs-step-8" src="./images/image%20(20).png" width="50%">

4. Fill in your email address, select *AUTHOR* as the desired role for your user and click *Invite* to send an invitation.

   <img alt="qs-step-9" src="./images/image%20(21).png" width="50%">

   <img alt="qs-step-10" src="./images/image%20(22).png" width="50%">

5. You should receive an email from Amazon QuickSight. If you do not, click *Resend invitation* in the Quicksight console.
6. From your email, click *Click to accept invitation* to confirm your QuickSight user. This is the user you will log into the QuickSight console with to view the QuickStart emissions dataset and dashboard.

   <img alt="qs-step-11" src="./images/image%20(23).png" width="50%">

7. Now you need to go to `cdk.context.json` and enter the `quicksightUsername` you just entered as the parameter for `quicksightUsername`

   <img alt="qs-step-12" src="./images/image%20(24).png" width="50%">

8. You can now `cdk deploy --all` or `cdk deploy QuicksightStack`
9. Log in to the quicksight console with your newly created username. You will need to use the `ACCOUNT_NAME` that you chose when you created the account and sign in with your password.
10. You should now be able to select "dashboard" on the left menu and select the Combined-Emissions-Dashboard. Note that this data will be updated only once you drop data into your CarbonLake landing zone bucket and after the nightly data compaction job.