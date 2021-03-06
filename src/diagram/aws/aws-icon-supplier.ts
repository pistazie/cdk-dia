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
                  return this.matchEC2InstanceIcon(resourceProps)
            case "AWS::RDS::DBInstance":
                return this.matchRDSInstanceIcon(resourceProps)
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

    private matchEC2InstanceIcon(awsresourceProps: Record<string, string>): ComponentIcon {
        return this.instanceIconByFamily("AWS::EC2::Instance", "instanceType", 2, 0, awsresourceProps)
    }

    private matchRDSInstanceIcon(awsresourceProps: Record<string, string>): ComponentIcon {
        return this.instanceIconByFamily("AWS::RDS::DBInstance", "dbInstanceClass", 3, 1, awsresourceProps)
    }

    private instanceIconByFamily(
        cfnResource: string,
        instanceTypeAttribute: string,
        instanceTypeParts: number,
        instanceTypeFamilyPartInd: number,
        props: Record<string, string>) {

        const parentInstanceIconsNode = this.resourceToImageMapping.find(mapping => {
            return mapping.resourcePrefix == cfnResource.split("::").slice(0, 2).join("::")
        })

        const instanceIconsNode = parentInstanceIconsNode.specificResources.find(mapping => {
            return mapping.resourceType == cfnResource
        })

        if (props[instanceTypeAttribute] !== undefined && props[instanceTypeAttribute].split(".").length == instanceTypeParts) {

            const instanceFamily = (props[instanceTypeAttribute].split("."))[instanceTypeFamilyPartInd]

            if (instanceIconsNode["families"][instanceFamily.toUpperCase()] !== undefined) {
                return new ComponentIcon(path.join(this.iconsBasePath, instanceIconsNode["families"][instanceFamily.toUpperCase()]))
            }
        }

        return new ComponentIcon(path.join(this.iconsBasePath, instanceIconsNode["filePath"]))
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
