'use client'
import {useEffect, useRef, useState} from "react";
import {Bounce, toast} from "react-toastify";
import EditSceneName from "@/app/tool/edit_scene_name";
import ReactDOM from "react-dom/client";
import TourHotspot from "@/app/TourHotspot";
import HotspotOptions from "@/app/HotspotOptions";
import InfoHotspot from "@/app/InfoHotspot";
import ExportToFiles from "@/app/export/export";
import EditProjectTitle from "@/app/tool/edit_project_title";


function getFileNameWithoutExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return filename; // No extension found
    }
    return filename.substring(0, lastDotIndex);
}

export default function ToolPage(){
    const [scenes, setScenes] = useState([]);
    const [isEditingScene, setIsEditingScene] = useState(false);
    const [selectedEditScene, setSelectedEditScene] = useState(null);
    const [selectedViewScene, setSelectedViewScene] = useState(null);
    const[panoramaViewer, setPanoramaViewer] = useState(undefined);
    const [currentHotspot, setCurrentHotspot] = useState(null);
    const[hotspotConfig, setHotspotConfig] = useState({});

    const [isAutorotateChecked, setAutorotateChecked] = useState(false);
    const [autoRotateSpeed, setAutoRotateSpeed] = useState(false);
    const [settingsActive, setSettingsActive] = useState(true);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [projectTitle, setProjectTitle] = useState("Project Title");


    let handleDragStart, handleDragging, endDragging;
    let isDragging = false
    let activeHotspots;
    let chosenHotspot;
    const pannellumConfig = {
        "scenes": scenes
    }

    //hotspot controls
    handleDragStart =  function (event) {
        console.log("event data attribute", event.target.getAttribute("data-id"))

        isDragging = true;
        activeHotspots = panoramaViewer.getConfig().hotSpots

        chosenHotspot =  activeHotspots.find(({ id }) => id === event.target.getAttribute("data-id"))

    }

    handleDragging = function (event){
        isDragging = true

        const pitch = panoramaViewer.getPitch(); // Get pitch of clicked point
        const yaw = panoramaViewer.getYaw(); // Get yaw of clicked point
        //  console.log("activeHotspots", activeHotspots);
        // console.log("chosen hotspot", chosenHotspot)
        panoramaViewer.removeHotSpot(chosenHotspot.id)
        chosenHotspot.yaw = yaw
        chosenHotspot.pitch = pitch
    }

    endDragging = function (event){
        isDragging = false;
        console.log("drag end")

        const coords = panoramaViewer.mouseEventToCoords(event)
        const pitch = coords[0]
        const yaw = coords[1]

        chosenHotspot.yaw = yaw
        chosenHotspot.pitch = pitch
        panoramaViewer.addHotSpot(chosenHotspot)


    }


    const handleAutorotateChange = (event) => {
        setAutorotateChecked(event.target.checked);
    }

    const handleAutoRotateSpeedChange = (event) => {
        setAutoRotateSpeed(event.target.value);
    }

    //control the dropdown of settings options by setting the settingsActive variable
    const handleSettingsActive = () => {
        setSettingsActive(!settingsActive);
    }

    useEffect(() => {
        console.log("scenes", scenes)
        console.log("pannellum config", pannellumConfig)
        if(panoramaViewer){
            console.log("panorama viewer", panoramaViewer.getConfig())

        }
    }, [scenes])

    const handleRemoveScene = (scene) => {
        const name = scene.name;
        setScenes((scenes) => {
            const newScenes = {...scenes}
            delete newScenes[scene.sceneUID]
            return newScenes
        })
        delete panoramaViewer.getConfig().scenes[scene.sceneUID]
        panoramaViewer.removeScene(scene.sceneUID)

        toast.success(`deleted scene ${name} successfully`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        })
    }


    function handleFileChange(e){
        const chosenFiles = Array.from(event.target.files)
        chosenFiles.forEach(file => {
            const fileName = getFileNameWithoutExtension(file.name);
            let randomString = (Math.random() + 1).toString(36).substring(7);
            let sceneUID = "scene-" + randomString
            const blobUrl = URL.createObjectURL(file);
            let fileScene = {
                name: fileName,
                url: blobUrl,
                initialName: fileName,
                sceneUID: sceneUID,
                hfov: 110,
                pitch: 0,
                yaw: 0,
                type: "equirectangular",
                // autoRotate: sceneAutorotateSpeed,
                autoRotateInactivityDelay : 5000,
                autoLoad: true,
                panorama: blobUrl,
                hotSpots: [{}],
                initialYaw: 0,
                initialPitch: 0,
            }
            setScenes((scenes) => ({
                // ...scenes, [fileName]: fileScene
                ...scenes, [sceneUID]: fileScene
            }))
            panoramaViewer.addScene(sceneUID, fileScene)
        })
    }


    //make the panoramaViewer autorotate or stop autorotation based on the autorotate state
    useEffect(() => {
        if(panoramaViewer){
            let panoramaViewerScenes = panoramaViewer.getConfig().scenes;
            if(isAutorotateChecked){

                Object.keys(panoramaViewerScenes).map((scene_, key) => {
                    panoramaViewerScenes[scene_].autoRotate = autoRotateSpeed;

                })

                panoramaViewer.startAutoRotate(autoRotateSpeed)
            } else {
                panoramaViewer.stopAutoRotate()
                Object.keys(panoramaViewerScenes).map((scene_, key) => {
                    panoramaViewerScenes[scene_].autoRotate = false

                })

            }
        }

    }, [isAutorotateChecked, autoRotateSpeed]);

    function LinkHotspot  (hotspotType){

        //find the current scene, add the new hotspot to it


        console.log("linking hotspot")

        console.log("panorama view", panoramaViewer)
        let randomString = (Math.random() + 1).toString(36).substring(7);

        if(panoramaViewer){
            panoramaViewer.addHotSpot({
                pitch: panoramaViewer.getPitch(),
                yaw: panoramaViewer.getYaw(),
                hotspotScene: panoramaViewer.getScene(),
                draggable: false,
                id: "hotspot-" + randomString,
                type: hotspotType,
                createTooltipArgs: {"id": "hotspot-" + randomString},
                createTooltipFunc: (hotSpotDiv, args) => {
                    console.log("args", args)
                    hotSpotDiv.classList.remove("pnlm-sprite")
                    const root = ReactDOM.createRoot(hotSpotDiv)
                    if(hotspotType === "scene"){
                        root.render(

                            <TourHotspot
                                            panoramaViewer={panoramaViewer}
                                            currentHotspot={currentHotspot} setCurrentHotspot={setCurrentHotspot}
                                            hotspotConfig={hotspotConfig}
                                            handleDragStart={handleDragStart} handleDragging={handleDragging} handleDragEnd={endDragging}  dataID={args.id} />


                        )
                    } else if(hotspotType === "info"){
                        root.render(

                            <InfoHotspot
                                            panoramaViewer={panoramaViewer}
                                            currentHotspot={currentHotspot} setCurrentHotspot={setCurrentHotspot}
                                            hotspotConfig={hotspotConfig}
                                            handleDragStart={handleDragStart} handleDragging={handleDragging} handleDragEnd={endDragging}  dataID={args.id} />



                        )
                    }
                },
                clickHandlerFunc: (event) => {
                    event.preventDefault()
                    setCurrentHotspot(event.target.id)

                    return false

                },

            })

        }
    }


    function exportConfig(){
        let config = panoramaViewer.getConfig()
        ExportToFiles(config, hotspotConfig, scenes, projectTitle)
    }

    useEffect(() => {
        console.log("selected edit scene", selectedEditScene)
    }, [selectedEditScene]);

    useEffect(()=>{

        setPanoramaViewer(window.pannellum.viewer('panoramaFrame', pannellumConfig))

    }, [])

    useEffect(() => {
        if(selectedViewScene != null) {


            if (panoramaViewer.getConfig().scenes.hasOwnProperty(selectedViewScene.sceneUID)) {
                let sceneInitialPitch = panoramaViewer.getConfig().scenes[selectedViewScene.sceneUID].initialPitch;
                let sceneInitialYaw = panoramaViewer.getConfig().scenes[selectedViewScene.sceneUID].initialYaw;


                panoramaViewer.loadScene(selectedViewScene.sceneUID, sceneInitialPitch, sceneInitialYaw);

                console.log(`loading scene ${selectedViewScene.name} UID: ${selectedViewScene.sceneUID}`);

            } else {
                console.error(`Scene ${selectedViewScene.sceneUID} not found! current scenes:`, panoramaViewer.getConfig().scenes);
                console.log("current scene file", selectedViewScene.sceneUID)
            }
            panoramaViewer.on("error", (e) => {
                console.log("error", e);
            })

        } else {
            console.log("no file")
        }
    }, [selectedViewScene])


    return(


        <div className={'w-full h-full '}>
            <div className={`w-full h-full flex justify-center items-center ${isEditingScene ? 'visible' : 'hidden'}`}>
                <EditSceneName setScenes={setScenes} selectedScene={selectedEditScene} setIsEditingScene={setIsEditingScene}/>
            </div>
            <div className={`w-full h-full flex justify-center items-center ${isEditingTitle ? 'visible' : 'hidden'}`}>
                <EditProjectTitle setProjectTitle={setProjectTitle} currentTitle={projectTitle} setIsEditingTitle={setIsEditingTitle}/>
            </div>

            <div className={`w-full h-24 bg-cambridge_light flex items-center `}>
                <button  onClick={exportConfig} className={'w-28  h-16 cursor-pointer bg-tiffany rounded-2xl ml-auto text-black'}>
                    EXPORT
                </button>
            </div>
            <div className={'w-full h-[90%] flex justify-evenly items-center space-x-6'}>
                <div className={'w-[20%]  shadow-xl border-black ml-4 border-1 bg-battle_gray flex flex-col items-center '}>
                    {/*  Project Title  */}
                    <div className={'flex justify-evenly items-center w-full bg-white text-black'}>
                        <p className={'font-bold text-2xl'}>{projectTitle}</p>
                        <img onClick={() => {
                            setIsEditingTitle(!isEditingTitle)
                        }} className={'cursor-pointer h-6 ml-auto pr-2'} src={'/img/pen.svg'} alt={'edit'}/>
                    </div>
                    {/*    Settings*/}
                    <div className={`w-full ${settingsActive ? 'h-72' : 'h-fit'}  flex flex-col items-center bg-battle_gray `}>
                        <div className={'flex w-full h-[20%] justify-center items-center  bg-cambridge_dark text-white'}>
                            <p className={'font-bold text-2xl'}>SETTINGS</p>
                            <div className="ml-auto  w-[8%] h-full flex items-center ">
                                <button onClick={handleSettingsActive} ><img  src={` ${settingsActive ? "img/dropup.png"  : "img/dropdown.png" } `} alt={"dropdown button"}/></button>
                            </div>
                        </div>
                        <div id="settingsOptions" className={`w-full  ${ settingsActive ? 'h-52' : 'hidden' }   border border-black bg-gray-600`}>
                            <div className={'flex flex-col h-full w-full'}>
                                <div className="flex items-center  justify-evenly border border-black space-x-10 w-full h-[50%] ">
                                    <label htmlFor="autorotate-button" className="pl-3 font-aclonicaFont font-medium" dir="ltr">
                                        Autorotate

                                    </label>
                                    <input type="checkbox" id="autorotate-button" onChange={handleAutorotateChange}
                                           className="w-6 h-6 rounded-full border-gray-300 "/>
                                </div>
                                <div className="flex items-center justify-evenly border border-black space-x-10 w-full h-[50%] ">
                                    <div className=" flex items-center justify-center space-x-3 w-full max-w-full h-full">
                                        <label htmlFor="rotation-degrees" className="font-aclonicaFont">
                                            Rotation Speed
                                        </label>
                                        <input type="number"  onChange={handleAutoRotateSpeedChange} className="w-[50%] h-[50%]   border border-white rounded-2xl  text-center text-black" id="rotation-degrees" placeholder={5}></input>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    {/*Panorama List*/}
                    <div className={'flex flex-col w-full mt-12 text-white'}>
                        <div className={'flex w-full justify-center items-center bg-cambridge_dark text-white'}>
                            <p className={'font-bold text-2xl'}>Panorama List</p>
                        </div>
                        <div className={'w-full h-20 flex justify-center items-center border-b-1 border-black'}>
                            <label htmlFor="file-upload" className="flex items-center border-green-50 cursor-pointer h-16 w-full
                            text-center justify-center   text-black text-lg font-bold bg-tiffany">
                                Upload File(s)
                            </label>
                            <input id={'file-upload'} className={'hidden'}
                                   type="file" multiple={true} accept={"image/*"} onChange={handleFileChange}/>

                        </div>
                        <div className={'w-full flex flex-col h-32 overflow-y-auto '}>
                            <ul>
                                {
                                    Object.keys(scenes).length > 0 ? (
                                        Object.keys(scenes).map((scene, index) => (
                                            <li key={index}>
                                                <div className={'w-full flex items-baseline h-20'}>
                                                    <div className={'w-[75%] h-16 font-extrabold text-white text-2xl cursor-pointer'} onClick={() => {
                                                        setSelectedViewScene(null)
                                                        setSelectedViewScene(scenes[scene]);
                                                    }}>
                                                        <p  className={'w-full h-full'}>{scenes[scene].name}</p>
                                                    </div>
                                                    <div className={'flex items-baseline space-x-2'}>
                                                        <div className={'w-8 h-8 cursor-pointer'} onClick={() => {
                                                            setSelectedEditScene(scenes[scene]);
                                                            setIsEditingScene(true)
                                                        }}>
                                                            <img className={'object-contain aspect-square'} src={'/img/edit.png'} alt={'edit scene name'}/>
                                                        </div>
                                                        <div className={'w-9 h-9 cursor-pointer'} onClick={() => {
                                                            handleRemoveScene(scenes[scene])
                                                        }}>
                                                            <img className={'object-contain aspect-square'} src={'/img/trash.png'} alt={'delete scene'}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li> No Files Chosen</li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>

                    <div className={'mt-12 w-full'}>
                        <HotspotOptions scenes={scenes} setSelectedViewScene={setSelectedViewScene} hotspotConfig={hotspotConfig} currentHotspot={currentHotspot} panoramaViewer={panoramaViewer} currentSceneName={""} />

                    </div>
                </div>
                {/*Actual Panorama*/}
                <div className={'flex flex-col w-[70%] h-[90%]'}>
                    <div id="sceneNameContainer" className="h-[5%] w-full bg-gray-200">
                        <p id="sceneName"
                           className=" ml-[2%] font-medium font-adaminaFont text-black"> {selectedViewScene ? selectedViewScene.name : "file"} </p>
                    </div>
                    <div id="panoramaFrame" className="w-full h-[95%]">
                        {/*Panorama Container*/}
                    </div>
                    {/*<div ref={panoramaRef} className={'w-full h-[80%] '}>*/}

                    {/*</div>*/}
                    <div className={'flex flex-row items-center justify-center space-x-20 mt-12'}>
                        <button onClick={() => {
                            LinkHotspot("scene")
                        }} className={'rounded-2xl text-black bg-cyan-600 h-12 w-32 cursor-pointer'}> Scene Hotspot </button>

                        <button onClick={() => {
                            LinkHotspot("info")
                        }} className={'rounded-2xl text-black bg-green-400 h-12 w-32 cursor-pointer'}> Info Hotspot </button>


                    </div>
                </div>

            </div>

        </div>
    )

}