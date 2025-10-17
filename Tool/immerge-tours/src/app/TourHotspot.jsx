'use client'
import {useEffect, useState} from "react";

export default function TourHotspot({hotspotConfig,
                                        handleDragStart, handleDragging,  handleDragEnd, dataID, currentHotspot, setCurrentHotspot}){

    const [hotspotSceneName, setHotspotSceneName] = useState("");
    const [hotspotSceneImage, setHotspotSceneImage] = useState(null);

    //set the hotspot scene name and image once they have been declared and set in the hotspot options
    useEffect(() => {
        console.log("hotspot config changed", hotspotConfig);
        Object.keys(hotspotConfig).map((hotspotId, index) => {
            if(hotspotId === dataID){

                setHotspotSceneName(hotspotConfig[hotspotId].sceneName);
                setHotspotSceneImage(hotspotConfig[hotspotId].sceneImage);

            }
        })
    }, [hotspotConfig]);

    return (
        <div id="hotspot-container" className="w-fit h-fit" draggable="true" onClick={() => {
            setCurrentHotspot(dataID)
            console.log("setCurrentHotspot", setCurrentHotspot)
            console.log("current altered hotspot:", currentHotspot)
        }} onDragStart={handleDragStart} onDrag={handleDragging} onDragEnd={handleDragEnd} data-id={dataID}>
            <div className="text-white   max-w-[75px] max-h-[75px] " data-id={dataID}>
                <p className="font-adaminaFont  font-medium  " id="sceneName" data-id={dataID}>Go To {hotspotSceneName}</p>
            </div>
            <div className="rounded-full  border-white border-4 w-[75px]  h-[75px]" data-id={dataID}>
                <img alt="hotspot-image" id="hotspot-image" className="w-full h-full rounded-full" data-id={dataID}
                     // src="img/up_arrow.png"
                    src={hotspotSceneImage ? hotspotSceneImage : "img/arrow.svg"}
                />
            </div>
            {/*<HotspotOptions files={files} setCurrentFileName={setCurrentFileName} dataID={dataID}/>*/}
        </div>

    )
}