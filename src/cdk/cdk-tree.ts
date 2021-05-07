
export class Tree {
    version: string
    tree: Node

    static fromObject(object: Record<string, unknown>) : Tree {
        const tree = new Tree()
        tree.version = object['version'] as string
        tree.tree = Node.fromObject(object['tree'] as Record<string, unknown>)

        return tree
    }
}

export class ConstructInfoFqn {

    public static STACK = new ConstructInfoFqn("@aws-cdk/core.Stack")
    public static STAGE = new ConstructInfoFqn("@aws-cdk/core.Stage")
    public static APP = new ConstructInfoFqn("@aws-cdk/core.App")
    public static CUSTOM_RESOURCE = new ConstructInfoFqn("@aws-cdk/core.CustomResource")

    static of = (val: string): ConstructInfoFqn | undefined =>
        [
            ConstructInfoFqn.STACK,
            ConstructInfoFqn.STAGE,
            ConstructInfoFqn.APP,
            ConstructInfoFqn.CUSTOM_RESOURCE
        ].find(fqn => fqn.cdkVal === val);

    constructor(cdkVal: string) {
        this.cdkVal = cdkVal
    }

    readonly cdkVal: string
}

export class Node {
    id: string
    path: string
    children: Map<string,Node>
    attributes: Map<string,string | Node | Record<string, string>>
    constructInfoFqn: ConstructInfoFqn | undefined = undefined

    pathParts = (): Array<string> => this.path.split("/")

    findInSubTree(predicate: (Node) => boolean): Node | null{
        if (predicate(this)) return this

        const childrenArr: [string, Node][] = Array.from(this.children)
        for (const childrenKey in childrenArr) {
            const node = childrenArr[childrenKey][1].findInSubTree(predicate)
            if (node != null) return node
        }

        return null
    }

    static fromObject(object: Record<string, unknown | Record<string, string>>) : Node {
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
                node.attributes.set(attrKey,object['attributes'][attrKey])
            }
        }

        if (object['constructInfo'] != undefined && object['constructInfo']['fqn'] != undefined) {
            node.constructInfoFqn = ConstructInfoFqn.of(object['constructInfo']['fqn'])
        }

        return node
    }
}
