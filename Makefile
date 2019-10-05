.PHONY: offline
offline:
	yarn sls offline start

.PHONY: deploy-dev
deploy-dev:
	yarn sls deploy --aws-profile noticonn

.PHONY: deploy-prd
deploy-prd:
	yarn sls deploy --aws-profile noticonn --stage=prd

.PHONY: remove
remove:
	yarn sls remove --aws-profile noticonn

.PHONY: save-local
save-local:
	yarn sls invoke local --function save
