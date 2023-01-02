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

describe("setting specific Stacks works as expected", () => {

    const twoSimpleStacksTestCase = {
        id: `collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    }

    it(`it only diagrams the "microservice1" stack`, () => {
        const diagram = givenDiagram(twoSimpleStacksTestCase, ["microservice1"])
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_only_microservice1.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })

    it(`it only diagrams both "microservice1" and "microservice2" stacks`, () => {
        const diagram = givenDiagram(twoSimpleStacksTestCase, ["microservice1", "microservice2"])
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_both_microservices.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })

    it(`when false set as includedStacks both "microservice1" and "microservice2" stacks are diagramed`, () => {
        const diagram = givenDiagram(twoSimpleStacksTestCase, false)
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_both_microservices.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })

    const pipelineNestedStacksTestCase = {
        id:`non-collapsed`,
            jsonTreeFile: "cdk_pipeline_with_stages_stacks_and_construct_infos",
        cdkTreePath: "src/test-fixtures/",
        collapsed: false,
        collapsedDoubleClusters: true
    }

    it(`use can use a path of a stack which is nested`, () => {
        const diagram = givenDiagram(pipelineNestedStacksTestCase, ["pipelinestack/prod/database"])
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_nested_stack_path.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })

    it(`use can use a path of a stack which is nested`, () => {
        const diagram = givenDiagram(pipelineNestedStacksTestCase, ["pipelinestack"])
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_nested_stack_all.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })

    it(`use can use a path of a stack which is nested`, () => {
        const diagram = givenDiagram(pipelineNestedStacksTestCase, false)
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/settingSpecificStacks_nested_stack_all.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })
})

describe("excluding specific Stacks works as expected", () => {

    const twoSimpleStacksTestCase = {
        id: `collapsed`,
        jsonTreeFile: "multiple-similar-stacks",
        cdkTreePath: "src/test-fixtures/",
        collapsed: true,
        collapsedDoubleClusters: true
    }

    it(`it only diagrams the "microservice1" stack`, () => {
        const diagram = givenDiagram(twoSimpleStacksTestCase, false, ["microservice1"])
        const pathToSnap = path.resolve(process.cwd(), `./snapshots/excludingStacks_only_microservice1.snapshot`);
        expect(diagram.toSimpleObject()).toMatchSpecificSnapshot(pathToSnap)
    })
})

describe("All Components linked from the Tree are also part of the tree", () => {

   // const oneCase = [testCases[testCases.length -1 ]]

    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

             const diagram = givenDiagram(test)

            expect(testAllLinksInDiagram(diagram.root, diagram.root)).toBeTruthy()
        })
    })

    function testAllLinksInDiagram(root, node): boolean {

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

        return true
    }

})

describe("All Sub-Components are also part of the tree", () => {

    //const oneCase = [testCases[0]]
    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

             const diagram = givenDiagram(test)

            expect(testAllSubComponentsInDiagram(diagram.root, diagram.root)).toBeTruthy()
        })
    })

    function testAllSubComponentsInDiagram(node, root): boolean {

        if (! root.componentIsInSubTree(node)) throw Error(`not looking good node not in ${node.id}`)

        node.subComponents().forEach(component => {
            if (! root.componentIsInSubTree(component))
                throw Error(`not looking good node not in ${node.id}`)
        })

        node.subComponents().forEach(it => {
            testAllSubComponentsInDiagram(it, root)
        })

        return true
    }
})

describe("All Links are bi-directional", () => {

    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {

            const diagram = givenDiagram(test)

            expect(testLinks(diagram.root)).toBeTruthy()
        })
    })

    function testLinks(node): boolean {

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

        return true
    }
})

export function givenDiagram(testConf: TestConf, includedStacks: string[] | false = false, excludedStacks: string[] | undefined = undefined): diagrams.Diagram {
    const cdkTree = cdk.TreeJsonLoader.load(`${testConf.cdkTreePath}${testConf.jsonTreeFile}.json`)

    const generator = new diagrams.AwsDiagramGenerator(new AwsEdgeResolver(), new AwsIconSupplier(""))
    return generator.generate(cdkTree, testConf.collapsed, testConf.collapsedDoubleClusters, includedStacks, excludedStacks)
}