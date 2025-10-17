function createHotspotSceneFunc(hotSpotDiv, args) {
    console.log("args", args)
    hotSpotDiv.classList.remove("pnlm-sprite")

    hotSpotDiv.innerHTML = `
        <div id="hotspot-container" class="w-fit h-fit flex flex-col items-center justify-center"  onDragStart={handleDragStart} onDrag={handleDragging} onDragEnd={handleDragEnd} data-id={dataID}>
            <div class="text-white   max-w-[75px] max-h-[75px] " data-id={dataID}>
                <p class="font-adaminaFont  font-bold  " id="sceneName" data-id=${args.dataID}>Go To ${args.sceneName}</p>
            </div>
            <div class="rounded-full  border-white border-4 w-[75px]  h-[75px]" data-id={dataID}>
                <img alt="hotspot-image" id="hotspot-image" class="w-full h-full rounded-full" data-id={dataID}
                    src=${args.sceneImage}
                    />
            </div>
           
        </div>
    `
}

function createHotspotInfoFunc(hotSpotDiv, args) {
    hotSpotDiv.classList.remove("pnlm-sprite")
    hotSpotDiv.innerHTML = `
    <div id="hotspot-container" class="w-fit h-fit" >

            <div class="max-w-[75px] max-h-[75px] ">
                <div class="relative group inline-block w-full h-full" >
                    <img src="images/utilities/info.png" alt="Info"  />
                    <div class="max-w-[400px]">
                        <span   class="absolute font-adaminaFont whitespace-normal font-medium bg-gray-400 text-white text-xs rounded px-2 py-1  -translate-y-1/2 left-full opacity-0 group-hover:opacity-100 transition-all duration-300 w-[200px]">

                        ${args.infoText}

                        </span>
                    </div>
                </div>
            </div>
        </div>
    `
}

let scenesInConfig;
let pannellumViewer;
let isShowingAllScenes = false;
let isAutorotate = false;

function goToScene(sceneId) {
    let initialPitch = scenesInConfig[sceneId].initialPitch
    let initialYaw = scenesInConfig[sceneId].initialYaw
    pannellumViewer.loadScene(sceneId, initialPitch, initialYaw)
}

function showAllScenes(){
    let scenesCollection = $("#scenesCollection")
    if(!isShowingAllScenes){
        scenesCollection[0].classList.remove('hidden')
        scenesCollection.empty().append('<ul></ul>').find('ul');

        Object.keys(scenesInConfig).map((scene) => {
            let sceneImage;
            let sceneName = scenesInConfig[scene].name;
            let sceneID = scene;
            if(scenesInConfig[scene].previewImage){
                sceneImage = scenesInConfig[scene].previewImage
            } else {
                sceneImage = scenesInConfig[scene].panorama
            }
            scenesCollection.append(`
                <div class="w-[70%] h-fit max-h-[30%] pt-[2%] pb-[2%] pl-[10%] cursor-pointer"  onclick=(goToScene('${sceneID}'))>
                    <div class="flex items-center justify-center  rounded-full  border-white border-2 w-[100px]  h-[100px]">
                        <img class="rounded-full w-full h-full" src=${sceneImage}> 
                    </div>
                    <div class="flex items-center justify-center">
                        <p class="font-bold text-white"> ${sceneName} </p>
                    </div>   
                </div>
                `)
        })
    } else {
        scenesCollection[0].classList.add('hidden')
    }
    isShowingAllScenes = !isShowingAllScenes

}

function autorotate(){
    let pauseButton = document.getElementById("pause-play-icon")
    console.log("pause btn", pauseButton)
    if(isAutorotate){
        pannellumViewer.stopAutoRotate();
        isAutorotate = false;
        pauseButton.src = './images/utilities/videos.png'
    } else {
        pannellumViewer.startAutoRotate(-1);
        isAutorotate = true;
        pauseButton.src = './images/utilities/pause.png'

    }
}


fetch('config.json')
    .then(response => response.json())
    .then(config => {
        //set the title of the project
        $('#title')[0].text = config.projectTitle


        //style the hotspots with custom styling
        scenesInConfig = config.scenes
        Object.keys(config.scenes).map((scene) => {
            if(config.scenes[scene].hotSpots){
                config.scenes[scene].hotSpots.map((hotspot) => {
                    if(hotspot.type === "scene"){
                        hotspot.sceneId = hotspot.sceneID
                        hotspot.createTooltipArgs = {
                            "sceneImage": hotspot.sceneImage,
                            "sceneId": hotspot.sceneID,
                            "sceneName": config.scenes[hotspot.sceneID].name
                        }
                        hotspot.createTooltipFunc = createHotspotSceneFunc
                    } else if(hotspot.type === "info"){
                        hotspot.createTooltipArgs = {
                            "infoText": hotspot.infoText,
                        }
                        hotspot.createTooltipFunc = createHotspotInfoFunc
                    }

                })
            }
        })



        pannellumViewer =  pannellum.viewer('panorama', config);
    })
    .catch(error => console.error('Error loading config:', error));