const path = require('path')
const fs = require('fs')

const basePath = process.env.SMOKE_TEST_BASE_PATH
const diagramFolderName = 'diagram';

console.info("Asserting expected static website with Cytoscape at: " + path.join(basePath, diagramFolderName))

describe('Created static website', ()=>{

    it ('should exist', ()=>{
        const index = new File(`${basePath}/${diagramFolderName}/index.html`)
        expect(index.stats.size).toBeGreaterThanOrEqual(300)
        expect(index.body).toContain("CDK-Dia")

        const icons = new File(`${basePath}/${diagramFolderName}/icons`)
        expect(icons.stats.isDirectory()).toBeTruthy()

        const js = new File(`${basePath}/${diagramFolderName}/js`)
        expect(js.stats.isDirectory()).toBeTruthy()

        const elementsJson = new File(`${basePath}/${diagramFolderName}/cy-elements.json`)
        expect(JSON.parse(elementsJson.body).length).toBeGreaterThanOrEqual(2)

        const stylesJson = new File(`${basePath}/${diagramFolderName}/cy-styles.json`)
        expect(JSON.parse(stylesJson.body).length).toBeGreaterThanOrEqual(15)
    })
})

class File {
    stats
    body

    constructor(path) {
        this.stats = fs.statSync(path)

        if (!this.stats.isDirectory()) {
            this.body = fs.readFileSync(path).toString()
        }
    }
}