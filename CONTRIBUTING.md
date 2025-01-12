# Contributing to cron <!-- omit in toc -->

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:

> - Star the project
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues
> - Share the project on forums or social medias
> - Join the [Discord community](https://discord.gg/yyKns29zch)

## Table of Contents <!-- omit in toc -->

- [Code of conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting a Pull Request](#submitting-a-pull-request)
  - [Working With The Code](#working-with-the-code)
- [Coding Rules](#coding-rules)
  - [Source Code](#source-code)
  - [Commit Messages](#commit-messages)
- [Join The Project Team](#join-the-project-team)

## Code of Conduct

Help us keep `cron` open and inclusive. Please read and follow our [Code of conduct](CODE_OF_CONDUCT.md).

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](https://github.com/kelektiv/node-cron#readme).

Before you ask a question, it is best to search for existing [Issues](https://github.com/search?q=repo%3Akelektiv%2Fnode-cron+&type=issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend you join the [Discord community](https://discord.gg/yyKns29zch)! We will take care to answer you as soon as possible.

## I Want To Contribute

> ### Legal Notice <!-- omit in toc -->
>
> When contributing to this project, you must agree that you have authored 100% of the content, that you have the necessary rights to the content and that the content you contribute may be provided under the project license.

### Reporting Bugs

#### Before Submitting a Bug Report <!-- omit in toc -->

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions (Make sure that you have read the [documentation](https://github.com/kelektiv/node-cron#readme). If you are looking for support, you might want to check [this section](#i-have-a-question)).
- Perform a [search](https://github.com/search?q=repo%3Akelektiv%2Fnode-cron++label%3Atype%3Abug&type=issues) to see if the bug/error has already been reported. If it has, add a comment to the existing issue instead of opening a new one.
- Also make sure to search the internet (including Stack Overflow) to see if users outside of the GitHub community have discussed the issue.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS and Version
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? Can you also reproduce it with older versions?

#### How Do I Submit a Good Bug Report? <!-- omit in toc -->

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open a [Bug report issue](https://github.com/kelektiv/node-cron/issues/new/choose). (Since we can't be sure at this point whether it is a bug or not, we ask you not to talk about a bug yet and not to label the issue.)
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the _reproduction steps_ that someone else can follow to recreate the issue on their own. This usually includes your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

Once it's filed:

- The project team will label the issue accordingly.
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `cannot reproduce`. Bugs with the `cannot reproduce` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `bug`, as well as possibly other tags, and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for cron, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement <!-- omit in toc -->

- Make sure that you are using the latest version.
- Read the [documentation](https://github.com/kelektiv/node-cron#readme) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/search?q=repo%3Akelektiv%2Fnode-cron++label%3Atype%3Afeature&type=issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion? <!-- omit in toc -->

Enhancement suggestions are tracked as [GitHub issues](https://github.com/kelektiv/node-cron/issues).

- Open a [Feature request issue](https://github.com/kelektiv/node-cron/issues/new/choose).
- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- **Explain why this enhancement would be useful** to most cron users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Submitting a Pull Request

Good pull requests, whether patches, improvements, or new features, are a fantastic help.
They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull requests (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's maintainers might not want to merge into the project.

For ambitious tasks, open a [**draft** Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request#converting-a-pull-request-to-a-draft) as soon as possible, in order to get feedback and help from the maintainers and the community.

If you have never created a pull request before, welcome 🎉 😄.
[Here is a great tutorial](https://opensource.guide/how-to-contribute/#opening-a-pull-request) on how to send one :)

Here is a summary of the steps to follow:

1. [Set up the workspace](#set-up-the-workspace)
2. If you cloned a while ago, get the latest changes from upstream and update dependencies:

```bash
$ git checkout main
$ git pull upstream main
$ rm -rf node_modules
$ nvm use
$ npm install
```

3. Create a new topic branch (off the main project development branch) to contain your feature, change, or fix:

```bash
$ git checkout -b <topic-branch-name>
```

4. Make your code changes, following the [Coding Rules](#coding-rules)
5. Push your topic branch up to your fork:

```bash
$ git push origin <topic-branch-name>
```

6. [Open a Pull Request](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request) with a clear title and description.

#### Do not force push to your pull request branch

Please do not force push to your PR's branch after you have created your PR, as doing so forces us to review the whole PR again.
This makes it harder for us to review your work because we don't know what has changed.
PRs will always be squashed by us when we merge your work.
Commit as many times as you need in your pull request branch, but please batch apply review suggestions.

If you're updating your PR branch from within the GitHub PR interface, use the default "Update branch" button.
This is the "Update with merge commit" option in the dropdown.

Force pushing a PR, or using the "Update with rebase" button is OK when you:

- make large changes on a PR which require a full review anyway
- bring the branch up-to-date with the target branch and incorporating the changes is more work than to create a new PR

#### Apply maintainer provided review suggestions

Maintainers can suggest changes while reviewing your pull request.
To apply these suggestions, please:

1. Batch the suggestions into a logical group by selecting the **Add suggestion to batch** button
1. Select the **Commit suggestions** button

Read the [GitHub docs, Applying suggested changes](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/incorporating-feedback-in-your-pull-request#applying-suggested-changes) to learn more.

#### Resolve review comments instead of commenting

A maintainer can ask you to make changes, without giving you a _suggestion_ that you can apply.
In this case you should make the necessary changes.

Once you've done the work, resolve the conversation by selecting the **Resolve conversation** button in the PR overview.
Avoid posting comments like "I've done the work", or "Done".

Read the [GitHub Docs, resolving conversations](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/commenting-on-a-pull-request#resolving-conversations) to learn more.

#### Re-requesting a review

Please do not ping your reviewer(s) by mentioning them in a new comment.
Instead, use the re-request review functionality.
Read more about this in the [GitHub docs, Re-requesting a review](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request#re-requesting-a-review).

#### Discord collaboration with maintainers

The codebase can be difficult to navigate, especially for a first-time contributor.
We don't want you spending an hour trying to work out something that would take us only a minute to explain.

For that reason, you'll find a `#development` channel on our [Discord community](https://discord.gg/yyKns29zch),
dedicated to helping anyone who's working on or considering Pull Requests for `cron`.

### Working With The Code

#### Set up the workspace

[Fork](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#forking-a-repository) the project, [clone](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#cloning-a-fork) your fork, configure the remotes and install the dependencies:

```bash
# Clone your fork of the repo into the current directory
$ git clone git@github.com:<your-username>/node-cron.git # or https://github.com/<your-username>/node-cron.git for HTTPS

# Navigate to the newly cloned directory
$ cd node-cron

# Assign the original repo to a remote called "upstream"
$ git remote add upstream git@github.com:kelektiv/node-cron.git # or https://github.com/kelektiv/node-cron.git for HTTPS

# Switch your node version to the version defined by the project as the development version
# This step assumes you have already installed and configured https://github.com/nvm-sh/nvm
# You may need to run `nvm install` if you have not already installed the development node version
$ nvm use

# Install the dependencies
$ npm install
```

#### Lint

This repository uses [ESLint](https://eslint.org) and [Prettier](https://prettier.io) for linting and formatting.

Before pushing your code changes make sure there are no linting errors with `npm run lint`.

**Tips**:

- Most linting errors can be automatically fixed with `npm run lint:fix`.
- Install the [ESLint plugin](https://eslint.org/docs/latest/use/integrations) for your editor to see linting errors directly in your editor and automatically fix them on save.

#### Tests

This repository uses [Jest](https://jestjs.io) for writing and running tests.

Before pushing your code changes make sure all **tests pass** and the **coverage thresholds are met**:

```bash
$ npm run test
```

**Tips:**

- run a single test file with `npm run test -- <file path>`, for example `npm run test -- tests/crontime.test.ts`
- run a subset of test files with `npm run test -- <glob>`, for example `npm run test -- tests/*.test.ts`
- run a single test case with `npm run test -- -t '<test case name regex>'`, for example `npm run test -- -t 'should parse .*'`
- run in watch mode with `npm run test:watch` to automatically run a test case when you modify it or the associated source code (above tips also work with this command)

## Coding Rules

### Source Code

To ensure consistency and quality throughout the source code, all code modifications must have:

- No [linting](#lint) errors
- A [test](#tests) for every possible case introduced by your code change
- [Valid commit message(s)](#commit-messages)
- Documentation for new features
- Updated documentation for modified features

### Commit Messages

#### Atomic commits

If possible, make [atomic commits](https://en.wikipedia.org/wiki/Atomic_commit), which means:

- a commit should contain exactly one self-contained functional change
- a functional change should be contained in exactly one commit
- a commit should not create an inconsistent state (such as test errors, linting errors, partial fix, feature without documentation, etc...)

A complex feature can be broken down into multiple commits as long as each one maintains a consistent state and consists of a self-contained change.

#### Commit message format

Each commit message consists of a **header**, a **body** and a **footer**.
The header has a special format that includes a **type**, a **scope** and a **subject**:

```commit
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

The **footer** can contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages).

#### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.
In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

#### Type

The type must be one of the following:

|    Type    | Title                    | Description                                                                                                 |
| :--------: | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
|   `feat`   | Features                 | A new feature                                                                                               |
|   `fix`    | Bug Fixes                | A bug Fix                                                                                                   |
|   `docs`   | Documentation            | Documentation only changes                                                                                  |
|  `style`   | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |
| `refactor` | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |
|   `perf`   | Performance Improvements | A code change that improves performance                                                                     |
|   `test`   | Tests                    | Adding missing tests or correcting existing tests                                                           |
|  `build`   | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |
|    `ci`    | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
|  `chore`   | Chores                   | Other changes that don't modify src or test files                                                           |
|  `revert`  | Reverts                  | Reverts a previous commit                                                                                   |

#### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

#### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.

#### Examples

```commit
fix(pencil): stop graphite breaking when too much pressure applied
```

```commit
feat(pencil): add 'graphiteWidth' option

Fix #42
```

```commit
perf(pencil): remove graphiteWidth option

BREAKING CHANGE: The graphiteWidth option has been removed.

The default graphite width of 10mm is always used for performance reasons.
```

## Join The Project Team

This project is looking for help! If you're interested in helping with the project on a regular basis, please reach out to us on the [Discord community](https://discord.gg/yyKns29zch).

## Attribution <!-- omit in toc -->

This guide is based on the [**contributing-gen**](https://github.com/bttger/contributing-gen), [**semantic-release**'s `CONTRIBUTING.md`](https://github.com/semantic-release/semantic-release/blob/master/CONTRIBUTING.md) and [**renovate**'s `CONTRIBUTING.md`](https://github.com/renovatebot/renovate/blob/main/.github/contributing.md).
