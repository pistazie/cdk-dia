import * as diagram from "../diagram/index"

export interface DiagramRenderer {
    render(props: RenderingProps): Promise<RenderingOutput>
}

export abstract class RenderingProps {
    diagram: diagram.Diagram
}
export interface RenderingOutput {
    userOutput()
}

export class RenderingError extends Error {

    readonly debugInfo: string[]
    readonly fixTips: string[]

    constructor(message: string, debugInfo: string[] = [], fixTips: string[] = []) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = RenderingError.name;

        this.debugInfo = debugInfo
        this.fixTips = fixTips
    }
}

export enum RenderingEngines {
    GRAPHVIZ = "graphviz",
    EXAMPLE= "example"
}