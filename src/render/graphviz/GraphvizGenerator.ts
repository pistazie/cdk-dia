import {digraph, RootGraphModel, SubgraphModel} from "ts-graphviz"
import * as diagram from "../../diagram"
import * as styling from "./styling"
import * as _ from "lodash"
import wrap from "word-wrap"

export class GraphvizGenerator {

    /**
     * Generates a ts-graphviz repersentation of a Diagram
     */
    generate(dia: diagram.Diagram): RootGraphModel{

        const rootGraph = digraph('Diagram')
        styling.applyBaseGraphStyling(rootGraph)

        this.diagramGraph(rootGraph, dia)
        return rootGraph
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

    private diagramGraph(rootGraph: RootGraphModel, diagram1: diagram.Diagram) {

        const root: SubgraphModel = rootGraph.createSubgraph(diagram1.root.id)

        this.addToGraph(root, diagram1.root)

        this.addEdges(rootGraph, diagram1.root)
    }

    private addToGraph(g: SubgraphModel, node: diagram.Component) {

        const labelFontSize = 12
        const charsPerLine = labelFontSize * 1.8

        if (node.subComponents().length > 0) { // sub graph with a frame

            const subGraph = g.createSubgraph(`cluster-SubGraph.${node.label}`)

            subGraph.attributes.graph.set("label", node.label.join(" "))

            styling.applyClusterStyling(subGraph, node.depth())


            node.subComponents().forEach(sub => this.addToGraph(subGraph, sub))

        } else {
            const gnode = g.createNode(node.id)

            const labelLines = this.breakLineEveryMaxChars(node.label, charsPerLine)
            gnode.attributes.set("label", labelLines.join("\n"))

            styling.applyBasicNodeStyling(gnode, labelFontSize)

            if (node.icon != null && node.icon.path != null) {
                styling.applyNodeWithIconStyling(gnode, node.icon, labelFontSize, labelLines.length)
            }
        }
    }

    private addEdges(g: RootGraphModel, node: diagram.Component) {

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

}