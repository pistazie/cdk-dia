
export enum ComponentIconFormat {
    NORMAL = "NORMAL",
    SMALLER = "SMALLER"
}

export class ComponentIcon {
    path: string | null
    format: ComponentIconFormat

    constructor(path: string | null, format: ComponentIconFormat = ComponentIconFormat.NORMAL) {
        this.path = path
        this.format = format
    }
}