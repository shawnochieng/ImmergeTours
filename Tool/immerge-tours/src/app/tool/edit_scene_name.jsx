import {useState} from "react";

export default function EditSceneName({selectedScene, sceneIndex, setScenes , setIsEditingScene}) {
    if(!selectedScene) return;
    const [sceneName, setSceneName] = useState(selectedScene.name);
    function updateSceneName(){
        // setScenes(prevScenes => prevScenes.map(prevScene => prevScene === scene ? {...prevScene, name : sceneName} : prevScene));
        setScenes((panoramaScenes) => {
            //const newObject = {}
            Object.keys(panoramaScenes).map((scene) => {
                if(panoramaScenes[scene].sceneUID === selectedScene.sceneUID){
                    //newObject[sceneName] = panoramaScenes[scene]
                    //newObject[sceneName].title = sceneName
                    panoramaScenes[scene].name = sceneName
                    panoramaScenes[scene].title = sceneName

                } else {
                   console.error(`panorama scenes sceneUID mismatch with scene.sceneUID. panoramaScenes: ${panoramaScenes[scene].sceneUID} sceneUID: ${selectedScene.sceneUID}`)
                }

            })
            console.log("new state: ", panoramaScenes)
            return panoramaScenes
        })


    }
    return (
        <div className={'w-96 h-72 flex z-auto bg-cambridge_dark flex-col shadow-xl items-center '}>
            <div className={'flex w-full items-center justify-center h-24 border-b-1 space-x-6'}>
                <p className={'font-extrabold text-white text-2xl'}> Current Name: </p>
                <p className={'font-extrabold text-white text-2xl'}> {selectedScene.name} </p>
            </div>
            <input name={'scene_name'} id={'scene_name'} className={' text-center border-black w-60 rounded-2xl  mt-4 h-16 border-2'} onChange={(e) => {setSceneName(e.target.value)}} type={'text'} placeholder={"Enter new name"}/>
            <div className={'flex w-full items-center justify-around mt-12'}>
                <button className={'bg-turqoise w-24 h-12 rounded-2xl mt-auto cursor-pointer'} onClick={()=> {
                    console.log("new name", sceneName)
                    updateSceneName()
                    setIsEditingScene(false)

                }}>Update</button>
                <button className={'bg-red-600  w-24 h-12 rounded-2xl mt-auto cursor-pointer'} onClick={() =>{
                    document.getElementById('scene_name').value = null;
                    setIsEditingScene(false);
                }}>Cancel</button>
        </div>
        </div>
    )
}