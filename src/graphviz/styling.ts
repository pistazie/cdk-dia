import {Graph} from "ts-graphviz"
import Values from "values.js"

export function setBaseGraphAttributes(graph: Graph): void {

    graph.set("splines","ortho")
    graph.set("pad", "1.0")
    graph.set("nodesep", "0.60")
    graph.set("ranksep", "0.75")
    graph.set("fontname", "Sans-Serif")
    graph.set("fontsize", "15")
    graph.set("dpi", "200")
    graph.set("rankdir", "BT")
    graph.set("compound", "true")
    graph.set("fontcolor", "#222222")

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

    graph.attributes.edge.set("color", "#D5871488")
    graph.attributes.edge.set("penwidth", 2.0)
    graph.attributes.edge.set("arrowhead", "dot")
    graph.attributes.edge.set("arrowtail", "dot")
}

export class ColorPalette {

    static byInd(num: number): string{

        const color = new Values('#F3F3F3') // base / lightest shade
        const shade = color.shade(6 * num)
        return shade.hexString()
    }
}
