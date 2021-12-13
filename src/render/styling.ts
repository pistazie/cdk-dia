import Values from "values.js"

export class ColorPalette {

    static byInd(num: number): string {

        const color = new Values('#F3F3F3') // base / lightest shade
        const shade = color.shade(6 * num)
        return shade.hexString()
    }
}
