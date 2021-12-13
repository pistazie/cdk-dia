import * as fs from 'fs'
import chalk from "chalk"
import path, {dirname} from "path"
import * as diagram from "../../diagram"
import {DiagramRenderer, RenderingOutput} from "../diagram-renderer"
import {CytoscapeGenerator} from "./cytoscape-generator"

const ncp = require('ncp').ncp
ncp.limit = 8

export class CytoscapeJsOutput implements RenderingOutput {
    constructor(private staticFolderName: string, private staticSiteFullPath: string) {}

    userOutput(): void {
            console.log(chalk.green(`generated a static website with your diagram at ${this.staticSiteFullPath}' }`))
            console.log(chalk.green(`run 'npx http-server ${this.staticFolderName} -o' to view your interactive diagram`))
    }
}

interface CytoscapeProps{
    diagram: diagram.Diagram,
    path: string
}

export class Cytoscape implements DiagramRenderer {

    async render(props: CytoscapeProps): Promise<CytoscapeJsOutput> {
        const basePath = props.path.replace(/\.[^/.]+$/, "")

        let iconsPath: string
        if (__dirname.includes("dist")){
            iconsPath = dirname(dirname(dirname(dirname(__dirname))))
        } else {
            iconsPath = dirname(dirname(dirname(__dirname)))
        }

        await this.renderToCytoscape(props.diagram, basePath, iconsPath)
        return new CytoscapeJsOutput(path.basename(basePath) , path.resolve(basePath))
    }

    /**
     * Generates a static site at [targetFolder] with a Cytoscape diagram of a CDK-Dia diagram
     */
    private async renderToCytoscape(dia: diagram.Diagram, targetFolder: string, iconsPath: string) {

        // copy our Cytoscape base
        await this.copyFolder(__dirname + '/base', targetFolder)
        // copy icons
        await this.copyFolder(iconsPath + '/icons',  targetFolder+ '/icons')

        // generate and publish this diagram's Cytoscape data
        const [cyElements, cyStyles] = CytoscapeGenerator.generate(dia)
        fs.writeFileSync(`${targetFolder}/cy-elements.json`, JSON.stringify(cyElements))
        fs.writeFileSync(`${targetFolder}/cy-styles.json`, JSON.stringify(cyStyles))
    }

    private copyFolder(src: string, dst: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            ncp(src, dst, function (err) {
                    if (err) {
                        reject(err)
                    }
                    resolve(undefined);
                }
            )
        })
    }
}

