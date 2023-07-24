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
