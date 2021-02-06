import {Component} from "."

/**
 * manages component links/edges to other components
 */
export class ComponentLinks{

    private readonly component: Component

    constructor(component: Component) {
        this.component = component
    }

    /**
     * links - components which are linked from this.component
     */
    private links = new Set<Component>()
    getLinkedComponents = ():Array<Component> => Array.from(this.links)
    addLink(target: Component) :void{
        this.links.add(target)
        target.links.addReverseLink(this.component)
    }
    removeLink (target: Component): void{
        this.links.delete(target)
        target.links.removeReverseLink(this.component)
    }

    updateLinkTarget (prev: Component, next: Component): void{
        this.removeLink(prev)
        this.addLink(next)
    }

    /**
     * reverseLinks - references to components which link to this.component
     */
    private reverseLinks = new Set<Component>()
    getReverseLinkedComponents = (): Array<Component> => Array.from(this.reverseLinks)
    private addReverseLink(targetComponent: Component) {
        this.reverseLinks.add(targetComponent)
    }
    private removeReverseLink(targetComponent: Component) {
        if (!this.reverseLinks.has(targetComponent))
            throw new Error("Actually reverseLink "+targetComponent.id+" isn't in list of " + this.component.id)
        this.reverseLinks.delete(targetComponent)
    }
}