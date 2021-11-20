# Smoke test 

This smoke test performs a full build of CDK-Dia and publishes it to a local NPM registry. It then creates AWS-CDK test-case projects, installs CDK-Dia, generates a diagram and asserts basics (PNG generated, file size looking OK).

The tests are performed as part of the test.yml GitHub action.

## Running locally
You can run the smoke tests locally using [act](https://github.com/nektos/act). As CDK-Dia requires Graphviz one has to use the full Ubuntu image (~18GB). 

```
    brew install act
    act -j test --privileged -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest --bind
```
* This command will locally run the entire GitHub action (incl. Jest tests)