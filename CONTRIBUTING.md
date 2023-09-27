# Contributing to cron <!-- omit in toc -->

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:

> - Join the [Discord community](https://discord.gg/yyKns29zch)
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents <!-- omit in toc -->

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Improving The Documentation](#improving-the-documentation)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)
- [Join The Project Team](#join-the-project-team)

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
- To see if other users have experienced (and potentially already solved) the same issue you are having, check if there is not already a bug report existing for your bug or error in the [bug tracker](https://github.com/search?q=repo%3Akelektiv%2Fnode-cron++label%3Abug&type=issues).
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
- A team member will try to reproduce the issue with your provided steps. If there are no reproduction steps or no obvious way to reproduce the issue, the team will ask you for those steps and mark the issue as `needs-repro`. Bugs with the `needs-repro` tag will not be addressed until they are reproduced.
- If the team is able to reproduce the issue, it will be marked `needs-fix`, as well as possibly other tags (such as `critical`), and the issue will be left to be [implemented by someone](#your-first-code-contribution).

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for cron, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

#### Before Submitting an Enhancement <!-- omit in toc -->

- Make sure that you are using the latest version.
- Read the [documentation](https://github.com/kelektiv/node-cron#readme) carefully and find out if the functionality is already covered, maybe by an individual configuration.
- Perform a [search](https://github.com/search?q=repo%3Akelektiv%2Fnode-cron++label%3Aenhancement&type=issues) to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.
- Find out whether your idea fits with the scope and aims of the project. It's up to you to make a strong case to convince the project's developers of the merits of this feature. Keep in mind that we want features that will be useful to the majority of our users and not just a small subset. If you're just targeting a minority of users, consider writing an add-on/plugin library.

#### How Do I Submit a Good Enhancement Suggestion? <!-- omit in toc -->

Enhancement suggestions are tracked as [GitHub issues](https://github.com/kelektiv/node-cron/issues).

- Open a [Feature request issue](https://github.com/kelektiv/node-cron/issues/new/choose).
- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why. At this point you can also tell which alternatives do not work for you.
- **Explain why this enhancement would be useful** to most cron users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

## Working with the code

### Set up the workspace

[Fork](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#forking-a-repository) the project, [clone](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#cloning-a-fork) your fork, configure the remotes and install the dependencies:

```bash
# Clone your fork of the repo into the current directory
$ git clone git@github.com:<your-username>/node-cron.git # or https://github.com/<your-username>/node-cron.git for HTTPS
# Navigate to the newly cloned directory
$ cd node-cron
# Assign the original repo to a remote called "upstream"
$ git remote add upstream git@github.com:kelektiv/node-cron.git # or https://github.com/kelektiv/node-cron.git for HTTPS
# Install the dependencies
$ npm install
```

### Lint

This repository uses [ESLint](https://eslint.org) and [Prettier](https://prettier.io) for linting and formatting.

Before pushing your code changes make sure there are no linting errors with `npm run lint`.

**Tips**:

- Most linting errors can be automatically fixed with `npm run lint:fix`.
- Install the [ESLint plugin](https://eslint.org/docs/latest/use/integrations) for your editor to see linting errors directly in your editor and automatically fix them on save.

### Tests

This repository uses [Jest](https://jestjs.io) for writing and running tests.

Before pushing your code changes make sure all **tests pass** and the **coverage thresholds are met**:

```bash
$ npm run test
```

**Tips:** During development you can:

- run a single test file with `npm run test -- <file path>`, for example `npm run test -- tests/crontime.test.ts`
- run a subset of test files with `npm run test -- <glob>`, for example `npm run test -- tests/*.test.ts`
- run a single test case with `npm run test -- -t '<test case name regex>'`, for example `npm run test -- -t 'should parse .*'`
- run in watch mode with `npm run test:watch` to automatically run a test case when you modify it or the associated source code (above tips also work with this command)

## Join The Project Team

This project is looking for help! If you're interested in helping with the project on a regular basis, please reach out to us on the [Discord community](https://discord.gg/yyKns29zch).

## Attribution <!-- omit in toc -->

This guide is based on the [**contributing-gen**](https://github.com/bttger/contributing-gen) and [**semantic-release**'s `CONTRIBUTING.md`](https://github.com/semantic-release/semantic-release/blob/master/CONTRIBUTING.md).
