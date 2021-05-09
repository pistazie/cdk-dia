import chalk from "chalk"

import * as diagram from "../../diagram"
import {DiagramRenderer, RenderingOutput, RenderingProps} from "../diagram-renderer"
import {Component} from "../../diagram"

export class GraphvizRenderingProps extends RenderingProps {
    diagram: diagram.Diagram
}

export class GraphvizRenderingOutput implements RenderingOutput {
    userOutput(): void {
        console.log(chalk.green(`Example done!`))
    }
}

export class Example implements DiagramRenderer {

    async render(props: GraphvizRenderingProps): Promise<GraphvizRenderingOutput> {

        props.diagram.root.subTreeApplyAllComponents( (component: Component) => {
            console.log(component.id)
        })

        return new GraphvizRenderingOutput()
    }
}