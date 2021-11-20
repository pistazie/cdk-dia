# Contributing to CDK-Dia

🙏🏽 Thank you for investing your time in contributing to CDK-Dia!

**Contributing to CDK-Dia is subject to the Contributor Covenant [code of conduct](./CODE_OF_CONDUCT.md)**

## Development - Technical aspects

### Local development setup
To start developing CDK-Dia locally follow these steps:
* fork CDK-Dia
* locally clone your forked repository.
* `npm install`

You are now ready to make CDK-Dia better, run `npm run test` to make sure you are ready to go.

### Testing

Please write tests for any feature you contribute. 

When creating a pull request GitHub actions will run the tests for you. You can also run the test suites locally to assure your Changeset passes.

#### CDK-Dia is covered by two test suites

###### Jest Unit/Snapshot/Integrative test
These tests provide most of the test coverage. Please add relevant tests for your contribution. run the tests using `npm run test`

###### NPM package smoke tests
Additionally to the above tests the smoke test packages CDK-Dia as a local NPM package and uses it in two sample project scenarios. The test assert a diagram.png was well generated.

If you want to run these tests manually follow the directions [here](./smoke-test/README.md)
