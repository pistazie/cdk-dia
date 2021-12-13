import {AwsDiagramGenerator} from "./aws-diagram-generator"

export abstract class EdgeTarget {
    abstract isEqual(other: EdgeTarget)
}

export class EdgeTargetSimpleString extends EdgeTarget {
    value: string

    constructor(value: string) {
        super()
        this.value = AwsDiagramGenerator.sanitizeComponentId(value)
    }

    isEqual(other: EdgeTarget) {
        if (!(other instanceof  EdgeTargetSimpleString)) return false

        return this.value == other.value
    }


    toString(): string {
        return `EdgeTargetSimpleString: ${this.value}`
    }
}

export class EdgeTargetStackExport extends EdgeTarget {

    constructor(public stackId: string, public exportValue: string) {
        super()
    }

    static fromFnImportValue(value: string) {
        const matches = value.match(/([^:]*):(.*)/)

        if (!matches) throw new Error(`FnImportValue not in expected form: ${value}`)

        return new EdgeTargetStackExport(matches[1], matches[2])
    }

    isEqual(other: EdgeTarget) {
        if (!(other instanceof  EdgeTargetStackExport)) return false

        return this.exportValue == other.exportValue && this.stackId == other.stackId
    }

    toString(): string {
        return `EdgeTargetStackExport: ${this.stackId} ${this.exportValue}`
    }
}