#!/usr/bin/env node
import chalk from "chalk"
import yargs from "yargs/yargs"
import * as path from "path"
import {CdkDia, Renderers} from "../src/cdk-dia"
import * as rendering from "../src/render/index"

async function initCli(): Promise<cdkDiaCliArgs> {

    return yargs(process.argv.slice(2)).options({
        'cdk-tree-path': {type: 'string', alias: 'tree', default: 'cdk.out/tree.json', describe: 'Path of synthesized CDK cloud assembly'},
        'target-path': {type: 'string', alias: 'target', default: 'diagram.png', describe: 'Target path for rendered PNG'},
        'collapse': {type: 'boolean', default: true, describe: 'Collapse CDK constructs'},
        'collapse-double-clusters': {type: 'boolean', default: true, describe: 'Collapse CDK constructs with one child that is a cluster itself'},
        'include': {type: 'array', describe: 'Stacks to include (if not specified all stacks are diagramed)', alias: 'stacks'},
        'exclude': {type: 'array', describe: 'Stacks to exclude'},
        'rendering': {type: 'string', choices:[ Renderers.GRAPHVIZ, Renderers.CYTOSCAPE],default: Renderers.GRAPHVIZ, describe: 'The rendering engine to use'}
    }).version(false).argv
}

async function generateDiagram(args: cdkDiaCliArgs) {

    const cdkDia = new CdkDia()

    let includedStacks: string[] | false = false
    if (args.include !== undefined) {
        includedStacks = args.include.map(it => it.toString())
    }

    let excludedStacks: string[] | undefined = undefined
    if (args.exclude !== undefined) {
        excludedStacks = args.exclude.map(it => it.toString())
    }

    const packageBasePath = path.dirname(require.resolve('../../package.json'))

    cdkDia.generateDiagram(args["cdk-tree-path"], args["target-path"], args.collapse, args["collapse-double-clusters"], packageBasePath, includedStacks, excludedStacks, args["rendering"])
        .then((output) => output.userOutput())
        .catch(e => {
            console.error(`Failed to generate diagram - ${e}`)
            throw e
        })
}

function printError(e) {
    if (e instanceof rendering.RenderingError) {
        notifyRenderingError(e)
    } else {
        notifyRenderingError(new rendering.RenderingError(`Unexpected error occurred: ${e.message}`))
    }
}

function notifyRenderingError(e: rendering.RenderingError) {
    console.log(`${chalk.red.bold(`Failed to render diagram: ${e.message}`)}`)

    if (e.fixTips.length > 0)
        console.log(`${chalk.underline(`What could you try?`)}`)

    e.fixTips.forEach(tip => {
        console.log(`\t${tip}`)
    })
}

initCli()
    .then(args => {
        generateDiagram(args)
            .catch(printError)
    })
    .catch(printError)

interface cdkDiaCliArgs {
    'cdk-tree-path': string,
    'target-path': string,
    collapse: boolean,
    'collapse-double-clusters': boolean,
    include: (string | number)[] | undefined,
    exclude: (string | number)[] | undefined,
    rendering: Renderers
}