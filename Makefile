install:
	cp -f ./src/cron.js ~/.node_libraries/

uninstall:
	rm -Rf ~/.node_libraries/cron.js

.PHONY: install uninstall