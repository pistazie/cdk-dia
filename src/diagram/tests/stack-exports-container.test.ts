import * as cdk from "../../cdk"
import {StackExportsContainer} from "../aws/stack-exports-container"
import {EdgeTargetStackExport} from "../aws/edge-target"

describe('stack-exports-container', () => {
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

        const container = StackExportsContainer.fromComponent(exportsNode)

        const export1 = container.getExport(EdgeTargetStackExport.fromFnImportValue('stack-with-topic:ExportsOutputRefthetopic9E1A294DCC1C73D6'))
        expect(export1).toEqual('thetopic9E1A294D')
    })
})