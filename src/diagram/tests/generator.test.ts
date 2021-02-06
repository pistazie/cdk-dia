import * as diagrams from ".."
import * as path from "path"
import * as cdk from "../../cdk"
import {AwsEdgeResolver} from ".."
import {testCases, TestConf} from "../../test-fixtures/testCases"
import {AwsIconSupplier} from "../aws/aws-icon-supplier"

if (global['jest-specific-init'] == undefined) {
    global['jest-specific-init'] = true
    require("jest-specific-snapshot")
}

describe("diagram JSON as expected", () => {

    //const oneCase = [testCases[11]]
    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

            const diagram = givenDiagram(test)

            const pathToSnap = path.resolve(process.cwd(), `./snapshots/diagram-JSON-as-expected-${test.jsonTreeFile}-${test.id}.snapshot`);
            expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
        })
    })
})

describe("All Components linked from the Tree are also part of the tree", () => {

   // const oneCase = [testCases[testCases.length -1 ]]

    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

             const diagram = givenDiagram(test)

            expect(testAllLinksInDiagram(diagram.root, diagram.root)).toBeUndefined()
        })
    })

    function testAllLinksInDiagram(root, node) {

        node.links.getLinkedComponents().forEach(target => {
            if (! root.componentIsInSubTree(target)) {
                throw Error(`Node ${node.id} has link to ${target.id} which is not in the Diagram`)
            }
        })

        node.links.getReverseLinkedComponents().forEach(target => {
            if (! root.componentIsInSubTree(target))
                throw Error(`Node ${node.id} has reverse-link to ${target.id} which is not in the Diagram`)
        })

        node.subComponents().forEach(it => {
            testAllLinksInDiagram(root, it)
        })
    }

})

describe("All Sub-Components are also part of the tree", () => {

    //const oneCase = [testCases[0]]
    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

             const diagram = givenDiagram(test)

            expect(testAllSubComponentsInDiagram(diagram.root, diagram.root)).toBeUndefined()
        })
    })

    function testAllSubComponentsInDiagram(node, root) {

        if (! root.componentIsInSubTree(node)) throw Error(`not looking good node not in ${node.id}`)

        node.subComponents().forEach(component => {
            if (! root.componentIsInSubTree(component))
                throw Error(`not looking good node not in ${node.id}`)
        })

        node.subComponents().forEach(it => {
            testAllSubComponentsInDiagram(it, root)
        })
    }
})

describe("All Links are bi-directional", () => {

    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

            const diagram = givenDiagram(test)

            expect(testLinks(diagram.root)).toBeUndefined()
        })
    })

    function testLinks(node) {

        // check each link to me has a rev-link to me
        node.links.getLinkedComponents().forEach( target =>{
            const components = target.links.getReverseLinkedComponents().filter(rev=> { return rev ==node })

            if (components.length != 1) {
                throw Error(`not looking good ${node.id}`)
            }
        })

        node.subComponents().forEach( it => {
            testLinks(it)
        })
    }
})

export function givenDiagram(testConf: TestConf): diagrams.Diagram{
    const cdkTree = cdk.TreeJsonLoader.load(`${testConf.cdkTreePath}${testConf.jsonTreeFile}.json`)

    const generator = new diagrams.AwsDiagramGenerator(new AwsEdgeResolver(), new AwsIconSupplier(""))
    return generator.generate(cdkTree, testConf.collapsed)
}