import * as fs from "fs"
import * as path from "path"
import {ComponentIcon, ComponentIconFormat} from "../component/icon"

export class AwsIconSupplier {

    private readonly resourceToImageMapping: IResourceToImageMapping[]
    private readonly iconsBasePath: string

    constructor(iconsBasePath : string) {
        this.iconsBasePath = iconsBasePath
        const resourceToImageMappingData = fs.readFileSync(path.join(__dirname,"awsResouceIconMatches.json")).toString()
        this.resourceToImageMapping = JSON.parse(resourceToImageMappingData) as IResourceToImageMapping[]
    }

    matchIcon(resourceType: string, resourceProps: Record<string, string>): ComponentIcon | null {

        switch (resourceType){
            case "AWS::EC2::Instance":
                  return this.matchEC2InstanceImage(resourceProps)
            default: {
                const prefix = resourceType.split("::").slice(0, 2).join("::")
                const mappingGroup = this.resourceToImageMapping.find(mapping => {
                    return mapping.resourcePrefix == prefix
                })
                if (mappingGroup != undefined) {
                    const specific = mappingGroup.specificResources.find(it => {
                        return it.resourceType == resourceType
                    })
                    if (specific != undefined && specific.filePath != undefined && specific.filePath.length > 0) {
                        return new ComponentIcon(path.join(this.iconsBasePath, specific.filePath))
                    } else {
                        if (mappingGroup['genericFilePath'] !== undefined) {
                            if (mappingGroup['genericFilePath'] === null)
                                return new ComponentIcon(null, ComponentIconFormat.SMALLER)
                            else
                                return new ComponentIcon(path.join(this.iconsBasePath, mappingGroup.genericFilePath), ComponentIconFormat.SMALLER)
                        }
                    }
                }
            }
        }
        return null
    }

    private matchEC2InstanceImage(awsresourceProps: Record<string, string>): ComponentIcon {
        const ec2ImagesNode = this.resourceToImageMapping.find(mapping => { return mapping.resourcePrefix == "AWS::EC2"})
        const ec2Images = ec2ImagesNode.specificResources.find(mapping => { return mapping.resourceType == "AWS::EC2::Instance"})

            if (awsresourceProps["instanceType"] !== undefined && awsresourceProps["instanceType"].split(".").length == 2){
                const instanceFamily = (awsresourceProps["instanceType"].split("."))[0]
                if (ec2Images["families"][instanceFamily.toUpperCase()] !== undefined){
                    return new ComponentIcon(path.join(this.iconsBasePath, ec2Images["families"][instanceFamily.toUpperCase()]))
                }
            }
        return new ComponentIcon(path.join(this.iconsBasePath, ec2Images["filePath"]))
    }
}

export interface IResourceToImageMapping {
    resourcePrefix: string
    genericFilePath: string
    specificResources: IResourceToImageMappingSpecificResource[]
}
export interface IResourceToImageMappingSpecificResource {
    resourceType: string
    filePath: string
}
