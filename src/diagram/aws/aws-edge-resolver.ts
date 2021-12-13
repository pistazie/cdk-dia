import {Diagram} from "../diagram"
import * as cdk from "../../cdk"
import * as _ from "lodash"
import {makeUniqueId} from "@aws-cdk/core/lib/private/uniqueid"
import {Component, ComponentTags} from "../component/component"
import {AwsDiagramGenerator} from "./aws-diagram-generator"
import {DiagramComponent} from "../component/diagram-component"
import {RootComponent} from "../component/root-component"
import {EdgeTarget, EdgeTargetSimpleString, EdgeTargetStackExport} from "./edge-target"

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

    private addEdge(targetString: EdgeTarget, originComponent: DiagramComponent) {

        const cdkStackTree = originComponent.treeAncestorWithTag(ComponentTags.isCdkStack, "true")

        if (cdkStackTree) {
            let targetComponent = this.findTargetComponent(cdkStackTree, targetString)

            if (targetComponent != null) {
                originComponent.links.addLink(targetComponent)
            }
        }
    }

    private findTargetComponent(cdkStackTree: Component, targetString: EdgeTarget): Component | null {

        if (targetString instanceof EdgeTargetSimpleString) {
            // perfect match
            const perfectMatch = cdkStackTree.subTreeFindComponent((component: Component) => {
                const uniqueResourceId = this.findUniqueResourceId(component)
                return targetString.value === uniqueResourceId
            })

            if (perfectMatch != null)
                return perfectMatch

            // lowerCase match
            return cdkStackTree.subTreeFindComponent((component: Component) => {
                const uniqueResourceId = this.findUniqueResourceId(component)
                return targetString.value.toLowerCase() === uniqueResourceId
            })
        }

        if (targetString instanceof EdgeTargetStackExport) {
            const treeRoot: RootComponent = cdkStackTree.treeRoot()

            const exportingStack = treeRoot.subTreeFindComponent((component: Component) => {
                return component.tags.get(ComponentTags.isCdkStack) && component.id == targetString.stackId
            })

            const targetComponentIdInTargetStack = exportingStack.stackExportsContainer.getExport(targetString)

            return exportingStack.subTreeFindComponent(component => {
                return this.findUniqueResourceId(component) == targetComponentIdInTargetStack
            })
        }
    }

    private findUniqueResourceId(component: Component): string | boolean {

        const stackDepth = component.treeAncestorWithTag(ComponentTags.isCdkStack, "true")
        const pathParts: string[] = component.idPathParts().slice(stackDepth.depth())

        if (pathParts.length === 0) return false

        return makeUniqueId(pathParts)
    }


    /**
     * Returns all possible edge targets pointing from [node]
     */
    private edgeTargets(node: cdk.Node): EdgeTarget[] {

        const props = node.attributes.get("aws:cdk:cloudformation:props")
        if (props == undefined)
            return Array<EdgeTarget>()

        return Array.from(this.scrapePossibleEdgeTargets(props as string))
    }

    scrapePossibleEdgeTargets(object: null | string | Record<string, unknown>): Array<EdgeTarget> {

        if (object === null || typeof object === "string") // end recursion
            return new Array<EdgeTarget>()

        const edgeTargets = new Array<EdgeTarget>()

        for (const key in object) {
            if (key === "Fn::GetAtt" && object[key][0] !== undefined) {
                this.scrapeAllStrings(object[key]).forEach(it => {
                        edgeTargets.push(it)
                    }
                )
            }

            if (key === "Fn::ImportValue" && object[key] !== undefined) {
                try {
                    edgeTargets.push(EdgeTargetStackExport.fromFnImportValue(object[key] as string))
                } catch (e) {}
            }

            if (key === "Ref" && (typeof object[key] === "string")) {
                edgeTargets.push(new EdgeTargetSimpleString(object[key] as string))
            }

            this.scrapePossibleEdgeTargets(object[key] as Record<string, unknown>).forEach(target => {
                edgeTargets.push(target)
            })
        }

        return _.uniqWith(edgeTargets, ((a: EdgeTarget, b: EdgeTarget) => a.isEqual(b)))
    }

    scrapeAllStrings(object: any): Set<EdgeTarget> {

        if (object === null || object === undefined) {
            return new Set<EdgeTarget>()
        }

        if (typeof object === "string") {
            return new Set<EdgeTarget>([new EdgeTargetSimpleString(object)])
        }

        if (Array.isArray(object)) {
            const array: EdgeTarget[][] = (object as Array<any>).map(it => {
                return Array.from(this.scrapeAllStrings(it))
            })
            const strings: EdgeTarget[] = _.flatten(array)
            return new Set<EdgeTarget>(strings)
        }

        const edgeTargets = new Set<EdgeTarget>()

        if (typeof object === "object") {
            for (const key in object) {
                if (key === "Fn::GetAtt" && object[key][0] !== undefined) {
                    edgeTargets.add(new EdgeTargetSimpleString(object[key][0]))
                }
                if (key === "Ref" && (typeof object[key] === "string")) {
                    edgeTargets.add(new EdgeTargetSimpleString(object[key] as string))
                }

                this.scrapePossibleEdgeTargets(object[key] as Record<string, unknown>).forEach(target => {
                    edgeTargets.add(target)
                })
            }
        }

        return edgeTargets
    }
}
