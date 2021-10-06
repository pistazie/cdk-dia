#!/bin/bash
set -e

# Prepare a sample AWS-CDK project with CDK-Dia installed
prepareCdkProject(){
  TEST_CDK_PROJ_PATH=$1
  INSTALL_CDK_DIA_GLOBALLY=$2

  echo "bootsrtapping a new AWS-CDK project at ${TEST_CDK_PROJ_PATH}"
  mkdir -p $TEST_CDK_PROJ_PATH
  cd $TEST_CDK_PROJ_PATH
  cdk init sample-app --language typescript

  echo "installing CDK-Dia from local registry"
  if [[ "$INSTALL_CDK_DIA_GLOBALLY" == "true" ]]
    then npm install cdk-dia@9.9.${GITHUB_RUN_NUMBER} --registry http://localhost:4873 -g
    else npm install cdk-dia@9.9.${GITHUB_RUN_NUMBER} --registry http://localhost:4873
  fi
}

# Assert diagram generated as expected
executeSmokeTestAssertions() {
  DIAGRAMS_PATH=$1

  TEST_SUITE_PATH=$GITHUB_WORKSPACE/smoke-test
  export SMOKE_TEST_BASE_PATH=$DIAGRAMS_PATH # used by the following Jest test suite
  cd $TEST_SUITE_PATH
  npm i
  npm run test
}

# Execute smoke test-case
smokeTest() {
  CDK_DIA_INSTALL_GLOBALLY=$1
  CDK_DIA_COMMAND=$2

  TEST_CASE_CDK_PROJ_PATH="${GITHUB_WORKSPACE}/smoke-test-cases/cdk_${RANDOM}"
  prepareCdkProject $TEST_CASE_CDK_PROJ_PATH $CDK_DIA_INSTALL_GLOBALLY
  cd $TEST_CASE_CDK_PROJ_PATH
  cdk synth # synthesize
  $CDK_DIA_COMMAND # generate PNG using Cdk-Dia
  executeSmokeTestAssertions $(pwd) # assert PNG as expected
}

# install smoke test dependencies
sudo apt install graphviz -y
npm install -g typescript aws-cdk verdaccio
verdaccio --config ./smoke-test/smoke-test-npm-local-repo-config.yml &

# publish CDK-Dia to a locally running NPM registry for testing
npm run prepare-dist
cd dist
npm version 9.9.${GITHUB_RUN_NUMBER} --commit-hooks false --git-tag-version false
npm publish --registry http://localhost:4873

# Perform Tests Cases
smokeTest false ./node_modules/.bin/cdk-dia # install in a project
smokeTest true cdk-dia # install globally
