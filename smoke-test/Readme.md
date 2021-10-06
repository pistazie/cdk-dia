# Smoke test 

This smoke test performs a full build of CDK-Dia and publishes it to a local NPM registry. It then creates AWS-CDK test-case projects, installs CDK-Dia, generates a diagram and asserts basics (PNG generated, file size looking OK)

The tests are performed in the test.yml GitHub action

## Running locally
You can run the smoke tests locally using [act](https://github.com/nektos/act)