import * as cdk from "../src/cdk"
import * as path from "path"
import * as diagrams from "../src/diagram"
import * as graphviz from "../src/render/graphviz"
import * as cytoscape from "../src/render/cytoscape"

export enum Renderers {
    GRAPHVIZ='graphviz-png',
    CYTOSCAPE='cytoscape-html',
}

export class CdkDia {

    async generateDiagram(treeJsonPath: string,
                          targetPath: string,
                          collapse: boolean,
                          cdkBasePath: string = require.resolve('cdk-dia/package.json'),
                          includedStacks: string[] | false = false,
                          renderer: Renderers) {

        // Parse tree.json
        const cdkTree = cdk.TreeJsonLoader.load(path.isAbsolute(treeJsonPath) ? treeJsonPath : path.join(process.cwd(), treeJsonPath))

        // Generate Diagram
        const generator = new diagrams.AwsDiagramGenerator(new diagrams.AwsEdgeResolver(), new diagrams.AwsIconSupplier(`${cdkBasePath}`))
        const diagram = generator.generate(cdkTree, collapse, includedStacks)

        // Render diagram using Graphviz
        switch (renderer) {
            case Renderers.GRAPHVIZ:
                return new graphviz.Graphviz().render({
                    diagram: diagram,
                    path: `${targetPath}`
                })
            case Renderers.CYTOSCAPE:
                return new cytoscape.Cytoscape().render({
                    diagram: diagram,
                    path: `${targetPath}`
                })
            default:
                throw Error(`Unknown renderer: ${renderer}`)
        }
    }
}

