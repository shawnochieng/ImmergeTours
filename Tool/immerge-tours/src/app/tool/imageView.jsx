"use client"

import {useEffect} from "react";



import  'pannellum';








export let activeHotspots = []

export default function ImageView(){
    const {sceneFiles, setSceneFiles, currentSceneFile, setCurrentSceneFile, currentSceneFileName, setCurrentSceneFileName, currentImage, setCurrentImage} = useData()
    const {scenes, setScenes, panoramaViewer, setPanoramaViewer, currentHotspot, setCurrentHotspot} = useScenesData()
    // const [panoramaViewer, setPanoramaViewer] = useState(undefined);
    const pannellumConfig = {
        "scenes": scenes
    }
    useEffect(()=>{

        setPanoramaViewer(window.pannellum.viewer('panoramaFrame', pannellumConfig))

    }, [])




    useEffect(()=>{
        if(panoramaViewer){

            let config = panoramaViewer.getConfig();
            console.log("received scenes", scenes)
            Object.keys(scenes).forEach(scene=>{
                console.log("received scene", scene)
                // Add a new scene dynamically
                config.scenes[scene] = scenes[scene]
            })
            console.info("config scene", config)
        }
    }, [scenes])

    useEffect(() => {

        if(currentSceneFile != null) {


            if (panoramaViewer.getConfig().scenes.hasOwnProperty(currentSceneFileName)) {
                let sceneInitialPitch = panoramaViewer.getConfig().scenes[currentSceneFileName].initialPitch;
                let sceneInitialYaw = panoramaViewer.getConfig().scenes[currentSceneFileName].initialYaw;


                panoramaViewer.loadScene(currentSceneFileName, sceneInitialPitch, sceneInitialYaw);

                console.log("loading scene", currentSceneFileName)

            } else {
                console.error(`Scene ${currentSceneFileName} not found! current scenes:`, panoramaViewer.getConfig().scenes);
                console.log("current file", currentSceneFileName)
            }
            panoramaViewer.on("error", (e) => {
                console.log("error", e);
            })

        } else {
            console.log("no file")
        }
        if(panoramaViewer) {
            panoramaViewer.on("mousedown", (event) => {
                //hide the edit options container when panorama viewer is clicked
                let editOptionsContainer = document.getElementById("editOptions")
                if(editOptionsContainer){
                    editOptionsContainer.classList.add("hidden");
                    //set the current hotspot to null to avoid changing of wrong hotspot details
                }

                setCurrentHotspot(null)
            })
        }


    }, [currentSceneFileName]);



    return (

        <>
            <div className="ml-auto mt-[1%] bg-gray-300  w-[75%] h-[75%] mr-[1%] min-w-[750px]">
                <script src="PannellumFiles/pannellum.js"></script>
                <link rel="stylesheet" href="PannellumFiles/pannellum.css"/>
                <div id="sceneNameContainer" className="h-[5%] w-full bg-gray-200">
                    <p id="sceneName"
                       className=" ml-[2%] font-medium font-adaminaFont text-black"> {currentSceneFile ? currentSceneFile.name : "file"} </p>
                </div>
                <div id="panoramaFrame" className="w-full h-[95%]">
                    {/*Panorama Container*/}
                </div>
            </div>


            <TourControls currentHotspot={currentHotspot} setCurrentHotspot={setCurrentHotspot} panoramaViewer={panoramaViewer} activeHotspots={activeHotspots} />
        </>


    )
}
