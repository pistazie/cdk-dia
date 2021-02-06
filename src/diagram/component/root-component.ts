import {Component, ComponentId} from "./component"

export class RootComponent extends Component {

    treeRoot(): RootComponent {
        return this
    }

    protected parent(): Component {
        throw new Error("Root component has no parent")
    }

    constructor(id: ComponentId) {
        super(id)
        this.label = [id]
    }

    assureIdDoesNotExistInConnectedComponents(id: ComponentId): void{
        const ids = this.subTreeComponentIds()
        ids.add(this.id)

        if (ids.has(id)) throw new Error(`Id ${id} already exists in diagram`)
    }

    depth = (): number => 0

    selfAndAllSubcomponentIds(): Set<ComponentId> {
        return undefined;
    }

    toSimpleObject(): Record<string, unknown> {
        return {
            id: this.id,
            "_image": this.icon,
            isGroup: this.subComponents().length > 0,
            children: Array.from(this.subComponents()).map(it => { return it.toSimpleObject() })
        }
    }

    protected destroyLinks() : void{
        throw new Error("root destruction is not implemented")
    }
}
