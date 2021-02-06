import {Component} from "."

export class Diagram {

    root: Component
    toSimpleObject = (): Record<string, unknown> => this.root.toSimpleObject()
}

export class DiagramGenerator {}
