# Contributing

Hi! Welcome to the Contributor's guide for Carbon Data Lake. This is very much a collaborative project that we are approaching with the spirit of open source. Please exercise ownership and treat this project like you're a founder and key contributor. That means you will have lots of power to fix things and also to break things. Not a ton of risk at the time of this writing, since this is a project that is not in production or in use by anybody but us! Once more people start using this we will probably need to create more checks and balances, but for now if you're been invited to this project you should consider yourself an owner with all the powers and responsibilities that come with this. This guide takes you from "hi I'm brand new to this project" all the way through "I commit, merge, and deploy like it's my job".

Read on to find out how to set up your dev environment and get started.

## Languages and Frameworks

* Infrastructure: CDK Typescript Level 1-2-3 and Cloudformation
* Lambda Functions: Python 3.9
* Front-End: React and AWS Cloudscape
* CI/CD: Gitlab to Codecommit Mirroring via HTTPS

## Setting Up Your Dev Environment

Okay so getting set up with all the right tooling at Amazon is a little tricky, but it's not so bad. In fact once you've got the right tooling all set up your life will get way easier. But be patient, if you're new to developing with Gitlab at AWS or Amazon it's going to take a little while to remove the friction from the process.

So there are a few things you'll want to do to get started developing with Gitlab:

1. [Set up Gitlab access for AWS using Midway and SSH](https://w.amazon.com/bin/view/AWS/Teams/WWPS/TSD/GitLab#HSettingupgitAccess)
2. [Set up isengardcli and start using it (trust us)](https://w.amazon.com/bin/view/Isengard-cli/)
3. Pick an IDE of choice -- we generally recommend VS Code (see more about vs code setup for amazon [here](https://w.amazon.com/bin/view/VisualStudioCode/#HDownloadingandinstalling)), but it's up to you. Cloud9 can also be quite nice when you're doing CDK and/or Amplify work.

## Picking an Issue & Getting Started**

There are two ways to start contributing to the CarbonLakeQS project...

#### If you have been onboarded as a contributor and joined the CarbonLakeQS Team
- You can create branches and work off of them. The directions below are all about this.
- Proceed :D

#### If you are just out here on your own looking to contribute or just want to play around and use some of our code
- Follow the same instructions below, but instead of following a branching workflow (you won't be able to bc you don't have permissions by default), you are going to fork the repository.
- See some docs on forking gitlab repos [here](https://docs.gitlab.com/ee/user/project/repository/forking_workflow.html)
- When you fork the repository you can either use it for your own purposes or you can submit merge requests back with changes or updates you have made. We would love to hear about what you're doing with the fork at `#carbonlake-interest` on slack.

### 1/ Pick an Issue OR Create One 

Whew! You did it. You're up and running and now it's time to pick an issue and get started. If you've been assigned an issue that's easy-sauce. Go get started there. If you haven't been assigned an issue now is a great time to pick one. You will notice that all issues have tags (or should...at least). If this is your first time contributing we recommend you pick a `good-first-issue` tag and start there. It will be much more gratifying and let you get used to contributing. If you're not new, then we recommend you pick something that matches your general desire to commit time and your overall skillset and/or desire to learn.

If you are creating an issue or you simply have one that's not well defined please use the issue template below and fill in all the sections. Generally we try to keep issue writing simple but make sure we're covering all the details. You will keep adding details to the issue and it will make things go really awesome...

```markdown
## User Story

As a ##### I want to ##### so that ####

## Feature Description

Insert single sentence description of the feature that helps accomplish the user story above

## Architecture

![issue title reference architecture](./resources/architecture/issue-title-arch-diagram.png)

Figure 1. {insert-issue-title} architectural diagram

## Inputs
- Input 1
- Input 2

## Functions
- List the things that the feature does with the inputs
- List the other things that the feature does with the inputs

## Outputs
- List the outputs
- List more outputs

## AWS Services
- List Services
- List Services

## Requirements
- List functional requirement
- List functional requirement

## Dependencies
- List dependency
- List dependency

## Constraints and Performance Parameters
- List here

## Limitations
- List known limitationt
- List known limitations

## Open Questions
- List open questions

## Tasks
- [ ] Task
- [ ] Task

## Next Steps

List the next steps in the process


```

_Done with creating your issue? If you are creating a new stack it should be initialized with it's own README.md. Please create a directory within your stack directory called `/documentation` and place a file in it called `README.md`. Use the template below and fill in your README fields._

```markdown
## Summary
Insert 2-3 sentence summary of this module.

## Architecture

![issue title reference architecture](./resources/architecture/issue-title-arch-diagram.png)

Figure 1. {insert-issue-title} architectural diagram

## What you will build
1.
2.
3.
4.

## What it does
This module accepts <> as input and outputs <>. You will know it works if <>.

## AWS Services
- Service
- Service

## Inputs
Brief 1-2 sentence description of inputs.

## Outputs
Brief 1-2 sentence description of outputs.

**Dependencies**
- Insert
- Insert

## Tests
1.
2.
3.

## Limitations
1.
2.
3.

## Troubleshooting
Insert list of common errors and their solutions.


```

### 2/ Make sure you know what to do

So you picked an issue. Take a quick read and make sure you're really clear about what you have to do. All issues in CarbonLakeQS _should_ include an issue template that tell you allll about what you need to do. No issue template? You can either reach out to the person who wrote the issue and help them make one...or just pick a different one.

### 3/ Create a Branch or Fork

Use the "create branch" button (hint: same button as "create merge request" just click for the dropdown options). Create a new branch with `/main` as the origin. Why? Because that is the active dev environment. You can always rebase with this, but start from here. Leave the issue name as the root and add `<identifier>/issue-title/your-amazon-alias` where the idenifiers ar `feature`, `bugfix`, `hotfix`, `documentation`.

For example -- if my issue is called `my-CarbonLakeQS-issue` then gitlab has added an issue number and you're going to add you alias. The structure will be `issueNumber-issueTitle-yourAmazonAlias` so it will now look like `feature/9-my-CarbonLakeQS-issue/peccyamazonian`

As another example if you are creating documentation it might look like `documentation/add-docs-about-docs-to-docs/peccyamazonian`

_Thanks for doing that! It makes it really easy to know who is working on what and allows multiple people to maintain branches related to the same issue. Create your branch and clone away._

### 4/ Add yourself as "assignee", create a due date, comment about what you plan to do

Make sure you add yourself ass assignee, set tags to `WIP` at a minimum, and select a due date. Now write a brief comment about what you plan to do. Don't write a book, just something that makes it clear what you're working on and how you're approaching development.

### 5/ Get coding!

Follow the instructions here for:
1. [Getting started with a Gitlab branch](https://docs.gitlab.com/ee/tutorials/make_your_first_git_commit.html)
2. [Getting started with CDK](https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html)
3. [Creating a CDK App with Multiple Stacks](https://docs.aws.amazon.com/cdk/v2/guide/stack_how_to_create_multiple_stacks.html)


## CDK Architecture

CDK is so nice! It's very similar to Cloudformation but far easier to maintain, update, and secure. Don't believe me -- well you'll have to try. So...CarbonLakeQS is developed in CDK with TypeScript because it has the best support. Not super comfortable with TypeScript? Don't worry. You will get there. There is nothing crazy complicated in CDK.

We are using a CDK with component constructs approach to development. Why? Because that way everyone can work on their own encapsulated stacks and develop separately for shared deployment. How does this work? I will tell you...

1. Every piece of infrastructure is encapsulated in it's own CDK stack. This is basically a single CDK file that deploys everything this stack needs. Want to nest stacks within this stack? Cool. Go for it. But I recommend you just start simple with one file.
2. Okay you've got your stack. You might have a stack for storage. All your s3 buckets are going to be in this stack. This stack will live in a directory called `storage` Need to pass environmental variables to this? We get it. So you can pass them as props via Typescript. Now you've got the needed environmental variables (these might be passed from some other part of your infrastructure).
3. Okay now we've got all these stacks like `storage` and `iot` and `dashboard` and `monitoring` or something like that. Now there is a main stack that basically calls all these stacks and deploys them in order, returning any outputs needed for inputs to other stacks. Make sense?

It's just like the way cloudformation stacks work when they're deployed as nested stacks. Basically you can build a bunch of independent modules, but they all are called in succession by a main module. Sound fun? Try it out.

Want to learn more about CDK development at Amazon? This is a good place to start:
- [CDK Hacks Broadcast Channel](https://broadcast.amazon.com/channels/36432)
- [CDK at Scale Video](https://broadcast.amazon.com/videos/259836)
- [Technical Delivery Kit Examples](https://gitlab.aws.dev/technical-delivery-kits)

## Atomic Commits

Please plan to approach your contributions with the principle of Atomic Commits. So what exactly are atomic commits? Atomic commits are so small that they cannot be broken up into any smaller pieces (like an atom unless you're doing fission or fusion, but let's keep things newtonian). There are four features an atomic commit needs to have:
    1. Single Atomic Unit: Every commit pertains to one feature or fix and one feature or fix only.
    2. Everything works: Keep your commits small enough that you can validate and test them. Don't break the build.
    3. Clear and Concise: The commit message and description are clear and concise, so that anyone can understand them, even someone brand new to the project
    4. DOCUMENT IT! I said there were three, but the fourth is a super-feature -- document it. Write comments for the code and add to the readme. Your feature is only atomic if you document it so that someone else can build upon it.

### Why atomic commits?
There are a few key benefits to atomic commits:
    1. Less time spend solving merge conflicts
    2. Simplified code review
    3. Easier for other contributors to add their own features
    4. Forcing function for thorough documentation
    5. Relevant and clear history and lineage

### How to follow the principle of atomic commits
1. Only check out branches or create new branches by tagging them to an issue
2. Commit early and often. If you're wondering "shoudl I commit" you probably should
3. Keep commit messages to less than 10 words -- okay, okay, this is a general rule. But keep the sentences short and concise. In general if the message can be broken into multiple sentences you are probably jamming a few too many features in.

## Testing Your Code

Okay so we're keeping testing relatively easy here. For now. So basically please test your branches and ensure they deploy along with the full infrastructure before you make a merge request. What does this mean? Use the Isengard account for your feature and make sure everything deploys and generally works. CDK will do a lot of automated testing for you. But beyond that your testing will be your responsibility. This is not a production app, so for now don't be too skittish. We need to develop things and it would be nice to not break upstream code, but if you do...the door is two-way and the consequences are relatively few.

## Before you merge!

Before you merge you MUST do the following. If you don't, you will be sorry :laughing: 

```
git checkout main
git pull
git checkout your-branch-that-you-plan-to push
git merge main
git push
```
This process will enforce local resolution of merge conflicts before pushing to the remote upstream repo. Please resolve all conflicts to the best of your ability before pushing. If you are unsure please reach out to one of the maintainers.

Quick Note: Hey buddy! You can only make changes to this repo by merge request.

## Merge Requests

1. Select "merge requests" from the left navigation drawer
2. Select "create new merge request"
3. Select your source branch (hint, the one you've been working on) and your target branch (hint: `main`)
4. Select a reviewer and an approver. You can assign any contributor as a reviewer. You may only assign a maintainer as an approver. And don't break stuff please. Or do. That's fine also.
5. Write your comments, keep them detailed and clear. What did you do, how does it relate to the issue, what are the inputs, what are the outputs, what are the dependencies, how did you test it, what is the expected behavior?
6. Once your merge request has been approved go ahead and close the issue, your code will now be merged into the test branch for further testing and review. After it goes through there if all goes well it will be merged with dev and then eventually with prod. See approval workflow below.

## Approval Workflow

We're going to keep our approval workflow simple in the name of speed and reducing bottlenecks. Don't worry, we can always roll back changes. Thanks, git! Two rules for approvals.

1. The only people who can approve merge requests are maintainers. Consult the project information guide to view a directory of maintainers. Please add yourself as assignee and then a maintainer as the reviewer. The maintainer will approve and or send back to you for changes.

## Deploying Your Code in Sandboxed Test

Ready to deploy your code? Great. You should be developing in an Isengard account just for this issue. In most cases if you're working on a CarbonLakeQS module it will have it's own Isengard account. Do all your test and dev in there, and link the CDK app to that account. We strongly recommend you don't use this account for anything else. It will make your life way easier.

## Deploying Your Code to Consolidated Test

Ready to deploy this code further down the pipe? Great news. We use code mirroring between gitlab and the `CarbonLakeQS-qsv1-test` isengard account to simplify the process of pushing `qsv1-test` branch. So once a merge request to test is accepted it will automatically deploy. Go take a look in the test isengard and see how things went. Run into an issue? Roll back immediately and then search for the root cause.

## Approval Workflow

We're going to keep our approval workflow simple in the name of speed and reducing bottlenecks. Don't worry, we can always roll back changes. Thanks, git! Always have one approver for merge to `main`. Ask them if they have the time to approve your code before you actually assign them.

## Getting Feedback and Support

## Deploying Your Code to "Production"

There is no "production" as of now, but once there is it will follow the same automated pipeline process as the deploying to consolidated test above.

## Additional Resources

### Some additional useful context

It may also be helpful to know what the CI/CD pipeline for this project looks like. Keep in mind that we are approaching development from an asynchronous gated open source perspective. That means we've designed the project to move fast with minimal need for synchronous communication. So let's consider the lifecycle of an issue, feature, fix, whatever:

1. Issue is created with a clear user story, input, desired output, description, and references section
2. Contributor selects an issue and creates a branch
3. Contributor works on the branch with atomic commits and clear concise messages
4. Contributor submits a merge request and a request to close the issue
5. 2 reviewers review and approver approves
6. Code is deployed to test environment isengard account
7. Automated tests are run
8. Manual tests are run
9. Depending on outcome the test environment either:
    - Triggers an approval process for the dev environment
    - Triggers a merge comment and a request for revisions
10. Once deployed to dev the whole process starts again, with a longer list of approvals

So now imagine that all of that is run by volunteers. The good news is that we can always roll back, but the bottom line is **keep things atomic** the smaller the update the easier it is to push it through the pipeline with proper devsecops hygeine. So be nice and keep things atomic. Thanks!

#### Handy Resource: Some Git Commands for Maintaining Atomic Commits

1. Add changes to last commit:
2. Change multiple past commits: initiated interactive rebase `git rebase -i HEAD~5` where `5` is the number of commits you want to go back. Change `pick` into `e` for any commit you want to change. Then after writing and saving your file continue to the next commit with `git rebase --continue`
3. Stash your changes: stash (remove) your changes with `git stash` and retrieve them later with `git stash apply`
4. Reset a commit: `git reset HEAD~`
5. Enter interactive rebase: `git rebase -i HEAD~5` and replace `pick` with `f` for fixup. Squash does the same `s` but allows you to edit the comment message and description
5. Take a commit from another branch: find the commit with `git log`. Copy the hash. Now "cherry-pick" the commit with `git cherry-pick 1234yourhash`

### Troubleshooting Sagemaker Access

### 1.5/ Enable Sagemaker Notebook Instance Type

Note for AWS users only (will be removed later). To deploy the forecast stack in an Isengard account If you're an internal AWS Isengard user you will need to request a Sagemaker notebook limit increase at this link:

1. Go to [Sagemaker Tools](https://sagemaker-tools.corp.amazon.com/limits)
2. Select the resource type dropdown
3. Select `notebook instances`
4. Select `notebook-instance/ml.t2.large` and select 1 instance as the limit
5. Under justification required enter: Quickstart development.
6. Press enter