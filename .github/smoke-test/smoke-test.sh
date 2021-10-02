nope
echo "Exit code '$?'"
npm install -g verdaccio
verdaccio --config smoke-test-npm-local-repo-config.yml &
nope
npm run prepare-dist
npm version 9.9.${GITHUB_RUN_NUMBER} --commit-hooks false --git-tag-version false
npm publish --registry http://localhost:4873

# Use in a CDK project
npm install -g typescript
npm install -g aws-cdk
sudo apt install graphviz
mkdir package-smoke-test
cd package-smoke-test
cdk init sample-app --language typescript
npm install cdk-dia@9.9.${GITHUB_RUN_NUMBER} --registry http://localhost:4873

## Use CLI and test expected PNG
cdk synth
./node_modules/.bin/cdk-dia
ls -la
SMOKE_TEST_BASE_PATH=$(pwd)
cd ../.github/smoke-test
npm i
npm run test

# Use as a globally installed package
npm install -g typescript
npm install -g aws-cdk

sudo apt install graphviz
mkdir package-smoke-test-global
cd package-smoke-test-global
cdk init sample-app --language typescript

# Use CLI and test expected PNG
cdk synth
cdk-dia
ls -la
SMOKE_TEST_BASE_PATH=$(pwd)
cd ../.github/smoke-test
npm i
npm run test