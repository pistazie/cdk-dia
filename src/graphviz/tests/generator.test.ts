import * as fs from "fs"
import * as rimraf from "rimraf"
import {Generator} from "../generator"
import {testCases} from "../../test-fixtures/testCases"
import {givenDiagram} from "../../diagram/tests/generator.test"
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

               const generator = new Generator(diagram)

               const filePath = `${basePath}/${test.jsonTreeFile}-${test.id}`
               const dotPath = generator.generateDot(filePath)

               const pathToSnap = path.resolve(process.cwd(), `./snapshots/diagram-converted-to-DOT-file-as-expected-${test.jsonTreeFile}-${test.id}.snapshot`);
               expect(fs.readFileSync(dotPath).toString()).toMatchSpecificSnapshot(pathToSnap);
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
//                const generator = new Generator(diagram)
//
//                const filePath = `${basePath}/${test.jsonTreeFile}-${test.id}`
//
//                await generator.generatePng(`${filePath}.png`).then((pngFilename) => {
//                     console.log(`done! find your file as ${pngFilename}`)
//                })
//           })
//      })
// })
