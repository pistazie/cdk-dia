![Test](https://github.com/pistazie/cdk-dia/workflows/Test/badge.svg)
[![npm version](https://badge.fury.io/js/cdk-dia.svg)](https://badge.fury.io/js/cdk-dia)

# 🎡 CDK-Dia - Automated diagrams for CDK infrastructure

_Cdk-dia diagrams your CDK provisioned infrastructure using the Grpahviz dot lanuguage._

## Example

This Diagram was automatically generated from an AWS CDK stack

<p align="center">
    <img width="500" height="auto" src="docs/diagram.png" />
</p>

## Getting started
Add cdk-dia to your CDK project
```sh
$ npm install cdk-dia
```

Install Graphviz
```sh
$ brew install graphviz
```
* If you don't use brew: Graphviz installation in many environments is [well documented](https://graphviz.org/download/).
* make sure Graphviz's dot binary is available in your PATH.
  
Synthesize your CDK application
```sh
$ cdk synth
```

Generate a CDK-DIA diagram
```sh
$ npx cdk-dia
```
<br/>

## CLI arguments
```npx cdk-dia --help``` - Get possible arguments
