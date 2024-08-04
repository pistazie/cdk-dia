export class Tree {
    version: string
    tree: Node

    static fromObject(object: Record<string, unknown>): Tree {
        const tree = new Tree()
        tree.version = object['version'] as string
        tree.tree = Node.fromObject(object['tree'] as Record<string, unknown>)

        return tree
    }
}

export enum ConstructInfoFqnType{
    STACK,
    STAGE,
    APP,
    CUSTOM_RESOURCE
}

export class ConstructInfoFqn {

    static of = (val: string): ConstructInfoFqn | undefined => {

        switch (val){
            case "aws-cdk-lib.Stack":
                return new ConstructInfoFqn(ConstructInfoFqnType.STACK)

            case "aws-cdk-lib.Stage":
                return new ConstructInfoFqn(ConstructInfoFqnType.STAGE)

            case "aws-cdk-lib.App":
                return new ConstructInfoFqn(ConstructInfoFqnType.APP)

            case "aws-cdk-lib.CustomResource":
                return new ConstructInfoFqn(ConstructInfoFqnType.CUSTOM_RESOURCE)

            default:
                return undefined
        }
    }

    constructor(cdkType: ConstructInfoFqnType) {
        this.typ = cdkType
    }

    readonly typ: ConstructInfoFqnType
}

export class Node {
    id: string
    path: string
    children: Map<string, Node>
    attributes: Map<string, string | Node | Record<string, string>>
    constructInfoFqn: ConstructInfoFqn | undefined = undefined

    findInSubTree(predicate: (Node) => boolean): Node | null {
        if (predicate(this)) return this

        const childrenArr: [string, Node][] = Array.from(this.children)
        for (const childrenKey in childrenArr) {
            const node = childrenArr[childrenKey][1].findInSubTree(predicate)
            if (node != null) return node
        }

        return null
    }

    static fromObject(object: Record<string, unknown | Record<string, string>>): Node {
        const node = new Node()
        node.id = object['id'] as string
        node.path = object['path'] as string

        node.children = new Map<string, Node>()
        if (object['children'] != undefined) {
            for (const childKey in object['children'] as Record<string, string>) {
                node.children.set(childKey, Node.fromObject(object['children'][childKey]))
            }
        }

        node.attributes = new Map<string, Node>()
        if (object['attributes'] != undefined) {
            for (const attrKey in object['attributes'] as Record<string, string>) {
                node.attributes.set(attrKey, object['attributes'][attrKey])
            }
        }

        if (object['constructInfo'] != undefined && object['constructInfo']['fqn'] != undefined) {
            node.constructInfoFqn = ConstructInfoFqn.of(object['constructInfo']['fqn'])
        }
        return node
    }
}
