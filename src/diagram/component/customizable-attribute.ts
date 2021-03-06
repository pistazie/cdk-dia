import {Component, ComponentTags} from "./component"

abstract class CustomizableAttribute {
    abstract customize(component: Component)
}

export class CollapssingCustomizer extends CustomizableAttribute{

    readonly type: CollapseTypes

    private constructor(type: CollapseTypes) {
        super()
        this.type = type
    }

    static fromAttributeValue(value: string): CustomizableAttribute{
        if ( !(value in CollapseTypes)) throw Error (value + " is not a valid enum value")
        return new CollapssingCustomizer(CollapseTypes[value])
    }

    customize(component: Component) {
        component.tags.set(ComponentTags.collapssingOverride ,this.type)
    }
}

export enum CollapseTypes {
    FORCE_COLLAPSE= "FORCE_COLLAPSE",
    FORCE_NON_COLLAPSE = "FORCE_NON_COLLAPSE",
    FORCE_NON_COLLAPSE_RECURSIVE = "FORCE_NON_COLLAPSE_RECURSIVE"
}