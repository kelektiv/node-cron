## [3.0.0-beta.8](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2023-09-26)


### ✨ Features

* expose useful types ([6a1816d](https://github.com/kelektiv/node-cron/commit/6a1816dcefdfa456f1dc8ac744a32e8d879194a6))

## [3.0.0-beta.7](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2023-09-26)


### 📚 Documentation

* **readme:** remove outdated informations ([#695](https://github.com/kelektiv/node-cron/issues/695)) ([51d2bab](https://github.com/kelektiv/node-cron/commit/51d2bab4f1e6a0419f6592efbfdf72f17fa2fb07))

## [3.0.0-beta.6](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2023-09-26)


### ⚠ Breaking changes

* removed `cron.job()` method in favor of `new CronJob(...args)` /
`CronJob.from(argsObject)`
* removed `cron.time()` method in favor of `new CronTime()`
* `CronJob`: constructor no longer accepts an object as its first and
only params. Use `CronJob.from(argsObject)` instead.
* `CronJob`: callbacks are now called in the order they were registered

### 📦 Code Refactoring

* migrate to TypeScript ([#694](https://github.com/kelektiv/node-cron/issues/694)) ([97a65e1](https://github.com/kelektiv/node-cron/commit/97a65e109d473cb037e2fb4690c18ac897d5316a))

## [3.0.0-beta.5](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2023-09-25)


### 🐛 Bug Fixes

* added fractional offset support ([#685](https://github.com/kelektiv/node-cron/issues/685)) ([ce78478](https://github.com/kelektiv/node-cron/commit/ce784784575b65bd75b8b1a4adda3d8fd42fe1c0))

## [2.4.4](https://github.com/kelektiv/node-cron/compare/v2.4.3...v2.4.4) (2023-09-25)


### 🐛 Bug Fixes

* added fractional offset support ([#685](https://github.com/kelektiv/node-cron/issues/685)) ([ce78478](https://github.com/kelektiv/node-cron/commit/ce784784575b65bd75b8b1a4adda3d8fd42fe1c0))

## [3.0.0-beta.4](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2023-09-10)


* **deps:** update dependency luxon to v3.3.0 & add [@types](https://github.com/types)/luxon ([#689](https://github.com/kelektiv/node-cron/issues/689)) ([c95a449](https://github.com/kelektiv/node-cron/commit/c95a449121e440b82d391fc11f8dc148748f93ec)), closes [#688](https://github.com/kelektiv/node-cron/issues/688)
* fix range parsing when upper limit = 0 ([#687](https://github.com/kelektiv/node-cron/issues/687)) ([d96746f](https://github.com/kelektiv/node-cron/commit/d96746f7b8f357e565d1fad48c9f70d3d646da64))


### 🚨 Tests

* add TS types check ([#690](https://github.com/kelektiv/node-cron/issues/690)) ([f046016](https://github.com/kelektiv/node-cron/commit/f046016dc64438c4a12a4615a919b046d3a846de))

## [2.4.3](https://github.com/kelektiv/node-cron/compare/v2.4.2...v2.4.3) (2023-08-26)


### 🐛 Bug Fixes

* fix range parsing when upper limit = 0 ([#687](https://github.com/kelektiv/node-cron/issues/687)) ([d96746f](https://github.com/kelektiv/node-cron/commit/d96746f7b8f357e565d1fad48c9f70d3d646da64))


### 🚨 Tests

* add TS types check ([#690](https://github.com/kelektiv/node-cron/issues/690)) ([f046016](https://github.com/kelektiv/node-cron/commit/f046016dc64438c4a12a4615a919b046d3a846de))

## [2.4.2](https://github.com/kelektiv/node-cron/compare/v2.4.1...v2.4.2) (2023-08-26)


### 🐛 Bug Fixes

* **deps:** update dependency luxon to v3.3.0 & add [@types](https://github.com/types)/luxon ([#689](https://github.com/kelektiv/node-cron/issues/689)) ([c95a449](https://github.com/kelektiv/node-cron/commit/c95a449121e440b82d391fc11f8dc148748f93ec)), closes [#688](https://github.com/kelektiv/node-cron/issues/688)

## [3.0.0-beta.3](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2023-08-15)


### ⚠ Breaking changes

* return empty array from nextDates when called without argument (#519)

### 🐛 Bug Fixes

* return empty array from nextDates when called without argument ([#519](https://github.com/kelektiv/node-cron/issues/519)) ([e65c3dc](https://github.com/kelektiv/node-cron/commit/e65c3dc6c334b8d4df0da317b75494d78cd5d52b))

## [3.0.0-beta.2](https://github.com/kelektiv/node-cron/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2023-08-15)


### 🐛 Bug Fixes

* replace loop timeout by max match date ([#686](https://github.com/kelektiv/node-cron/issues/686)) ([c685c63](https://github.com/kelektiv/node-cron/commit/c685c63a6d7fa86d6c8afca29b536b9da24e824b))


### 🚨 Tests

* update new test for cron standard alignments ([ea56fc1](https://github.com/kelektiv/node-cron/commit/ea56fc1c32905d711b160823fc09f39169dd3efd))


### ⚙️ Continuous Integrations

* **renovate:** configure renovate ([#683](https://github.com/kelektiv/node-cron/issues/683)) ([9dbe962](https://github.com/kelektiv/node-cron/commit/9dbe962fad1c8b1b020441bce84ab91b1a7b4415))

## [2.4.1](https://github.com/kelektiv/node-cron/compare/v2.4.0...v2.4.1) (2023-08-14)


### 🐛 Bug Fixes

* replace loop timeout by max match date ([#686](https://github.com/kelektiv/node-cron/issues/686)) ([c685c63](https://github.com/kelektiv/node-cron/commit/c685c63a6d7fa86d6c8afca29b536b9da24e824b))


### ⚙️ Continuous Integrations

* **renovate:** configure renovate ([#683](https://github.com/kelektiv/node-cron/issues/683)) ([9dbe962](https://github.com/kelektiv/node-cron/commit/9dbe962fad1c8b1b020441bce84ab91b1a7b4415))

## [2.4.0](https://github.com/kelektiv/node-cron/compare/v2.3.0...v2.4.0) (2023-07-24)


### ✨ Features

* import type definitions from [@types](https://github.com/types)/cron ([d8a2f14](https://github.com/kelektiv/node-cron/commit/d8a2f140b59f063897dd20b7bb4dc7f599d2435b))


### 🐛 Bug Fixes

* don't start job in setTime if it wasn't running ([7e26c23](https://github.com/kelektiv/node-cron/commit/7e26c23e06277bfeb04525c71b67703392dbb8b2))


### 🛠 Builds

* **npm:** ship type definitions with releases ([0b663a8](https://github.com/kelektiv/node-cron/commit/0b663a8584f87cbec63042a4c217f43f38869fc4))


### 🚨 Tests

* add test case for [#598](https://github.com/kelektiv/node-cron/issues/598) fix ([4322ef2](https://github.com/kelektiv/node-cron/commit/4322ef29fa8af201aed5cdf8b829d411311fe025))
* don't stop/start job before using setTime ([f0d5d3f](https://github.com/kelektiv/node-cron/commit/f0d5d3f32eddb8fd77b84438fe471fd374b34566))


### ⚙️ Continuous Integrations

* add support for beta & maintenance releases ([#677](https://github.com/kelektiv/node-cron/issues/677)) ([c6fc842](https://github.com/kelektiv/node-cron/commit/c6fc8429e905b38b05ba428e0df4a0fea273614a))
* setup conventional commits & release automation ([#673](https://github.com/kelektiv/node-cron/issues/673)) ([c6f39ff](https://github.com/kelektiv/node-cron/commit/c6f39ff384041b7f91566fc935a9b961d453dd14))


### ♻️ Chores

* update default branch name ([#678](https://github.com/kelektiv/node-cron/issues/678)) ([7471e95](https://github.com/kelektiv/node-cron/commit/7471e95cb7433b4f29cfa68da0a652ec8cf630b6))
* wrap setTime tests in describe and move down ([31989e0](https://github.com/kelektiv/node-cron/commit/31989e06f939bf1e9dbc6c0b6fc62c0a7144b9eb))

## [3.0.0-beta.1](https://github.com/kelektiv/node-cron/compare/v2.3.1...v3.0.0-beta.1) (2023-07-23)


### ⚠ Breaking changes

* UNIX standard alignments (#667)

### ✨ Features

* UNIX standard alignments ([#667](https://github.com/kelektiv/node-cron/issues/667)) ([96ef954](https://github.com/kelektiv/node-cron/commit/96ef954998f9c109cc2a969296568b1b56bbbd79))

## [v2.3.1](https://github.com/kelektiv/node-cron/compare/v2.3.0...v2.3.1) (2023-05-25)

### Added

- Logo!
- New test cases

### Fixed

- Linting issues

## [v2.3.0](https://github.com/kelektiv/node-cron/compare/v2.2.0...v2.3.0) (2023-03-14)

### Fixed

- Some small bugs

### Changed

- Refactored get next date function

## [v2.2.0](https://github.com/kelektiv/node-cron/compare/v2.1.0...v2.2.0) (2023-01-09)

### Changed

- Updated Luxon dependency
- Updated unit tests to be compatible with new Luxon version

## [v2.1.0](https://github.com/kelektiv/node-cron/compare/v2.0.0...v2.1.0) (2022-07-14)

### Changed

- "Maximum iterations" will direct the user to refer to a single canonical issue instead of creating a new one

## [v2.0.0](https://github.com/kelektiv/node-cron/compare/v1.8.2...v2.0.0) (2022-05-03)
- Upgrade vulnerable dependencies
- Move from moment.js to luxon (breaking change)

## [v1.8.2](https://github.com/kelektiv/node-cron/compare/v1.8.1...v1.8.2) (2020-01-24)
- Fix syntax parsing bug

## [v1.8.1](https://github.com/kelektiv/node-cron/compare/v1.8.0...v1.8.1) (2020-01-19)
- Revert TS definition defaulting to DefinitelyTyped definitions.

## [v1.8.0](https://github.com/kelektiv/node-cron/compare/v1.7.1...v1.8.0) (2020-01-19)
- GH-454 - Range upper limit should default to highest value when step is provided by Noah May <noahmouse2011@gmail.com> in d36dc9581f9f68580a2016b368f8002a9f1e357d

## [v1.7.1](https://github.com/kelektiv/node-cron/compare/v1.7.0...v1.7.1) (2019-04-26)
- GH-416 - Fix issue where next execution time is incorrect in some cases in Naoya Inada <naoina@kuune.org> in c08522ff80b3987843e9930c307b76d5fe38b5dc

## [v1.7.0](https://github.com/kelektiv/node-cron/compare/v1.6.0...v1.7.0) (2019-03-19)
- GH-408 - DST issue by Shua Talansky <shua@bitbean.com> in 1e971fd6dfa6ba4b0469d99dd64e6c31189d17d3 and 849a2467d16216a9dfa818c57cc26be6b6d0899b

## [v1.6.0](https://github.com/kelektiv/node-cron/compare/v1.5.1...v1.6.0) (2018-11-15)
- GH-393, GH-394 - Remove hard limit on max iters in favor of a timeout by Nick Campbell <nicholas.j.campbell@gmail.com> in 57632b0c06c56e82f40b740b8d7986be43842735
- GH-390 - better handling of real dates which are in the past by Nick Campbell <nicholas.j.campbell@gmail.com> in 7cbcc984aea6ec063e38829f68eb9bc0dfb1c775
