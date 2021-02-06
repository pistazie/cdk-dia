import {Diagram} from "../diagram"
import * as cdk from "../../cdk"
import * as _ from "lodash"
import {makeUniqueId} from "@aws-cdk/core/lib/private/uniqueid"
import {Component, ComponentTags} from "../component/component"
import {AwsDiagramGenerator} from "./aws-diagram-generator"
import {DiagramComponent} from "../component/diagram-component"

/**
 * Finds references between nodes in AWS-CDK trees and converts them to Diagrams subComponent links
 */
export class AwsEdgeResolver {

    resolveEdges(tree: cdk.Node, diagram: Diagram): void {

        this.addEdges(tree, diagram)

        tree.children.forEach(child => {
            this.resolveEdges(child, diagram)
        })
    }

    private addEdges(node: cdk.Node, diagram: Diagram) {

        const originComponent = diagram.root.subTreeFindComponentById(AwsDiagramGenerator.sanitizeComponentId(node.path))
        if (originComponent == null) {
            //console.warn(`unable to find Origin Component with path ${node.path}`)
            return
        }

        const edgeTargetStrings = this.edgeTargets(node)

        edgeTargetStrings.forEach(targetString => this.addEdge(targetString, originComponent as DiagramComponent))
    }

    private addEdge(targetString: string, originComponent: DiagramComponent) {

        const cdkStackTree = originComponent.treeAncestorWithTag(ComponentTags.isCdkStack, "true")

        let targetComponent = this.findTargetComponent(cdkStackTree, targetString)

        if (targetComponent != null) {
            originComponent.links.addLink(targetComponent)
        }
    }


    private findTargetComponent(cdkStackTree, targetString: string) : Component | null {

        // perfect match
        const perfectMatch = cdkStackTree.subTreeFindComponent((component: Component) => {
            const uniqueResourceId = this.findUniqueResourceId(component)
            return targetString === uniqueResourceId
        })

        if (perfectMatch != null)
            return perfectMatch

        // lowerCase match
        return cdkStackTree.subTreeFindComponent((component: Component) => {
            const uniqueResourceId = this.findUniqueResourceId(component)
            return targetString.toLowerCase() === uniqueResourceId
        })
    }

    private findUniqueResourceId(component: Component): string | boolean {
        const pathParts: string[] = component.idPathParts().slice(AwsDiagramGenerator.CDK_STACK_DEPTH - 1)

        if (pathParts.length === 0) return false

        return makeUniqueId(pathParts)
    }

    /**
     * Returns all possible edge targets pointing from [node]
     */
    private edgeTargets(node: cdk.Node): string[] {

        const props = node.attributes.get("aws:cdk:cloudformation:props")
        if (props == undefined)
            return Array<string>()

        const targets = Array.from(this.scrapePossibleEdgeTargets(props as string))

        return targets.map(path => AwsDiagramGenerator.sanitizeComponentId(path))
    }

    scrapePossibleEdgeTargets(object: null | string | Record<string, unknown>): Set<string> {

        if (object === null || typeof object === "string") // end recursion
            return new Set<string>()

        const edgeTargets = new Set<string>()

        for (const key in object) {
            if (key === "Fn::GetAtt" && object[key][0] !== undefined) {
                this.scrapeAllStrings(object[key]).forEach(it => {
                edgeTargets.add(it)
            }
                )
            }
            if (key === "Ref" && (typeof object[key] === "string")) {
                this.scrapeAllStrings(object[key]).forEach(
                    it => {
                        edgeTargets.add(it)
                    }
                )
            }

            this.scrapePossibleEdgeTargets(object[key] as Record<string, unknown>).forEach(target => {
                edgeTargets.add(target)
            })
        }

        return edgeTargets
    }

    scrapeAllStrings(object: any): Set<string> {

        if (object === null || object === undefined) {
            return new Set<string>()
        }

        if (typeof object === "string") {
            const set = new Set<string>()
            set.add(object)
            return set

        }

        if (Array.isArray(object)) {
            const array = (object as Array<any>).map(it => {
                return Array.from(this.scrapeAllStrings(it))
            })
            const strings = _.flatten(array)
            return new Set<string>(strings)
        }

        const edgeTargets = new Set<string>()

        if (typeof object === "object") {
            for (const key in object) {
                if (key === "Fn::GetAtt" && object[key][0] !== undefined) {
                    edgeTargets.add(object[key][0])
                }
                if (key === "Ref" && (typeof object[key] === "string")) {
                    edgeTargets.add(object[key] as string)
                }

                this.scrapePossibleEdgeTargets(object[key] as Record<string, unknown>).forEach(target => {
                    edgeTargets.add(target)
                })
            }
        }

        return edgeTargets
    }

}
