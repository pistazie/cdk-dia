
export enum ComponentIconFormat {
    NORMAL = "NORMAL",
    SMALLER = "SMALLER"
}

export class ComponentIcon {
    path: string
    format: ComponentIconFormat

    constructor(path: string, format: ComponentIconFormat = ComponentIconFormat.NORMAL) {
        this.path = path
        this.format = format
    }
}