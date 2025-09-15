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

    it('shouldBeIgnored() - returns true for metadata annotation', () => {
        const ignoredNode = cdk.Node.fromObject({
            "id": "IgnoredResource",
            "path": "stack/IgnoredResource",
            "metadata": {
                "aws:cdk:info": ["cdk-dia:ignore"]
            }
        })

        expect(ignoredNode.shouldBeIgnored()).toBe(true)
    })

    it('shouldBeIgnored() - returns true for attribute annotation', () => {
        const ignoredNode = cdk.Node.fromObject({
            "id": "IgnoredResource",
            "path": "stack/IgnoredResource",
            "attributes": {
                "CDK-DIA_ignore": "true"
            }
        })

        expect(ignoredNode.shouldBeIgnored()).toBe(true)
    })

    it('shouldBeIgnored() - returns false for non-ignored node', () => {
        const normalNode = cdk.Node.fromObject({
            "id": "NormalResource",
            "path": "stack/NormalResource"
        })

        expect(normalNode.shouldBeIgnored()).toBe(false)
    })

    it('shouldBeIgnored() - returns false for other info annotations', () => {
        const nodeWithOtherInfo = cdk.Node.fromObject({
            "id": "ResourceWithInfo",
            "path": "stack/ResourceWithInfo",
            "metadata": {
                "aws:cdk:info": ["some-other-info"]
            }
        })

        expect(nodeWithOtherInfo.shouldBeIgnored()).toBe(false)
    })
})