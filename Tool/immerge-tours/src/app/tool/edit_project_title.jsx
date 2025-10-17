import {useState} from "react";

export default function EditProjectTitle({currentTitle, setIsEditingTitle, setProjectTitle}) {
    const [title, setTitle] = useState(currentTitle);
    function updateProjectTitle(){
        // setScenes(prevScenes => prevScenes.map(prevScene => prevScene === scene ? {...prevScene, name : sceneName} : prevScene));
        setProjectTitle(title);
    }
    return (
        <div className={'w-96 h-72 flex z-auto bg-cambridge_dark flex-col shadow-xl items-center '}>
            <div className={'flex w-full items-center justify-center h-24 border-b-1 space-x-6'}>
                <p className={'font-extrabold text-white text-2xl'}> Current Name: </p>
                <p className={'font-extrabold text-white text-2xl'}> {title} </p>
            </div>
            <input name={'project_title'} id={'project_title'} className={' text-center border-black w-60 rounded-2xl  mt-4 h-16 border-2'} onChange={(e) => {setTitle(e.target.value)}} type={'text'} placeholder={"Enter new name"}/>
            <div className={'flex w-full items-center justify-around mt-12'}>
                <button className={'bg-turqoise w-24 h-12 rounded-2xl mt-auto cursor-pointer'} onClick={()=> {
                    console.log("new title", title)
                    updateProjectTitle()
                    setIsEditingTitle(false)

                }}>Update</button>
                <button className={'bg-red-600  w-24 h-12 rounded-2xl mt-auto cursor-pointer'} onClick={() =>{
                    document.getElementById('project_title').value = null;
                    setIsEditingTitle(false);
                }}>Cancel</button>
            </div>
        </div>
    )
}