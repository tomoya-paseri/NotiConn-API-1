.PHONY: offline
offline:
	yarn sls offline start

.PHONY: deploy-dev
deploy-dev:
	yarn sls deploy

.PHONY: deploy-prd
deploy-prd:
	yarn sls deploy --stage=prd

.PHONY: remove
remove:
	yarn sls remove

.PHONY: save-local
save-local:
	yarn sls invoke local --function save
