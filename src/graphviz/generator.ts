import * as diagram from "../diagram"

import * as fs from 'fs'
import * as util from 'util'
import * as _ from 'lodash'
import * as hasbin from 'hasbin'
import wrap from "word-wrap"
import childProcess from "child_process"

import {digraph, Graph, ISubgraph, toDot} from "ts-graphviz"

import {ColorPalette, setBaseGraphAttributes} from "./styling"
import {ComponentIconFormat} from "../diagram/component/icon"
import {RenderingError} from "./rendering-error"

const exec = util.promisify(childProcess.exec)

export class Generator {

    private readonly rootGraph: Graph

    constructor(dia: diagram.Diagram) {

        this.rootGraph = digraph('Diagram')

        setBaseGraphAttributes(this.rootGraph)
        this.diagramGraph(dia)
    }
    async generatePng(path: string) : Promise<string>{

        const dotFileName = this.generateDot(path)

        try {
            await this.dotToPng(dotFileName, path)
        } catch (e) {

            if (!hasbin.sync(Generator.graphvizBinary)){
                throw new RenderingError("Graphvig '"+Generator.graphvizBinary+"' binary does not exist locally or in PATH",[],[
                    "Install Graphviz and make sure it is available in PATH",
                    "Using brew: 'brew install graphviz'"
                ])
            }
            else {
                if (e instanceof RenderingError) {
                    throw e
                } else {
                    throw new RenderingError(e.message)
                }
            }
        }

        return path
    }

    generateDot(path: string) : string {
        const data = toDot(this.rootGraph)
        const fullPath = `${path}.dot`
        fs.writeFileSync(fullPath, data)
        return fullPath
    }

    private breakLineEveryMaxChars(label: string[], charsPerLine: number): string[] {

        let fullWords: string[]
        if (label == undefined)
            fullWords = [""]
        else
            fullWords = _.flatten(label.map(part => {return _.replace(part, /\n/g, "").split(" ")}))

        let words = this.wordsToLabel(fullWords, charsPerLine).filter( word => { return word.trim().length >0 })

        if (words.length == 0){
            const fullWords2: string[] = _.flatten(label.map(part => {return _.replace(part, /[\n\-_\s:]/g, " ").split(" ")}))

            words = fullWords2.map( word => { return word.substr(0,charsPerLine) })
        }

        const lines: string[] = []
        let curLine = ""

        while (words.length > 0) {
            if ((curLine + " " + words[0]).length <= charsPerLine) { // fits with current words
                curLine += " " + words[0]
            } else {
                if (words[0].length >= charsPerLine) { // doesn't fit in one line -> simply put it in one line!
                    lines.push(curLine)
                    curLine = ""
                    lines.push(words[0])
                } else { // start new line
                    lines.push(curLine)
                    curLine = words[0]
                }
            }
            words = words.slice(1)
        }

        if (curLine.length > 0) lines.push(curLine)

        return lines
    }

    private wordsToLabel(fullWords: string[], charsPerLine: number) {
        const words: string[] = []
        fullWords.forEach(word => {

            if (word.length <= charsPerLine) {
                words.push(word)
            } else {
                const wrapped = wrap(word, {
                    cut: true,
                    width: charsPerLine
                }).trim()
                wrapped.split("\n").forEach(shortWord => words.push(shortWord))
            }
        })
        return words
    }

    private diagramGraph(d: diagram.Diagram) {

        const root = this.rootGraph.createSubgraph(d.root.id)

        this.addToGraph(root, d.root)

        this.addEdges(this.rootGraph, d.root)
    }

    private addToGraph(g: ISubgraph, node: diagram.Component) {

        const baseImgSize = 2
        const labelFontSize = 12
        const charsPerLine = labelFontSize * 1.8

        if (node.subComponents().length > 0) { // sub graph with a frame

            const subGraph = g.createSubgraph(`cluster-SubGraph.${node.label}`)

            subGraph.attributes.graph.set("label", node.label.join(" "))

            subGraph.attributes.graph.set("labelloc", "b")
            subGraph.attributes.graph.set("labeljust", "l")
            subGraph.attributes.graph.set("margin", "10")
            subGraph.attributes.graph.set("fontsize", "16")
            //subGraph.attributes.edge.set("constraint", "false")
            subGraph.attributes.graph.set("penwidth", "2")
            subGraph.attributes.graph.set("pencolor", "#888888")
            subGraph.attributes.graph.set("style", "filled,rounded")
            subGraph.attributes.graph.set("fillcolor", ColorPalette.byInd(node.depth()))

            node.subComponents().forEach(sub => this.addToGraph(subGraph, sub))

        } else {
            const gnode = g.createNode(node.id)

            const labelLines = this.breakLineEveryMaxChars(node.label, charsPerLine)
            gnode.attributes.set("label", labelLines.join("\n"))
            gnode.attributes.set("fontsize", labelFontSize)

            if (node.icon != null && node.icon.path != null) {
                gnode.attributes.set("image", node.icon.path)
                gnode.attributes.set("imagescale", "true")
                gnode.attributes.set("imagepos", "tc")
                gnode.attributes.set("penwidth", "0")
                gnode.attributes.set("shape", "node")
                gnode.attributes.set("fixedsize", "true")
                gnode.attributes.set("labelloc", "b")

                if (node.icon.format == ComponentIconFormat.NORMAL) {
                    gnode.attributes.set("width", baseImgSize)
                    gnode.attributes.set("height", baseImgSize + 0.05 + (labelLines.length * 0.018 * labelFontSize))
                } else {
                    const ratio = 0.60
                    gnode.attributes.set("width", baseImgSize * ratio)
                    gnode.attributes.set("height", (baseImgSize * ratio) + 0.05 + (labelLines.length * 0.018 * labelFontSize))
                }
            }
        }
    }

    private addEdges(g: Graph, node: diagram.Component) {

        node.links.getLinkedComponents().forEach(edgeNode => {

            // connects Stack with each other
            if (node.depth() == 1 && edgeNode.depth() ==1) {

                /**
                 * Workaround in order to create an edge between two subgraphs.
                 * connect 2 arbitrary nodes inside each subgraph and declare subgraphs IDs in ltail and lhead attributes
                 *
                 * @see https://stackoverflow.com/questions/2012036/graphviz-how-to-connect-subgraphs
                 */
                const nodeArbitraryChild = this.findFirstArbitraryClusterDirectLeaf(node)
                const edgeNodeArbitraryChild = this.findFirstArbitraryClusterDirectLeaf(edgeNode)
                if (nodeArbitraryChild !== undefined && edgeNodeArbitraryChild !== undefined ) {
                    g.createEdge([nodeArbitraryChild.id, edgeNodeArbitraryChild.id], {
                        dir: "both",
                        ltail: `cluster-SubGraph.${node.id}`,
                        lhead: `cluster-SubGraph.${edgeNode.id}`,
                        color: "black",
                        penwidth: 1
                    })
                }
            }else {
                // normal node/Component edge
                g.createEdge([node.id, edgeNode.id], {dir: "both"})
            }
        })

        node.subComponents().forEach(sub => {
            this.addEdges(g, sub)
        })
    }

    private findFirstArbitraryClusterDirectLeaf(node: diagram.Component): diagram.Component | undefined{
        return  node.subComponents().find( sub => { return sub.subComponents().length == 0 })
    }

    private async dotToPng(sourceDotFile: string, targetPngFile: string,) {

        const cmd = `${Generator.graphvizBinary} ${sourceDotFile} -T png > ${targetPngFile}`

        try {
            const {stdout, stderr} = await exec(cmd);

            const fileExists = fs.existsSync(targetPngFile)
            if (!fileExists){
                throw new RenderingError("Failed to generate PNG: file does not exist.")
            }

            const stats = fs.lstatSync(targetPngFile)
            if (stats.size < 2){
                throw new RenderingError("Generated PNG doesn't seem valid: file size is too small.",
                    [stdout,stderr],
                    [". make sure Graphviz is installed and available in the PATH"])
            }
        } catch (e){
            throw new RenderingError(e.message)
        }

        return true
    }

    private static graphvizBinary = "dot"
}

