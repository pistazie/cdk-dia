/**
 * Deletes any file (icons/images) which are not used for diagrams - useful for reducing package size
 */
import fs from "fs"
import path from "path"
import * as fg from "fast-glob"
import {IResourceToImageMapping} from "../src/diagram"

const resourceToImageMappingData = fs.readFileSync(path.join(__dirname,"../src/diagram/aws/awsResouceIconMatches.json")).toString()
const resourceToImageMapping = JSON.parse(resourceToImageMappingData) as IResourceToImageMapping[]

const usedIconPaths = new Set<string>()

resourceToImageMapping.forEach( it => {
    usedIconPaths.add(it.genericFilePath)
    it.specificResources.forEach( it => {
        usedIconPaths.add(it.filePath)
        if (it["families"] != undefined){
            Object.keys(it["families"]).forEach( family => {
                usedIconPaths.add(it["families"][family])
            })
        }
    })
})

const iconsLocation= "../"
fg.sync(`${iconsLocation}icons/aws/**`).forEach( file => {
    if (! usedIconPaths.has(file.slice(iconsLocation.length))) {
        fs.unlinkSync(file)
    } else {
        console.log("keeping " + file)
    }
})

