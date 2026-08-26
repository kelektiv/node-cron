import {
	assertExclusiveTimeZoneAndUtcOffset,
	ExclusiveParametersError
} from '../src/errors';

describe('assertExclusiveTimeZoneAndUtcOffset', () => {
	it('should throw an ExclusiveParametersError when both timeZone and utcOffset are provided', () => {
		expect(() => {
			assertExclusiveTimeZoneAndUtcOffset('America/Chicago', 120);
		}).toThrow(ExclusiveParametersError);
	});

	it('should not throw when only timeZone is provided', () => {
		expect(() => {
			assertExclusiveTimeZoneAndUtcOffset('America/Chicago', null);
		}).not.toThrow();
	});

	it('should not throw when only utcOffset is provided', () => {
		expect(() => {
			assertExclusiveTimeZoneAndUtcOffset(null, 120);
		}).not.toThrow();
	});

	it('should not throw when neither timeZone nor utcOffset is provided', () => {
		expect(() => {
			assertExclusiveTimeZoneAndUtcOffset(null, null);
		}).not.toThrow();
	});

	it('should not throw when both are omitted (undefined)', () => {
		expect(() => {
			assertExclusiveTimeZoneAndUtcOffset();
		}).not.toThrow();
	});
});
