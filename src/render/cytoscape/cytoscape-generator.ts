import * as _ from "lodash"
import * as diagram from "../../diagram"
import {CytoscapeElement, CytoscapeElementEdge, CytoscapeElementNode} from "./cytoscape-element"
import {ColorPalette} from "../styling"

export class CytoscapeGenerator {

    /**
     * Generates a Cytoscape (element and style objects) representation of a Diagram
     */
    static generate(dia: diagram.Diagram) {
        const elements: CytoscapeElement[] = this.elements(dia)
        const styles = CytoscapeGenerator.styles()
        return [elements, styles]
    }

    private static styles(): any[] {

        const styles: any = [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
                    'border-style': 'solid',
                    'border-width': '1px',
                    'border-color': 'green',
                }
            },
            {
                selector: 'edge',
                style: {
                    "width": 2,
                    "line-color": "#D58714",
                    "target-arrow-color": "#D58714",
                    "target-arrow-shape": "circle",
                    "curve-style": "taxi",
                    "taxi-direction": "auto",
                    "taxi-turn": 50,
                    "taxi-turn-min-distance": 5
                }
            }
        ]

        for (let depth = 0; depth < 16; depth++) {
            styles.push({
                selector: `node.depth${depth}`,
                style: {
                    'background-color': ColorPalette.byInd(depth)
                }
            })
        }

        return styles
    }

    private static elements(diagram: diagram.Diagram): CytoscapeElement[] {
        const nodes = this.generateNodes(diagram.root)
        const edges = this.addEdges(diagram.root)

        return [...nodes, ...edges]
    }

    private static generateNodes(node: diagram.Component, parentId: string | undefined = undefined): CytoscapeElementNode[] {

        const data: any = {
            id: node.id
        }

        if (parentId) data.parent = parentId

        const style: any = {
            'shape': 'rectangle',
            'label': node.label
        }

        if (node.subComponents().length > 0) { // sub graph with a frame

            const nodeElement: CytoscapeElementNode = {
                data, style, classes: 'depth' + node.depth()
            }

            const subComponentsNodeElements = _.flatten(node.subComponents().map(sub => this.generateNodes(sub, node.id)))
            return [nodeElement, ...subComponentsNodeElements]

        } else { // leaf node

            style.width = '100px'
            style.height = '100px'

            if (node.icon != null && node.icon.path != null) {

                let cleanedIconPath = node.icon.path
                const iconsCleaningRe = /\/icons\/(.*)/
                const matches = node.icon.path.match(iconsCleaningRe)
                if (matches) {
                    cleanedIconPath = `icons/${matches[1]}`
                } else {
                    cleanedIconPath = `../${cleanedIconPath}`
                }

                style['background-fit'] = 'cover'
                style['background-image'] = cleanedIconPath
            }

            const nodeElement: CytoscapeElementNode = {
                data, style, classes: 'depth' + node.depth()
            }

            return [nodeElement]
        }
    }

    private static addEdges(node: diagram.Component): CytoscapeElementEdge[] {

        const linkedComponentEdges: CytoscapeElementEdge[] = node.links.getLinkedComponents().map(edgeNode => {
            return {
                data: {
                    source: node.id,
                    target: edgeNode.id
                }
            }
        })

        const subComponentEdges = node.subComponents().map(sub => {
            return this.addEdges(sub)
        })

        return [...linkedComponentEdges, ..._.flatten(subComponentEdges)]
    }
}