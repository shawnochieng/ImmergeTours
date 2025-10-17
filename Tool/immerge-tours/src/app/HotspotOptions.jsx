'use client'


import {useEffect, useState} from "react";




export default function HotspotOptions({
                            dataID,
                            scenes, setSelectedViewScene, currentSceneName,
                            panoramaViewer, currentHotspot, hotspotConfig,
                                       }){
    // const {sceneFiles, setCurrentSceneFileName, } = useData()

    // const { panoramaViewer, currentHotspot, hotspotConfig} = useScenesData()
    const [currentHotspotType, setCurrentHotspotType] = useState(null)

    const [currentInfoHotspotText, setCurrentInfoHotspotText] = useState(null)


    //set the edit hotspot container visible to show scenes that the hotspot can link to
    function setEditHotspotVisible(){
        //check if currentHotspot is set first, otherwise do not set the editOptions container visible

        document.getElementById("editOptions").classList.remove("hidden")
    }

    useEffect(() => {
        if(panoramaViewer){
            let panoramaConfig = panoramaViewer.getConfig();
            let sceneConfig = panoramaConfig.scenes;
            Object.keys(sceneConfig).map((scene, index) => {
                let hotspots = sceneConfig[scene].hotSpots
                hotspots.forEach((hotspot, index) => {
                    if(hotspot.id === currentHotspot){
                        console.log("found hotspot", hotspot)
                        if(hotspot.type === "info"){
                            setCurrentHotspotType("info")
                            setCurrentInfoHotspotText(hotspot.infoText)
                        } else if (hotspot.type === "scene"){
                            setCurrentHotspotType("scene")
                        }
                    }
                })
            })
        }

    }, [currentHotspot]);

    //set the scene that the hotspot points to
    function linkScene(sceneName, sceneUID){
        console.log("sceneName", sceneName);
        let panoramaConfig = panoramaViewer.getConfig();

        console.log("panoramaConfig", panoramaConfig);
        let sceneConfig = panoramaConfig.scenes;
        Object.keys(panoramaConfig.scenes).map((scene, index) => {
            let hotspots = sceneConfig[scene].hotSpots
            console.log("hotspots", hotspots);
            console.log("scene hotspots", hotspots);
            hotspots.forEach((hotspot, index) => {

                // if(hotspot.id == dataID){
                if(hotspot.id === currentHotspot){
                    console.log("found hotspot")
                    //we are using sceneID instead of sceneId to avoid redirecting to new scene when the hotspot is clicked      //hotspot.sceneId = sceneName;
                     hotspot.sceneID = sceneUID;
                    // hotspot.sceneUID = sceneUID;
                    // hotspot.sceneUID = sceneUID;


                    console.log("hotspot altered", hotspot)
                    if(!hotspotConfig[hotspot.id]){
                        hotspotConfig[hotspot.id] = {}
                    }
                    hotspotConfig[hotspot.id].sceneName = sceneName
                    hotspotConfig[hotspot.id].sceneUID = sceneUID
                    console.log("hotspotConfig", hotspotConfig);

                    console.log("current scene", panoramaViewer.getScene())

                    //for change to take effect, remove and re-add the hotspot
                    panoramaViewer.removeHotSpot(hotspot.id)
                    panoramaViewer.addHotSpot(hotspot);
                }
            })
        })
    }

//delete the hotspot
    function deleteHotspot(){
        console.log("removing hotspot")
        panoramaViewer.removeHotSpot(currentHotspot)
    }

//go to the chosen scene
    function goToScene(){
        let panoramaConfig = panoramaViewer.getConfig();
        let sceneConfig = panoramaConfig.scenes;
        console.log("sceneConfig", sceneConfig)
        Object.keys(sceneConfig).map((scene, index) => {
            let hotspots = sceneConfig[scene].hotSpots
            console.log("hotspots", hotspots);
            console.log("scene hotspots", hotspots);
            hotspots.forEach((hotspot, index) => {
                if(hotspot.id === currentHotspot){
                    console.log("found hotspot", hotspot)

                    //change the current file to the scene file
                    Object.keys(scenes).map((scene_, index) => {
                       // if(scene_.name == hotspot.sceneId) {
                         if(scenes[scene_].sceneUID === hotspot.sceneID) {
                            console.log("scene_ matches scene ID")
                             //TODO: Check again for this functionality
                             // setCurrentSceneFileName(scene_.sceneUID)
                             setSelectedViewScene(scenes[scene_])
                        } else {
                            console.log(`mismatch: scene name: ${scenes[scene_].sceneUID}, hotspot sceneId: ${hotspot.sceneID}`)
                             console.log("scenes are", scenes)
                             console.log("scene is", scenes[scene_])
                        }
                    })
                }
            })
        })
    }


    //set the image that of the scene that the hotspot points to
    function setHotspotImage (event) {
        //check if currentHotspot is set first, otherwise do not bring up the file selection dialog
        if(currentHotspot){
            const chosenFiles = Array.from(event.target.files)
            //add file as a scene to list of scenes
            const blobUrl = URL.createObjectURL(chosenFiles[0]);
            let panoramaConfig = panoramaViewer.getConfig();
            let sceneConfig = panoramaConfig.scenes;
            Object.keys(panoramaConfig.scenes).map((scene, index) => {
                let hotspots = sceneConfig[scene].hotSpots
                console.log("hotspots", hotspots);
                console.log("scene hotspots", hotspots);
                hotspots.forEach((hotspot, index) => {

                    // if(hotspot.id == dataID){
                    if(hotspot.id === currentHotspot){

                        hotspot.sceneImage = blobUrl

                        if(!hotspotConfig[hotspot.id]){
                            hotspotConfig[hotspot.id] = {}
                        }
                        hotspotConfig[hotspot.id].sceneImage = blobUrl


                        console.log("hotspotConfig", hotspotConfig);

                        //for change to take effect, remove and read the hotspot
                        panoramaViewer.removeHotSpot(hotspot.id)
                        panoramaViewer.addHotSpot(hotspot);
                    }
                })
            })
        }
    }

    //set the text for the info hotspot
    function setInfoHotspotText(event) {
        let textValue = event.target.value;
        let panoramaConfig = panoramaViewer.getConfig();


        let sceneConfig = panoramaConfig.scenes;
        Object.keys(panoramaConfig.scenes).map((scene, index) => {
            let hotspots = sceneConfig[scene].hotSpots
            console.log("hotspots", hotspots);
            console.log("scene hotspots", hotspots);
            hotspots.forEach((hotspot, index) => {

                // if(hotspot.id == dataID){
                if(hotspot.id === currentHotspot){
                    console.log("found hotspot")
                    //we are using sceneID instead of sceneId to avoid redirecting to new scene when the hotspot is clicked      //hotspot.sceneId = sceneName;
                    hotspot.infoText = textValue;
                    console.log("hotspot altered", hotspot)
                    if(!hotspotConfig[hotspot.id]){
                        hotspotConfig[hotspot.id] = {}
                    }
                    // hotspotConfig[hotspot.id] = {}
                    hotspotConfig[hotspot.id].infoText = textValue
                    console.log("hotspotConfig", hotspotConfig);

                    //for change to take effect, remove and re-add the hotspot
                    panoramaViewer.removeHotSpot(hotspot.id)
                    panoramaViewer.addHotSpot(hotspot);
                }
            })
        })
    }

    function InfoHotspotOptionsDisplay() {
        return (
            <div className=" w-full pt-[2%]  mb-[1%] h-[70%] ">
                <div className="bg-cyan-200 h-full w-full">
                    <div className="w-full h-[10%] flex justify-center bg-pink-100">
                        <p className=" text-black font-adaminaFont font-bold"> Hotspot Options </p>
                    </div>
                    <div className=" h-[30%] w-full">
                        <p className="text-black font-aclonicaFont"> Hotspot: <br/> {currentHotspot} </p>
                        <div className="flex items-center justify-center space-x-[10%]">

                            <div className="relative group inline-block">
                                <button className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `} disabled={ !currentHotspot }> <img src="img/edit.png"  onClick={setEditHotspotVisible } className="w-full h-full"></img> </button>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Edit Text
                              </span>
                            </div>

                            <div className="relative group inline-block">
                                <button className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `} disabled={ !currentHotspot } onClick={deleteHotspot}> <img alt="delete hotspot" src="img/trash.png" className="w-full h-full"></img> </button>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Delete Info Hotspot
                              </span>
                            </div>

                        </div>

                    </div>

                    <div className=" hidden bg-yellow-100 h-[60%]  w-full " id="editOptions" data-options-id={dataID}>
                        <textarea type="text"  className="w-full h-full  whitespace-normal text-black font-aclonicaFont font-medium" onChange={setInfoHotspotText} placeholder={currentInfoHotspotText ? currentInfoHotspotText : ""}/>
                    </div>
                </div>
            </div>
        )
    }


    function SceneHotspotOptionsDisplay(){
        return (
            <div className=" w-full pt-[2%]  mb-[1%] h-[70%] ">
                <div className="bg-cyan-200 h-full w-full">
                    <div className="w-full h-[10%] flex justify-center bg-pink-100">
                        <p className=" text-black font-adaminaFont font-bold"> Hotspot Options </p>
                    </div>
                    <div className=" h-[30%] w-full">
                        <p className="text-black font-aclonicaFont"> Hotspot: <br/> {currentHotspot} </p>
                        <div className="flex items-center justify-center space-x-[10%]">
                            <div className="relative group inline-block">
                                <button className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `}  disabled={ !currentHotspot }> <img src="img/go_next.png"  className="w-full h-full" onClick={() => {
                                    goToScene(dataID);
                                }}></img> </button>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Go To Scene
                              </span>
                            </div>

                            <div className="relative group inline-block">
                                <button className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `} disabled={ !currentHotspot }> <img src="img/edit.png"  onClick={setEditHotspotVisible } className="w-full h-full"></img> </button>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Choose Scene
                              </span>
                            </div>

                            <div className="relative group inline-block">
                                <label htmlFor="file-scene-input" className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `}>
                                    <img src="img/image.png"   className="w-[20px] h-[20px]"></img>

                                </label>
                                <input type="file" disabled={ !currentHotspot } id="file-scene-input" name="sceneFiles" onChange={setHotspotImage} className="hidden"
                                       accept="image/jpeg, image/png, image/jpg"/>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Scene Image
                              </span>
                            </div>

                            <div className="relative group inline-block">
                                <button className={` w-[20px] h-[20px] ${currentHotspot ?"opacity-100 cursor-pointer"  : "opacity-50 cursor-not-allowed"} `} disabled={ !currentHotspot } onClick={deleteHotspot}> <img alt="delete hotspot" src="img/trash.png" className="w-full h-full"></img> </button>
                                <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                Delete Hotspot
                              </span>
                            </div>

                        </div>

                    </div>

                    <div className=" hidden bg-yellow-100 h-[60%]  w-full " id="editOptions" data-options-id={dataID}>
                        <div className="h-[25%] w-[full] bg-gray-400">
                            <p className="text-white font-adaminaFont font-medium">Select target scene:</p>
                        </div>
                        <div className="h-[75%] w-full overflow-y-auto bg-gray-600">
                            <ul>
                                {

                                     Object.keys(scenes).map((scene, index) => {
                                        return(
                                            <li key={index}>
                                                <p className=" w-full h-full text-amber-100 font-aclonicaFont cursor-pointer " onClick={() => {
                                                    linkScene(scenes[scene].name, scenes[scene].sceneUID)
                                                }}> { scenes[scene].name } </p> </li>
                                            )

                                    })
                                }

                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }




    if(currentHotspotType === "scene"){
        return (
            <>
            <SceneHotspotOptionsDisplay />
            </>
        )
    } else if(currentHotspotType === "info"){
        return (
            <>
            <InfoHotspotOptionsDisplay />
            </>
        )
    }

}