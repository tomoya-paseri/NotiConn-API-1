.PHONY: offline
offline:
	yarn sls offline start

.PHONY: deploy
deploy:
	yarn sls deploy --aws-profile noticonn

.PHONY: remove
remove:
	yarn sls remove --aws-profile noticonn
