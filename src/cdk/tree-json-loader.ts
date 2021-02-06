import * as fs from "fs"
import {Tree} from "./cdk-tree"

export class TreeJsonLoader {

    static load(filePath: string) : Tree{

        const treeJson = fs.readFileSync(filePath).toString()
        return Tree.fromObject(JSON.parse(treeJson))
    }

}