TESTS = tests/*.js

all: test

test:
	npm install .
	@./node_modules/jest/bin/jest.js \
		$(TESTS)

.PHONY: test
