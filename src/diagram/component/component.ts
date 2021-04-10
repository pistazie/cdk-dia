import * as _ from "lodash"
import {ComponentLinks} from "../component-links"
import {Link} from "./link"
import {ComponentIcon} from "./icon"
import {RootComponent} from "./root-component"

export type ComponentId = string

export enum ComponentTags{
    isCdkStack = "isCdkStack",
    isCdkStage = "isCdkStage",
    collapssingOverride = "collapssingOverride"
}

/**
 * A component in a diagram (Tree)
 */
export abstract class Component {

    protected constructor(id: ComponentId) {
        this.setId(id)
    }

    /**
     * A diagram-unique component ID
     */
    private _id: ComponentId

    idPathParts = (): Array<string> => this.id.split("/")

    public get id(): ComponentId {
        return this._id
    }

    private setId(value: ComponentId) {
        this._id = value
    }

    label: string[]
    public icon: ComponentIcon | null = null

    tags: Map<string,string> = new Map<string, string>()

    private _subComponents: Set<Component> = new Set<Component>()

    public subComponents(): Component[] {
        return Array.from(this._subComponents)
    } //TODO : should return clone!

    protected abstract parent(): Component

    protected abstract destroyLinks(): void

    abstract depth(): number

    abstract toSimpleObject(): Record<string, unknown>

    abstract assureIdDoesNotExistInConnectedComponents(id: ComponentId): void

    abstract treeRoot(): RootComponent

    /**
     * Subtree manipulations
     */
    removeSubComponent(component: Component): void {
        component.destroyLinks()
        this._subComponents.delete(component)
    }

    addSubComponent(component: Component) : void{
        this.assureIdDoesNotExistInConnectedComponents(component.id)

        this._subComponents.add(component)
    }

    removeAndDestroyAllSubComponents(): void {
        this._subComponents.forEach(subComponent => {
            this.removeAndDestroyAllSubComponentsRec(subComponent)
        })
        this._subComponents = new Set<Component>()
    }

    replaceSubComponent(component: Component, newComponent: Component) : void{

        // update links from components linking to [component]
        const reverseLinkingComponents = component.links.getReverseLinkedComponents()
        reverseLinkingComponents.forEach(revLinking => {
            if (revLinking !== newComponent) {
                revLinking.links.updateLinkTarget(component, newComponent)
            }
        })

        // update links from components linking to [component]
        const linkedComponents = component.links.getLinkedComponents()
        linkedComponents.forEach(link => {
            if (link !== newComponent) {
                newComponent.links.addLink(link)
            }
        })

        this.removeSubComponent(component)
        this.addSubComponent(newComponent)
    }

    private removeAndDestroyAllSubComponentsRec(node: Component) {
        node._subComponents.forEach(subComponent => {
            this.removeAndDestroyAllSubComponentsRec(subComponent)
        })
        node.destroyLinks()
    }

    public destroyAndDetach() : void{
        this.parent().removeSubComponent(this)
    }

    collapseToParent() : void{

        // update linking Components from outside of collapsed subtree
        const subtreeReverseEdges = this.parent().subTreeReverseLinks()
        subtreeReverseEdges.forEach(edge => {
            if (! this.parent().componentIsInSubTree(edge.from)) {
                edge.from.links.updateLinkTarget(edge.to, this.parent())
            }
        })

        // remove links from parent component to it's subtree
        const linksToSubTree = this.parent().links.getLinkedComponents()
        linksToSubTree.forEach(edge => {
            if (this.parent().componentIsInSubTree(edge))
                this.parent().links.removeLink(edge)
        })

        // scrape all links of subtree components and switch links to new component
        const subtreeEdges = this.parent().subTreeLinks()
        subtreeEdges.forEach(edge => {
            if (! this.parent().componentIsInSubTree(edge.to))
                edge.from.links.removeLink(edge.to)
            this.parent().links.addLink(edge.to)
        })

        this.parent().removeAndDestroyAllSubComponents()
    }

    /**
     * SubTree methods
     */
    subTreeComponentIds(): Set<ComponentId> {

        const allIds = new Set<ComponentId>()
        this.subTreeComponents().forEach(it => {allIds.add(it.id)})
        return allIds
    }

    componentIsInSubTree(search: Component): boolean {

        const components = this.subTreeComponents()

        const component = components.find(it => {
            return it.id === search.id
        })
        return (component !== undefined)
    }

    subTreeApplyAllComponents(lambda: (Component) => void) :void{
        this.applyAllComponentsRec(this, lambda)
    }

    private applyAllComponentsRec(subTree: Component, lambda: (Component) => void) {
        lambda(subTree)
        subTree.subComponents().forEach(sub => this.applyAllComponentsRec(sub, lambda))
    }

    subTreeFindComponentById(id: string): Component | null {
        return this.subTreeFindComponent(component => {
            return component.id == id
        })
    }

    subTreeFindComponent(predicate: (Component) => boolean): Component | null {
        return this.subTreeFindComponentRec(this, predicate)
    }

    private subTreeFindComponentRec(subTree: Component, predicate: (Component) => boolean): Component | null {

        if (predicate(subTree)) return subTree

        return subTree.subComponents().map(it => {
            return it.subTreeFindComponent(predicate)
        }).find(it => {
            return it != null
        })
    }

    private subTreeComponents(): Component[] {

        const components = _.flatten(this.subComponents().map(sub => {
            return sub.subTreeComponents()
        }))
        return components.concat([this])
    }

    /**
     * Component {Link} related
     */
    private _links = new ComponentLinks(this)

    get links(): ComponentLinks {
        return this._links
    }

    /**
     * @return all {Componet}s which are linking to {this} Component
     */
    subTreeReverseLinks(withSelf = true): Array<Link> {
        return this.subTreeReverseLinksRec(this, withSelf)
    }

    private subTreeReverseLinksRec(current: Component, includeSelf = true): Array<Link> {

        const targets: Link[] = []

        if (includeSelf) {
            targets.push(...current.links.getReverseLinkedComponents().map(component => new Link(component, current)))
        }

        current.subComponents().forEach(sub => {
            targets.push(...(this.subTreeReverseLinksRec(sub)))
        })

        return targets
    }

    /**
     * @return all {Componet}s which are linked by {this} Component
     */
    subTreeLinks(): Array<Link> {
        return this.subTreeLinksRec(this)
    }

    private subTreeLinksRec(current: Component): Array<Link> {
        const targets = current.links.getLinkedComponents().map(component => new Link(current, component))

        current.subComponents().forEach(sub => {
            targets.push(...(this.subTreeLinksRec(sub)))
        })

        return targets
    }

    treeAncestorWithTag(tagKey: ComponentTags, tagVal: string): Component {
         if (this.tags.get(tagKey) === tagVal) return this

        return this.parent().treeAncestorWithTag(tagKey,tagVal)
    }

    isAncestor(possibleAncestor: Component): boolean {
        try {
            return this.parent() == possibleAncestor || this.parent().isAncestor(possibleAncestor)
        } catch (e) {
            return false
        }
    }
}
