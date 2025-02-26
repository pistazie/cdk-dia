import * as fs from 'fs'
import * as util from 'util'
import hasbin from 'hasbin'
import {toDot} from "ts-graphviz"
import childProcess from "child_process"
import chalk from "chalk"
import terminalLink from "terminal-link"

import sanitizeFilename from 'sanitize-filename'
const execFile = util.promisify(childProcess.execFile)

import * as diagram from "../../diagram"
import {DiagramRenderer, RenderingOutput, RenderingProps, RenderingError} from "../diagram-renderer"
import {GraphvizGenerator} from "./GraphvizGenerator"
import * as path from "path"



export class GraphvizRenderingProps extends RenderingProps {
    diagram: diagram.Diagram
    path: string
}

export class GraphvizRenderingOutput implements RenderingOutput {

    constructor(private imagePath: string, private imageType: string) {}

    userOutput(): void {
        if (terminalLink.isSupported)
            console.log(chalk.green(`CDK code diagram generated to ${this.imageType.toUpperCase()} at ${chalk.bold(terminalLink(this.imagePath, this.imagePath))}`))
        else
            console.log(chalk.green(`CDK code diagram generated to ${this.imageType.toUpperCase()} at ${chalk.bold(this.imagePath)}`))

    }
}

export class Graphviz implements DiagramRenderer {

    /*
     *  renders a `diagram.Diagram` to a png
     */
    async render(props: GraphvizRenderingProps): Promise<GraphvizRenderingOutput> {

        const basePath = props.path.replace(/\.[^/.]+$/, "")
        const targetDotPath = `${basePath}.dot`
        const targetPngPath = `${basePath}.png`

        this.renderToDot(props.diagram, targetDotPath)
        await Graphviz.generatePng(targetDotPath, targetPngPath)

        return new GraphvizRenderingOutput(targetPngPath, "png")
    }

    /*
     *  renders a `diagram.Diagram` to a dot file
     */
    renderToDot(dia: diagram.Diagram, targetDotPath: string): void {

        const graphRoot = new GraphvizGenerator().generate(dia)

        // generate Dot representation
        const dot = toDot(graphRoot)

        // save Dot to file
        fs.writeFileSync(targetDotPath, dot)
    }

    private static async generatePng(dotPath: string, targetPngPath: string): Promise<void> {

        try {
            await Graphviz.dotToPng(dotPath, targetPngPath)
        } catch (e) {

            if (!hasbin.sync(Graphviz.GRAPHVIZ_BINARY)) {
                throw new RenderingError("Graphvig '" + Graphviz.GRAPHVIZ_BINARY + "' binary does not exist locally or in PATH", [], [
                    "Install Graphviz and make sure it is available in PATH",
                    "Using brew: 'brew install graphviz'"])
            } else {
                if (e instanceof RenderingError) {
                    throw e
                } else {
                    throw new RenderingError(e.message)
                }
            }
        }
    }

    private static sanitizeAndResolvePath(dirty: string): string {
        return path.resolve(dirty.split(path.sep).map(it => {
            return sanitizeFilename(it)
        }).join(path.sep))
    }

    private static async dotToPng(sourceDotFile: string, targetPngFile: string) {
        const {stdout, stderr} = await execFile(Graphviz.GRAPHVIZ_BINARY, [
            Graphviz.sanitizeAndResolvePath(sourceDotFile),
            `-Tpng`,
            `>`,
            Graphviz.sanitizeAndResolvePath(targetPngFile)
        ])


        const fileExists = fs.existsSync(targetPngFile)
        if (!fileExists) {
            throw new RenderingError("Failed to generate PNG: file does not exist.")
        }

        const stats = fs.lstatSync(targetPngFile)
        if (stats.size < 2) {
            throw new RenderingError("Generated PNG doesn't seem valid: file size is too small.",
                [stdout, stderr],
                [". make sure Graphviz is installed and available in the PATH"])
        }
    }

    private static GRAPHVIZ_BINARY = "dot"
}

