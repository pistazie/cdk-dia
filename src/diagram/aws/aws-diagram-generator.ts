import * as _ from "lodash"
import * as cdk from "../../cdk"
import {CdkDia} from "../../cdk"
import {AwsEdgeResolver} from "./aws-edge-resolver"
import {AwsIconSupplier, Component, ComponentTags, Diagram, DiagramComponent, DiagramGenerator, RootComponent} from ".."
import {ComponentIcon} from "../component/icon"
import {CollapseTypes, CollapssingCustomizer} from "../component/customizable-attribute"
import {StackExportsContainer} from "./stack-exports-container"

/**
 * Generates a Diagram from a CdkTree
 */
export class AwsDiagramGenerator extends DiagramGenerator{

    private readonly edgeResolver : AwsEdgeResolver
    private readonly iconSupplier: AwsIconSupplier

    constructor(edgeResolver: AwsEdgeResolver, iconSupplier: AwsIconSupplier) {
        super()
        this.edgeResolver = edgeResolver
        this.iconSupplier = iconSupplier
    }

    generate(cdkTree: cdk.Tree, collapse: boolean, collapseDoubleClusters: boolean, includedStacks: string[] | false = false, excludedStacks: string[] | undefined = undefined): Diagram {

        const diagram = new Diagram()
        const cdkRoot = cdkTree.tree

        // build diagram Components tree
        diagram.root = this.generateComponentsTree(cdkRoot)

        // remove non-requested Stacks from the diagram
        if (includedStacks !== false) this.removeNonIncludedDiagrams(diagram, includedStacks)

        // remove excluded Stacks from the diagram
        if (excludedStacks) this.removeExcludedStacks(diagram, excludedStacks)

        // add edges between Components
        this.edgeResolver.resolveEdges(cdkRoot, diagram)

        // collapse CDK constructs to single Components (useful as many times the internal details of a component are not diagram relevant)
        if (collapse) this.collapseCdkConstructs(diagram.root)

        // remove CDK Assets (useful as they are usually not diagram relevant)
        this.removeCdkAssets(diagram.root)

        // collapse "DoubleClusters" - components which have only one child which is a Cluster it self - prevents multiple frames
        if (collapseDoubleClusters) diagram.root = this.collapseDoubleClusters(diagram.root)

        // remove cross-stack edges as they make diagrams very "loaded" and "verbose". should allow user to override this as in small CDK apps it does male sense to connect
        this.removeCrossStackEdges(diagram.root)

        this.removeSelfLinks(diagram.root)

        return diagram
    }

    private generateComponentsTree(cdkRoot: cdk.Node): RootComponent {

        const root = new RootComponent(cdkRoot.id)

        cdkRoot.children.forEach((value) => {
            const component = this.generateSubTree(value, root)

            if (component != null && value.constructInfoFqn === undefined) { // no fqn data - we assume all depth 1 nodes are stacks
                component.tags.set(ComponentTags.isCdkStack, "true")
            }

            if (component != null) {
                root.addSubComponent(component)
            }
        })

        return root
    }

    private generateSubTree(cdkNode: cdk.Node, parentComponent: Component): Component | null {

        const component = this.generateComponent(cdkNode,parentComponent)

        if (component == null) return null

        cdkNode.children.forEach((child) => {
                const childComponent = this.generateSubTree(child, component)

                if (childComponent != null) component.addSubComponent(childComponent)
        })

        return component
    }

    private generateComponent(cdkNode: cdk.Node, parentComponent: Component): Component | null {

        const {cfnType, label} = AwsDiagramGenerator.cfnProps(cdkNode)

        let component: Component

        if (cfnType != null) {
            component = this.generateCfnComponent(cdkNode, cfnType, label, parentComponent)
        } else {

            const relevantNode = cdkNode.findInSubTree(node => {
                return AwsDiagramGenerator.hasCfnProps(node)
            })

            if (relevantNode == null) return null // nothing relevant to diagram in this subtree

            component = new DiagramComponent(AwsDiagramGenerator.sanitizeComponentId(cdkNode.path), [cdkNode.id], parentComponent)
        }

        if (cdkNode.constructInfoFqn && cdkNode.constructInfoFqn.typ === cdk.ConstructInfoFqnType.STACK) {
            component.tags.set(ComponentTags.isCdkStack, "true")

            const exportsNode = cdkNode.children.get('Exports')
            if (exportsNode) {
                try {
                    component.stackExportsContainer = StackExportsContainer.fromComponent(exportsNode)
                } catch (e) {}
            }
        }

        if (cdkNode.constructInfoFqn && cdkNode.constructInfoFqn.typ === cdk.ConstructInfoFqnType.STAGE) {
            component.tags.set(ComponentTags.isCdkStage, "true")
        }

        this.applyAttributeSetCustomizers(cdkNode, component)

        return component
    }

    private removeNonIncludedDiagrams(diagram: Diagram, includedStackIds: string[]) {

        const excludedStacks: Component[] = []
        const includedStacks: Component[] = []

        diagram.root.subTreeApplyAllComponents( (component: Component) => {
            const isStack = this.isStack(component)
            const idIncluded = this.idInList(includedStackIds, component)
            if (isStack){
                if (!idIncluded) {
                    excludedStacks.push(component)
                } else {
                    includedStacks.push(component)
                }
            }
        })

        diagram.root.subTreeApplyAllComponents( (component: Component) => {

            const inExcludedStack = excludedStacks.find( excludedStack => component.isAncestor(excludedStack)) != null
            const inIncludedStack = includedStacks.find( includedStack => component.isAncestor(includedStack)) != null
            const isStack = this.isStack(component)
            const isIncludedStack = excludedStacks.includes(component)

            const containsIncludedStack = component.subTreeFindComponent(subComponent => {
                return this.isStack(subComponent) && this.idInList(includedStackIds, subComponent)
            })


            if ((inExcludedStack && !inIncludedStack && !containsIncludedStack) ||
                (isStack && !containsIncludedStack && isIncludedStack)
            ){
                component.destroyAndDetach()
            }
        })
    }

    private removeExcludedStacks(diagram: Diagram, excludedStackIds: string[]) {

        diagram.root.subTreeApplyAllComponents((component: Component) => {
            const isStack = this.isStack(component)
            const idExcluded = this.idInList(excludedStackIds, component)
            if (isStack && idExcluded) {
                component.destroyAndDetach()
            }
        })
    }

    private isStack(component: Component) {
        return component.tags.get(ComponentTags.isCdkStack) == "true"
    }

    private idInList(includedStacks: string[], component: Component) {
        return includedStacks.map(it => it.toLowerCase()).includes(component.id.toLowerCase())
    }

    private applyAttributeSetCustomizers(tree: cdk.Node,component: Component) {
        tree.attributes.forEach( (value: string, key: string) => {

            if (key.startsWith(CdkDia.attrPrefix)){
                switch (key.substr(CdkDia.attrPrefix.length)){
                    case CollapssingCustomizer.name:
                        CollapssingCustomizer.fromAttributeValue(value).customize(component)
                        break;
                    default:
                        throw new Error(`Unknown customizer ${key}`)
                }
            }
        })
    }

    private generateCfnComponent(node: cdk.Node, cfnType: string, cleanedResource: string, parent: Component): DiagramComponent {

        const component = new DiagramComponent(
            AwsDiagramGenerator.sanitizeComponentId(node.path),
            AwsDiagramGenerator.cleanLabel([cleanedResource, node.id]),
            parent)

        const icon: ComponentIcon = this.iconSupplier.matchIcon(cfnType, node.attributes.get("aws:cdk:cloudformation:props") as Record<string, string>)

        if (icon !== null) {
            component.setIcon(icon)
        } else {
            // generate longer label instead of the icon
            component.label = [
                ...cfnType.split("::").slice(1).map(it => { return it.toUpperCase() }),
                node.id
                ]
        }

        component.label = component.label.filter( it => { return it.toUpperCase() != "RESOURCE" })

        return component
    }

    private static cfnProps(tree: cdk.Node): { cfnType: string | null; label: string | null } {

        const cfnTypeAttr = tree.attributes.get("aws:cdk:cloudformation:type")

        if (cfnTypeAttr !== undefined) {
            return AwsDiagramGenerator.generateCfnProps(cfnTypeAttr as string)
        }


        if (tree.constructInfoFqn && tree.constructInfoFqn.typ === cdk.ConstructInfoFqnType.CUSTOM_RESOURCE) {
            return AwsDiagramGenerator.generateCfnProps("AWS::CloudFormation::CustomResource")
        }

        return {cfnType: null, label: null}
    }

    private static generateCfnProps(cfnType: string) {
        const label = cfnType.split("::").slice(1).join(" ")
        return {cfnType: cfnType, label: label}
    }

    private static hasCfnProps(node: cdk.Node): boolean {
        const {cfnType} = AwsDiagramGenerator.cfnProps(node)
        return cfnType != null || node.constructInfoFqn !== undefined
    }

    private collapseCdkConstructs(node: Component) {

        const collapsingCustomization = node.tags.get(ComponentTags.collapssingOverride)

        const forceCollapsed = collapsingCustomization === CollapseTypes.FORCE_COLLAPSE
        const forceNonCollapsedRecursive = collapsingCustomization === CollapseTypes.FORCE_NON_COLLAPSE_RECURSIVE
        const forceNonCollapsed = forceNonCollapsedRecursive || collapsingCustomization === CollapseTypes.FORCE_NON_COLLAPSE

        if (forceCollapsed){
            return this.collapseSubtreeToNode(node, node.subComponents()[0])
        }

        // find whether this looks like a CDK construct - has a subComponent named "Resource"
        const resourceComponent = Array.from(node.subComponents()).find(it => {
            const parts = it.idPathParts()
            return parts[parts.length - 1] == "Resource"
        })

        if (resourceComponent !== undefined && !forceNonCollapsed) {
            return this.collapseSubtreeToNode(node, resourceComponent)
        } else {
            if (!forceNonCollapsedRecursive) {
                node.subComponents().forEach(sub => {
                    this.collapseCdkConstructs(sub)
                })
            }
        }
    }

    private collapseSubtreeToNode(parent: Component, resource: Component) {

        if (parent == null || resource == null) return

        parent.icon = resource.icon
        resource.collapseToParent()
        return resource
    }

    /**
     * Removes CDK local Assets from the diagram tree
     */
    private removeCdkAssets(node: Component) {
        // find whether this looks like a CDK local Asset
        node.subComponents().forEach(sub => {
            const subSubComponentIds: string[] = sub.subComponents().map(subSubComponent => { return subSubComponent.id })
            if (subSubComponentIds.length == 3 &&
                subSubComponentIds.find(it => { return it.endsWith("S3Bucket")}) !== undefined &&
                subSubComponentIds.find(it => { return it.endsWith("S3VersionKey")}) !== undefined &&
                subSubComponentIds.find(it => { return it.endsWith("ArtifactHash")}) !== undefined
            ){
                sub.removeAndDestroyAllSubComponents()
                node.removeSubComponent(sub)
            } else {
                this.removeCdkAssets(sub)
            }
        })
    }

    private collapseDoubleClusters(root: Component) {

        root.subComponents().forEach( component => {
            const newComponent = this.collapseDoubleClusters(component)
            if (component !== newComponent){ // collapse
                if (
                    component.tags.get(ComponentTags.isCdkStack) !== "true" &&
                    component.tags.get(ComponentTags.isCdkStage) !== "true"

                ) {
                    root.replaceSubComponent(component,newComponent)
                }
            }
        })

        const components = root.subComponents()
        if (components.length == 1) {
            const single = components[0]
            return single
        }
        return root
    }

    private removeCrossStackEdges(current: Component) {

        if ((current instanceof DiagramComponent) && current.tags.get(ComponentTags.isCdkStack) == "true") {

            try {
                const stackRootComponent = current.treeAncestorWithTag(ComponentTags.isCdkStack, "true")

                    current.links.getLinkedComponents().forEach(linkedComponent => {
                        // check if linked component is in the same stack as current
                        if (!stackRootComponent.componentIsInSubTree(linkedComponent)) {
                            current.links.removeLink(linkedComponent)

                            // add a link between the stacks as a replacement to the many cross stack resource links
                            if (linkedComponent instanceof DiagramComponent) {
                            stackRootComponent.links.addLink(linkedComponent.treeAncestorWithTag(ComponentTags.isCdkStack, "true"))
                            }
                        }
                    })
            } catch (e) {
                console.log("CrossStackEdges removal failed " + e)
            }
        }

        current.subComponents().forEach( sub => {
            this.removeCrossStackEdges(sub)
        })
    }

    private removeSelfLinks(current: Component) {
        current.links.getLinkedComponents().forEach( link => {
            if (link == current) {
                current.links.removeLink(link)
            }
        })

        current.subComponents().forEach( sub => { this.removeSelfLinks(sub) })
    }

    // static helper methods
    static sanitizeComponentId = (path: string): string => path.replace(RegExp(":", "g"), "_")
    private static cleanLabel = (label: string[]) => {

        if (label.length>1 && label[label.length -1] == "Resource")
            return label.slice(0,label.length -1)

        return label
    }
}
