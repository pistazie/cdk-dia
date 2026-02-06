import {CollapseTypes, CollapssingCustomizer, IgnoreCustomizer} from "../diagram/component/customizable-attribute"
import {TreeInspector} from "aws-cdk-lib"

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

    ignore() : CdkDiaDecorator{
        this.attributes[IgnoreCustomizer.name] = "true"
        return this
    }

    build(): {[key: string]: string}{
        return this.attributes
    }
}

export function DiagramOptions(options: DiagramOptionValues): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function <TFunction extends Function>(target: TFunction) {
        target.prototype.inspect = function(inspector: TreeInspector): void {
            const decorator = new CdkDiaDecorator()
            if (options.collapse) decorator.collapse(options.collapse)
            if (options.ignore) decorator.ignore()
            CdkDia.decorate(inspector, decorator);
        };
    };
}

export interface DiagramOptionValues {
    collapse?: CollapseTypes
    ignore?: boolean
}
