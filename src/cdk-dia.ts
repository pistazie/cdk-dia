import * as cdk from "../src/cdk"
import * as path from "path"
import * as diagrams from "../src/diagram"
import * as graphviz from "../src/render/graphviz"
import * as render from "../src/render/index"
import {RenderingError} from "../src/render/index"
import {Example} from "./render/example/example"

export class CdkDia {

    async generateDiagram(treeJsonPath: string,
                          targetPath: string,
                          collapse: boolean,
                          cdkBasePath: string = require.resolve('cdk-dia/package.json'),
                          includedStacks: string[] | false = false,
                          renderingEngine: string = render.RenderingEngines.GRAPHVIZ): Promise<render.RenderingOutput> {

        // Parse tree.json
        const cdkTree = cdk.TreeJsonLoader.load(path.isAbsolute(treeJsonPath) ? treeJsonPath : path.join(process.cwd(), treeJsonPath))

        // Generate Diagram
        const generator = new diagrams.AwsDiagramGenerator(new diagrams.AwsEdgeResolver(), new diagrams.AwsIconSupplier(`${cdkBasePath}`))
        const diagram = generator.generate(cdkTree, collapse, includedStacks)

        switch (renderingEngine){
            case render.RenderingEngines.GRAPHVIZ:
                return new graphviz.Graphviz().render({
                    diagram: diagram,
                    path: `${targetPath}`
                })
                break
            case render.RenderingEngines.EXAMPLE:
                return new Example().render({
                    diagram: diagram
                })
                break
            default:
                throw new RenderingError(`Unsupported rendering engine: ${renderingEngine}`)
        }
    }
}

