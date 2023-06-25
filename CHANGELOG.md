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
