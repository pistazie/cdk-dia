import * as cdk from "../../cdk"
import {makeUniqueId} from "@aws-cdk/core/lib/private/uniqueid"
import {EdgeTargetStackExport} from "./edge-target"

class StackExport {
    constructor(
        readonly targetId: string,
        readonly fullId: string,
    ) {}
}

export class StackExportsContainer {

    private readonly exports: StackExport[] = []

    private constructor() {}

    static fromComponent(exportsComponent: cdk.Node): StackExportsContainer {
        const container = new StackExportsContainer()

        exportsComponent.children.forEach( exportNode => {

            const matches = exportNode.id.match( new RegExp('Output\{"Ref":"(.*)"\}'))
            if (matches){
                const refTargetId: string = matches[1]
                container.exports.push(new StackExport(refTargetId, exportNode.id))
            }
        })
        return container
    }

    getExport(edgeTargetStackExport: EdgeTargetStackExport): string | undefined{

        const stackExport = this.exports.find(stackExport => {
            const calculatedExportName = makeUniqueId(['Exports', stackExport.fullId])
            return calculatedExportName == edgeTargetStackExport.exportValue
        })

        return stackExport? stackExport.targetId : undefined
    }
}