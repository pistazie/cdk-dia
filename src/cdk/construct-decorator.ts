import {CollapseTypes, CollapssingCustomizer} from "../diagram/component/customizable-attribute"
import {TreeInspector} from "@aws-cdk/core"

export class CdkDia{

    static readonly attrPrefix = "CDK-DIA_"

    static decorate(inspector: TreeInspector, decorator: CdkDiaDecorator): void {
        const attributes = decorator.build()
        for (const key in attributes) {
            inspector.addAttribute(CdkDia.attrPrefix + key, attributes[key])
        }
    }
}

export class CdkDiaDecorator {

    private attributes: {[key: string]: string} = {}

    collapse(val: CollapseTypes) : CdkDiaDecorator{
        this.attributes[CollapssingCustomizer.name] = val
        return this
    }

    build(): {[key: string]: string}{
        return this.attributes
    }
}