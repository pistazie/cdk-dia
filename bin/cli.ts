#!/usr/bin/env node
import chalk from "chalk"
import terminalLink from "terminal-link"
import yargs from "yargs/yargs"
import * as path from "path"
import {RenderingError} from "../src/graphviz"
import {CdkDia} from "../src/cdk-dia"

async function initCli(): Promise<cdkDiaCliArgs> {

    return yargs(process.argv.slice(2)).options({
        'cdk-tree-path': {type: 'string', alias: 'tree', default: 'cdk.out/tree.json', describe: 'Path of synthesized cdk cloud assembly'},
        'target-path': {type: 'string', alias: 'target', default: 'diagram.png', describe: 'Target path for rendered PNG'},
        'collapse': {type: 'boolean', default: true, describe: 'Collapse CDK Constructs'},
        'stacks': {type: 'array', describe: 'Stacks to include (if not specified all stacks are diagramed)'}
    }).version(false).argv
}

async function generateDiagram(args: cdkDiaCliArgs) {

    const cdkDia = new CdkDia()

    let includedStacks: string[] | false = false
    if (args.stacks !== undefined) {
        includedStacks = args.stacks.map( it => it.toString())
    }

    const packageBasePath = path.dirname(require.resolve('cdk-dia/package.json'))

    cdkDia.generateDiagram(args["cdk-tree-path"], args["target-path"], args.collapse, packageBasePath, includedStacks).then((pngFilename) => {
        if (terminalLink.isSupported)
            console.log(chalk.green(`CDK code diagram generated to PNG at ${chalk.bold(terminalLink(pngFilename, pngFilename))}`))
        else
            console.log(chalk.green(`CDK code diagram generated to PNG at ${chalk.bold(pngFilename)}`))
    }).catch(e => {
        throw e
    })
}

function printError(e) {
    if (e instanceof RenderingError) {
        notifyRenderingError(e)
    } else {
        console.log(e)
        notifyRenderingError(new RenderingError(`Unexpected error occurred: ${e.message}`))
    }
}

function notifyRenderingError(e: RenderingError) {
    console.log(e)
    console.log(`${chalk.red.bold(`Failed to render diagram: ${e.message}`)}`)

    if (e.fixTips.length > 0)
        console.log(`${chalk.underline(`What could you try?`)}`)

    e.fixTips.forEach(tip => {
        console.log(`\t${tip}`)
    })
}

initCli().then(args => {
    generateDiagram(args).catch(printError)
}).catch(printError)

interface cdkDiaCliArgs {
    'cdk-tree-path': string,
    'target-path': string,
    collapse: boolean,
    stacks: (string | number)[] | undefined
}