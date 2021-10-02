const fs = require('fs')
const path = require('path')

const basePath = process.env.SMOKE_TEST_BASE_PATH
const diagramFileName = 'diagram.png';

describe('Created diagram PNG file', ()=>{

    it ('should exist', ()=>{
        const dirFiles = fs.readdirSync(basePath)
        expect(dirFiles).toContain(diagramFileName)
    })

    it ('should have a reasonable size', ()=>{
        const fileProps = fs.statSync(path.join(basePath, diagramFileName))
        // on my local setup and Graphviz impl. the diagram is 229KB
        expect(fileProps.size / 1024).toBeGreaterThan(500) //200KB
        expect(fileProps.size / 1024).toBeLessThan(400) //200KB
    })
})