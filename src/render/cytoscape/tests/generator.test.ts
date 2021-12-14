import * as fs from "fs"
import {testCases} from "../../../test-fixtures/testCases"
import {givenDiagram} from "../../../diagram/tests/generator.test"
import {Cytoscape} from "../cytoscape"
import {Stats} from "fs"

const basePath = `${process.cwd()}/test-generated`

describe('Cytoscape static website generated as expected', () => {

    it.each(testCases)(`%# - %p`, async (testCase) => {

        const diagram = givenDiagram(testCase)

        const filePath = `${basePath}/${testCase.jsonTreeFile}-${testCase.id}`

        await new Cytoscape().render({
            diagram: diagram,
            path: filePath
        })

        const index = new File(`${filePath}/index.html`)
        expect(index.stats.size).toBeGreaterThanOrEqual(300)
        expect(index.body).toContain("CDK-Dia")

        const icons = new File(`${filePath}/icons`)
        expect(icons.stats.isDirectory()).toBeTruthy()

        const js = new File(`${filePath}/js`)
        expect(js.stats.isDirectory()).toBeTruthy()

        const elementsJson = new File(`${filePath}/cy-elements.json`)
        expect(JSON.parse(elementsJson.body).length).toBeGreaterThanOrEqual(2)

        const stylesJson = new File(`${filePath}/cy-styles.json`)
        expect(JSON.parse(stylesJson.body).length).toBeGreaterThanOrEqual(15)
    }, 120000)
})

class File {
    stats: Stats
    body: string

    constructor(path: string) {
        this.stats = fs.statSync(path)

        if (!this.stats.isDirectory()) {
            this.body = fs.readFileSync(path).toString()
        }
    }
}