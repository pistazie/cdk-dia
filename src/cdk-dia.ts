import * as cdk from "../src/cdk"
import * as path from "path"
import * as diagrams from "../src/diagram"
import * as graphviz from "../src/render/graphviz"

export class CdkDia {

    async generateDiagram(treeJsonPath: string,
                          targetPath: string,
                          collapse: boolean,
                          cdkBasePath: string = require.resolve('cdk-dia/package.json'),
                          includedStacks: string[] | false = false) {

        // Parse tree.json
        const cdkTree = cdk.TreeJsonLoader.load(path.isAbsolute(treeJsonPath) ? treeJsonPath : path.join(process.cwd(), treeJsonPath))

        // Generate Diagram
        const generator = new diagrams.AwsDiagramGenerator(new diagrams.AwsEdgeResolver(), new diagrams.AwsIconSupplier(`${cdkBasePath}`))
        const diagram = generator.generate(cdkTree, collapse, includedStacks)

        // Render diagram using Graphviz
        return new graphviz.Graphviz().render({
            diagram: diagram,
            path: `${targetPath}`
        })
    }
}

