/**
 *
 * Handles the exporting of scenes to html, data.js index.js and pannellum files (pannellum.js and pannellum.css)
 *
 * @constructor
 */

'use client'


import JSZip from "jszip";
import { saveAs } from 'file-saver';
import {stringify} from "flatted";


let fileCount = 0
let createMediaFiles = {
    "previews": [],
    "panoramas": [],
    "config": {},
    "indexJS": null,
    "jqueryJS": null,
    "pannellumJS": null,
    "pannellumCSS": null,
    "tailwindJS": null,
    "indexHTML": null,
    "panoramaListImage": null,
    "infoImage": null,
    "info_72_image": null,
    "videosImage": null,
    "pauseImage": null,
    "imagesImage": null,
    "upArrowImage": null,

}


function deepCloneWithFunctions(obj) {
    const cache = new WeakMap();

    function clone(value) {
        if (typeof value === "function") {
            return value; // Keep function reference
        }
        if (value instanceof HTMLElement) {
            return value.cloneNode(true); // Clone HTML elements
        }
        if (typeof value === "object" && value !== null) {
            if (cache.has(value)) return cache.get(value); // Handle circular references

            const copy = Array.isArray(value) ? [] : {};
            cache.set(value, copy);

            for (const key in value) {
                copy[key] = clone(value[key]); // Recursively copy properties
            }
            return copy;
        }
        return value; // Return primitive values directly
    }

    return clone(obj);
}

function createJSONFile(config, hotspotConfiguration, scenes, projectTitle) {



    let newConfig = deepCloneWithFunctions(config)



    Object.keys(newConfig.scenes).map(scene => {
        let hotspots = newConfig.scenes[scene].hotSpots
        console.log("old hotspots", hotspots)
        let newHotspotsArray = []
        hotspots.map(((hotspot, index) =>{
            let newHotspot = {}
            newHotspot = hotspot
            delete  newHotspot.clickHandlerFunc
            delete newHotspot.createTooltipArgs
            delete newHotspot.div
            delete newHotspot.createTooltipFunc



            //set the target pitch and yaw for the scene
            let sceneId = newHotspot.sceneID
            let targetPitch = 0
            let targetYaw = 0
            if(sceneId){
                targetPitch = scenes[sceneId].initialPitch
                targetYaw = scenes[sceneId].initialYaw
            }
            newHotspot.targetPitch = targetPitch
            newHotspot.targetYaw = targetYaw

            //convert hotspot image to file
            if(newHotspot.sceneImage){
                //newHotspot.sceneImage = blobToFile(newHotspot.sceneImage, newHotspot.sceneID + "_preview_" + fileCount)
                createMediaFiles.previews.push({
                    name: "preview_" + newHotspot.sceneID + "_" + fileCount,
                    image: newHotspot.sceneImage,
                    hotspotId: newHotspot.id})
                fileCount++
            }


            //only add the hotspot if it is not empty
            if(hotspot.id){
                newHotspotsArray.push(newHotspot)
            }

        }))
        newConfig.scenes[scene].hotSpots = newHotspotsArray

        //convert scenes panoramas to files
        //newConfig.scenes[scene].panorama = blobToFile(newConfig.scenes[scene].panorama, scene + "_scene_" + fileCount)
        createMediaFiles.panoramas.push({
            name: scene,
            image:  newConfig.scenes[scene].panorama,
            sceneUID: newConfig.scenes[scene].sceneUID,

        })
        fileCount++

    })


    console.log("separate config", hotspotConfiguration)

    console.log("old config", config)
console.log("config clone", newConfig)





    createMediaFiles.config = {
        projectTitle: projectTitle,
        "default": {
            "firstScene": Object.keys(newConfig.scenes)[0],
            "sceneFadeDuration": 1500
        },
        scenes: {}
    }

    // console.log("configs match?", newConfig === config)

    // console.log("final config", createMediaFiles.config)
    // console.log("final config scenes", createMediaFiles.config.scenes)
    //
    // console.log("newConfig scenes", newConfig.scenes)

    Object.keys(newConfig.scenes).map((scene, index) => {
        console.log(`index: ${ index } scene: ${scene}`)
        createMediaFiles.config.scenes[scene] = newConfig.scenes[scene]
    })
    console.log("config is", createMediaFiles.config)

    return createMediaFiles.config
}

async function zipFiles(projectTitle, finalConfigJSON){

    console.log("received old config", createMediaFiles.config)

    console.log("media files", createMediaFiles)

    const zip = new JSZip()
    await zip.folder('').file('index.js', createMediaFiles.indexJS)
    await zip.folder('').file('index.html', createMediaFiles.indexHTML)




    const previewFilePromise = createMediaFiles.previews.map(async (preview) => {
        console.log("preview", preview)
        const response = await fetch(preview.image)
        const blobFromUrl = await response.blob()
        const extension = blobFromUrl.type.split('/')[1]
        console.log("extension", extension)
        zip.folder("images/previews").file(`${preview.name}.${extension}`, blobFromUrl)

        //change sceneImage of hotspot  in config
        Object.keys(createMediaFiles.config.scenes).map(scene => {
            createMediaFiles.config.scenes[scene].hotSpots.map(hotSpot => {
                if(hotSpot.id === preview.hotspotId){
                    console.log("changing hotspot in config")
                    hotSpot.sceneImage = `images/previews/${preview.name}.${extension}`
                }
            })
        })

    })
    const panoramaFilePromise =  createMediaFiles.panoramas.map(async (panorama) => {
        const response = await fetch(panorama.image)
        const blobFromUrl = await response.blob()
        const extension = blobFromUrl.type.split('/')[1]

        zip.folder('images/panoramas').file(`${panorama.name}.${extension}`, blobFromUrl)

        //change panorama image in config
        Object.keys(createMediaFiles.config.scenes).map(scene => {
            if(createMediaFiles.config.scenes[scene].sceneUID === panorama.sceneUID){
                console.log("changing old panorama to file")
               createMediaFiles.config.scenes[scene].panorama = `images/panoramas/${panorama.name}.${extension}`
                console.log("created config", createMediaFiles.config)
            }
        })

    })


    zip.folder('libraries').file('jquery.min.js', createMediaFiles.jqueryJS)

    zip.folder('libraries').file('pannellum.css', createMediaFiles.pannellumCSS)
    zip.folder('libraries').file('pannellum.js', createMediaFiles.pannellumJS)
    zip.folder('libraries').file('tailwind.js', createMediaFiles.tailwindJS)


    zip.folder('images/utilities').file('panorama_list.png', createMediaFiles.panoramaListImage)
    zip.folder('images/utilities').file('videos.png', createMediaFiles.videosImage)
    zip.folder('images/utilities').file('pause.png', createMediaFiles.pauseImage)
    zip.folder('images/utilities').file('info.png', createMediaFiles.infoImage)
    zip.folder('images/utilities').file('info_72.png', createMediaFiles.info_72_image)
    zip.folder('images/utilities').file('up_arrow.png', createMediaFiles.upArrowImage)
    zip.folder('images/utilities').file('images.png', createMediaFiles.imagesImage)


    await Promise.all(panoramaFilePromise)
    await Promise.all(previewFilePromise)
    zip.folder('').file('config.json', JSON.stringify(finalConfigJSON, null, 2))
    // zip.folder('').file('config.json', stringify(finalConfigJSON, null, 2));
    console.log("stringified json is", stringify(finalConfigJSON, null, 2));

    const zipBlob = await zip.generateAsync({type: "blob"})
    console.log("zip", zip)
    await saveAs(zipBlob, `${projectTitle}.zip`)


}


export default async function ExportToFiles(dataConfig, hotspotDataConfig, scenes, projectTitle) {


    let response = await fetch('/ExportFiles/index.html')

        createMediaFiles.indexHTML = await response.blob()


       response = await fetch('/ExportFiles/libraries/index.js')

        createMediaFiles.indexJS = await response.text()


    response = await fetch('/ExportFiles/libraries/jquery.min.js')

    createMediaFiles.jqueryJS = await response.text()



    response = await fetch('/ExportFiles/libraries/pannellum.css')

    createMediaFiles.pannellumCSS = await response.text()



    response = await fetch('/ExportFiles/libraries/pannellum.js')

    createMediaFiles.pannellumJS = await response.text()



    response = await fetch('/ExportFiles/libraries/tailwind.js')

    createMediaFiles.tailwindJS = await response.text()


    response = await fetch('/ExportFiles/images/utilities/panorama_list.png')
    createMediaFiles.panoramaListImage = await response.blob()


    response = await fetch('/ExportFiles/images/utilities/info.png')
    createMediaFiles.infoImage = await response.blob()

    response = await fetch('/ExportFiles/images/utilities/info_72.png')
    createMediaFiles.info_72_image = await response.blob()

    response = await fetch('/ExportFiles/images/utilities/images.png')
    createMediaFiles.imagesImage = await response.blob()

    response = await fetch('ExportFiles/images/utilities/videos.png')
    createMediaFiles.videosImage = await response.blob()

    response = await fetch('ExportFiles/images/utilities/pause.png')
    createMediaFiles.pauseImage = await response.blob()

    response = await fetch('ExportFiles/images/utilities/up_arrow.png')
    createMediaFiles.upArrowImage = await response.blob()



    let dataConfigCopy = { ...dataConfig }


   let finalConfigJSON = createJSONFile(dataConfigCopy, hotspotDataConfig, scenes, projectTitle);
    console.log("final configuration", finalConfigJSON)

     await zipFiles(projectTitle, finalConfigJSON)


}

