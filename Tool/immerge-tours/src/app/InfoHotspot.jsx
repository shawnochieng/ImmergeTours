'use client'
import {useEffect, useState} from "react";

export default function InfoHotspot({hotspotConfig,
                                        handleDragStart, handleDragging,  handleDragEnd, dataID, currentHotspot, setCurrentHotspot}){

    const [hotspotInfoText, setHotspotInfoText] = useState(undefined);

    //set the info hotspot  text once it has been declared and set in the hotspot options
    useEffect(() => {
        console.log("hotspot config changed", hotspotConfig);
        Object.keys(hotspotConfig).map((hotspotId, index) => {
            if(hotspotId === dataID){

                setHotspotInfoText(hotspotConfig[hotspotId].infoText);

            } else {
                console.log("hotspot config not found");
            }
        })
    }, [hotspotConfig]);

    return (
        <div id="hotspot-container" className="w-fit h-fit" draggable="true" onClick={() => {
            setCurrentHotspot(dataID)
            console.log("setCurrentHotspot", setCurrentHotspot)
            console.log("current altered hotspot:", currentHotspot)
        }} onDragStart={handleDragStart} onDrag={handleDragging} onDragEnd={handleDragEnd} data-id={dataID}>

            <div className="max-w-[75px] max-h-[75px] " data-id={dataID}>
                <div className="relative group inline-block w-full h-full" data-id={dataID}>
                    <img src="/img/info.png" alt="Info" data-id={dataID} />
                    <div className="max-w-[400px]">
                        <span data-id={dataID}  className="absolute font-adaminaFont whitespace-normal font-medium bg-gray-400 text-white text-xs rounded px-2 py-1  -translate-y-1/2 left-full opacity-0 group-hover:opacity-100 transition-all duration-300 w-[200px]">
                            { hotspotInfoText ? hotspotInfoText : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum malesuada ultrices ante nec sagittis" }
                              </span>
                    </div>


                </div>

            </div>


        </div>

    )
}