import {Component} from "./component"

/**
 * Represents a link between two {Component}s
 */
export class Link {
    readonly from : Component
    readonly to : Component

    constructor(from: Component, to: Component) {
        this.from = from
        this.to = to
    }
}