push-patch:
	npm version patch && npm publish

push-minor:
	npm version minor && npm publish

push-major:
	npm version major && npm publish
