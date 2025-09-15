import * as fs from "fs"
import * as path from "path"
import {Tree} from "./cdk-tree"

interface ManifestArtifact {
    metadata?: {
        [path: string]: Array<{
            type: string;
            data: any;
        }>;
    };
}

export class EnhancedTreeLoader {

    static load(filePath: string): Tree {
        // Load tree.json
        const treeJson = fs.readFileSync(filePath).toString()
        const treeObject = JSON.parse(treeJson)
        
        // Try to load manifest.json from the same directory
        const manifestPath = path.join(path.dirname(filePath), 'manifest.json')
        let manifestMetadata: { [path: string]: Array<{type: string; data: any}> } = {}
        
        try {
            if (fs.existsSync(manifestPath)) {
                const manifestJson = fs.readFileSync(manifestPath).toString()
                const manifest = JSON.parse(manifestJson)
                manifestMetadata = this.extractMetadataFromManifest(manifest)
            }
        } catch (error) {
            // If manifest.json can't be read, continue without it
            console.warn(`Warning: Could not read manifest.json: ${error}`)
        }

        // Enhance tree object with manifest metadata
        const enhancedTreeObject = this.mergeManifestMetadata(treeObject, manifestMetadata)
        
        return Tree.fromObject(enhancedTreeObject)
    }

    private static extractMetadataFromManifest(manifest: any): { [path: string]: Array<{type: string; data: any}> } {
        const metadata: { [path: string]: Array<{type: string; data: any}> } = {}
        
        if (manifest.artifacts) {
            for (const [, artifact] of Object.entries(manifest.artifacts)) {
                const artifactObj = artifact as ManifestArtifact
                if (artifactObj.metadata) {
                    for (const [constructPath, metadataArray] of Object.entries(artifactObj.metadata)) {
                        // Remove leading slash but keep the full path from the stack level
                        const cleanPath = constructPath.replace(/^\//, '')
                        if (!metadata[cleanPath]) {
                            metadata[cleanPath] = []
                        }
                        metadata[cleanPath] = metadata[cleanPath].concat(metadataArray)
                    }
                }
            }
        }
        
        return metadata
    }

    private static mergeManifestMetadata(treeObject: any, manifestMetadata: { [path: string]: Array<{type: string; data: any}> }): any {
        // Enhance the tree portion, not the root object
        const enhancedTreeObject = { ...treeObject }
        if (enhancedTreeObject.tree) {
            enhancedTreeObject.tree = this.enhanceNode(enhancedTreeObject.tree, manifestMetadata, '')
        }
        return enhancedTreeObject
    }

    private static enhanceNode(node: any, manifestMetadata: { [path: string]: Array<{type: string; data: any}> }, currentPath: string): any {
        if (typeof node !== 'object' || node === null) {
            return node
        }

        // Create a copy of the node to avoid mutation
        const enhancedNode = { ...node }
        


        // Check for manifest metadata and apply it to the node's metadata structure
        const manifestMeta = manifestMetadata[currentPath]

        
        if (manifestMeta && Array.isArray(manifestMeta)) {
            // Initialize metadata object if it doesn't exist
            if (!enhancedNode.metadata) {
                enhancedNode.metadata = {}
            }
            
            // Group manifest metadata by type
            const metadataByType: { [type: string]: any[] } = {}
            for (const meta of manifestMeta) {
                if (!metadataByType[meta.type]) {
                    metadataByType[meta.type] = []
                }
                metadataByType[meta.type].push(meta.data)
            }
            
            // Merge with existing metadata
            for (const [type, dataArray] of Object.entries(metadataByType)) {
                if (enhancedNode.metadata[type]) {
                    enhancedNode.metadata[type] = [...enhancedNode.metadata[type], ...dataArray]
                } else {
                    enhancedNode.metadata[type] = dataArray
                }
            }
            

        }

        // Recursively enhance children
        if (enhancedNode.children) {
            const enhancedChildren: any = {}
            for (const [childName, child] of Object.entries(enhancedNode.children)) {
                const childPath = currentPath ? `${currentPath}/${childName}` : childName
                enhancedChildren[childName] = this.enhanceNode(child, manifestMetadata, childPath)
            }
            enhancedNode.children = enhancedChildren
        }

        return enhancedNode
    }
}