import {NodeModel, RootGraphModel, SubgraphModel} from "ts-graphviz"
import {ComponentIcon, ComponentIconFormat} from "../../diagram/component/icon"
import {ColorPalette} from "../styling"

export function applyBaseGraphStyling(graph: RootGraphModel): void {

    // Graph
    graph.set("splines", "ortho")
    graph.set("pad", 1.0)
    graph.set("nodesep", 0.60)
    graph.set("ranksep", 0.75)
    graph.set("fontname", "Sans-Serif")
    graph.set("fontsize", 15)
    graph.set("dpi", 200)
    graph.set("rankdir", "BT")
    graph.set("compound", true)
    graph.set("fontcolor", "#222222")

    // nodes
    graph.attributes.node.set("shape", "box")
    graph.attributes.node.set("style", "rounded")
    graph.attributes.node.set("fixedsize", true)
    graph.attributes.node.set("width", 1.7)
    graph.attributes.node.set("height", 1.7)
    graph.attributes.node.set("labelloc", "c") // was b
    graph.attributes.node.set("imagescale", true)
    graph.attributes.node.set("fontname", "Sans-Serif")
    graph.attributes.node.set("fontsize", 8)
    graph.attributes.node.set("margin", 8)

    // edges
    graph.attributes.edge.set("color", "#D5871488")
    graph.attributes.edge.set("penwidth", 2.0)
    graph.attributes.edge.set("arrowhead", "dot")
    graph.attributes.edge.set("arrowtail", "dot")
}

export function applyClusterStyling(subGraph: SubgraphModel, depth: number): void {

    subGraph.attributes.graph.set("labelloc", "b")
    subGraph.attributes.graph.set("labeljust", "l")
    subGraph.attributes.graph.set("margin", 10)
    subGraph.attributes.graph.set("fontsize", 16)
    //subGraph.attributes.edge.set("constraint", "false")
    subGraph.attributes.graph.set("penwidth", 2)
    subGraph.attributes.graph.set("pencolor", "#888888")
    subGraph.attributes.graph.set("style", "filled,rounded")
    subGraph.attributes.graph.set("fillcolor", ColorPalette.byInd(depth))
}

export function applyBasicNodeStyling(gnode: NodeModel, labelFontSize: number): void {
    gnode.attributes.set("fontsize", labelFontSize)
}

export function applyNodeWithIconStyling(node: NodeModel, icon: ComponentIcon, labelFontSize: number, labelLinesCount: number): void {

    const baseImgSize = 2

    node.attributes.set("image", icon.path)
    node.attributes.set("imagescale", "true")
    node.attributes.set("imagepos", "tc")
    node.attributes.set("penwidth", 0)
    node.attributes.set("shape", "node")
    node.attributes.set("fixedsize", "true")
    node.attributes.set("labelloc", "b")

    if (icon.format == ComponentIconFormat.NORMAL) {
        node.attributes.set("width", baseImgSize)
        node.attributes.set("height", baseImgSize + 0.05 + (labelLinesCount * 0.018 * labelFontSize))
    } else {
        const ratio = 0.60
        node.attributes.set("width", baseImgSize * ratio)
        node.attributes.set("height", (baseImgSize * ratio) + 0.05 + (labelLinesCount * 0.018 * labelFontSize))
    }
}
