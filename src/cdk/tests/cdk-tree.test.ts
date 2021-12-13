import * as cdk from "../cdk-tree"
import {testCases} from "../../test-fixtures/testCases"
import {TreeJsonLoader} from "../tree-json-loader"
import path from "path"

if (global['jest-specific-init'] == undefined) {
    global['jest-specific-init'] = true
    require("jest-specific-snapshot")
}

describe("cdk-tree parsing", () => {
    testCases.forEach(test => {

        it(`${test.cdkTreePath} - ${test.jsonTreeFile} - ${test.id}`, () => {
            const cdkTree = TreeJsonLoader.load(`${test.cdkTreePath}${test.jsonTreeFile}.json`)
            const pathToSnap = path.resolve(process.cwd(), `./snapshots/cdk-tree-parsing-as-expected-${test.jsonTreeFile}-${test.id}.snapshot`);

            expect(cdkTree.tree).toMatchSpecificSnapshot(pathToSnap)
        })
    })
})

describe('cdk-tree', () => {
    it('fromComponent() - parses exports', () => {
        const exportsNode = cdk.Node.fromObject( {
            "id": "Exports",
            "path": "stack-with-topic/Exports",
            "children": {
                "Output{\"Ref\":\"thetopic9E1A294D\"}": {
                    "id": "Output{\"Ref\":\"thetopic9E1A294D\"}",
                    "path": "stack-with-topic/Exports/Output{\"Ref\":\"thetopic9E1A294D\"}",
                    "constructInfo": {
                        "fqn": "aws-cdk-lib.CfnOutput",
                        "version": "2.0.0"
                    }
                }
            },
            "constructInfo": {
                "fqn": "constructs.Construct",
                "version": "10.0.9"
            }
        })

       expect(exportsNode.id).toEqual("Exports")
    })
})