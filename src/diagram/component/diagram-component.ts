import {Component, ComponentId} from "./component"
import {ComponentIcon} from "./icon"
import {RootComponent} from "./root-component"

export class DiagramComponent extends Component{

    constructor(id: ComponentId, label: string[], parent: Component) {
        super(id)
        this.label = label
        this._parent = parent
    }

    private _parent: Component
    protected parent(): Component {
        return this._parent
    }

    depth = (): number => this._parent.depth() + 1

    toSimpleObject(): Record<string, unknown>{
        return {
            id: this.id,
            "_image": this.icon,
            isGroup: this.subComponents().length > 0,
            children: Array.from(this.subComponents()).map(it => { return it.toSimpleObject() }),
            label: this.label,
            edges: Array.from(this.links.getLinkedComponents()).map(component => { return component.id })
        }
    }

    assureIdDoesNotExistInConnectedComponents(id: ComponentId): void {
        this._parent.assureIdDoesNotExistInConnectedComponents(id)
    }

    setIcon(image: ComponentIcon) :void{
        this.icon = image
    }

    protected destroyLinks() : void{

        // remove outgoing links
        this.links.getLinkedComponents().forEach( link => {
            this.links.removeLink(link)
        })

        // remove incoming links
        this.links.getReverseLinkedComponents().forEach( linkingComponent => {
            linkingComponent.links.removeLink(this)
        })

    }

    treeRoot(): RootComponent {
        return this.parent().treeRoot()
    }

    treeAncestorInDepth(depth: number): DiagramComponent {

        if (this.depth() == depth) return this

        if (this.depth() < depth || ! (this.parent() instanceof DiagramComponent)) throw Error(`Failed to find an ancestor in depth=${depth} mine=${this.depth()}`)

        return (this.parent() as DiagramComponent).treeAncestorInDepth(depth)
    }
}
