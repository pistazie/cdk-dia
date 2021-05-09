import * as fs from "fs"
import * as rimraf from "rimraf"
import {Graphviz} from "../graphviz"
import {testCases} from "../../../test-fixtures/testCases"
import {givenDiagram} from "../../../diagram/tests/generator.test"
import * as path from "path"

if (global['jest-specific-init'] == undefined) {
     global['jest-specific-init'] = true
     require("jest-specific-snapshot")
}

jest.setTimeout(3000000)

const basePath = `${process.cwd()}/test-generated`

beforeAll(() => {
     rimraf.sync(basePath)
     fs.mkdirSync(basePath)
});

describe("diagram converted to DOT file as expected", () => {
     //const oneCase = [testCases[2]]
     testCases.forEach(test => {

          it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, async () => {

               const diagram = givenDiagram(test)

               const generator = new Graphviz()

               const dotFilePath = `${basePath}/${test.jsonTreeFile}-${test.id}.dot`
               generator.renderToDot(diagram, dotFilePath)

               const pathToSnap = path.resolve(process.cwd(), `./snapshots/diagram-converted-to-DOT-file-as-expected-${test.jsonTreeFile}-${test.id}.snapshot`);
               expect(fs.readFileSync(dotFilePath).toString()).toMatchSpecificSnapshot(pathToSnap);
          })
     })
})

// describe("diagram converted to PNG file as expected", () => {
//
//      //const oneCase = [testCases[1]]
//      testCases.forEach(test => {
//
//           it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, async () => {
//
//                const diagram = givenDiagram(test)
//
//                const filePath = `${basePath}/${test.jsonTreeFile}-${test.id}`
//
//                await new Graphviz().render({
//                     diagram: diagram,
//                     path: filePath
//                }).then((pngFilename) => {
//                     console.log(`done! find your file as ${pngFilename}`)
//                })
//           })
//      })
// })
