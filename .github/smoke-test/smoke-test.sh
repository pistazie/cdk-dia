#!/bin/bash
set -e

npm install -g typescript aws-cdk verdaccio
npm install -g aws-cdk
sudo apt install graphviz
verdaccio --config smoke-test-npm-local-repo-config.yml &

npm run prepare-dist
npm version 9.9.${GITHUB_RUN_NUMBER} --commit-hooks false --git-tag-version false
npm publish --registry http://localhost:4873

# Use in a CDK project
mkdir package-smoke-test
cd package-smoke-test
cdk init sample-app --language typescript
npm install cdk-dia@9.9.${GITHUB_RUN_NUMBER} --registry http://localhost:4873

## Use CLI and test expected PNG
cdk synth
./node_modules/.bin/cdk-dia
export SMOKE_TEST_BASE_PATH=$(pwd)
cd $GITHUB_WORKSPACE/.github/smoke-test
npm i
npm run test

# Use as a globally installed package
mkdir package-smoke-test-global
cd package-smoke-test-global
cdk init sample-app --language typescript
npm install cdk-dia@9.9.${GITHUB_RUN_NUMBER} --registry http://localhost:4873 -g

# Use CLI and test expected PNG
cdk synth
cdk-dia
export SMOKE_TEST_BASE_PATH=$(pwd)
cd $GITHUB_WORKSPACE/.github/smoke-test
npm run test