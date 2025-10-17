'use client'

import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {useEffect, useRef, useState} from "react";
import {Bounce, toast} from "react-toastify";
import EditSceneName from "@/app/tool/edit_scene_name";


var  width = 1440, // int || window.innerWidth
height = 650 // int || window.innerHeight

function getFileNameWithoutExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return filename; // No extension found
    }
    return filename.substring(0, lastDotIndex);
}


export default function display(){
    const panoramaRef = useRef(null);
    const [scenes, setScenes] = useState([]);
    const [isEditingScene, setIsEditingScene] = useState(false);
    const [selectedEditScene, setSelectedEditScene] = useState(null);
    const [selectedViewScene, setSelectedViewScene] = useState(null);

    const [hotspots, setHotspots] = useState([]);
    const [currentHotspot, setCurrentHotspot] = useState(null);

    const [currentSphere, setCurrentSphere] = useState(null);
    const [sceneReady, setSceneReady] = useState(false);
    let hoveredHotspot = null;
    let draggedHotspot = null;
    let isDragging = false;


    const loader = new THREE.TextureLoader();
    // const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const[panoramaCanvas, setPanoramaCanvas] = useState(null);
    const sceneRef = useRef(new THREE.Scene());

    function sphericalToCartesian(pitch, yaw, radius) {
        const phi = THREE.MathUtils.degToRad(90 - pitch);
        const theta = THREE.MathUtils.degToRad(yaw);
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);
        return new THREE.Vector3(x, y, z);
    }



    useEffect(() => {
        console.log("canvas change")
        if(!panoramaCanvas) return;
        if(panoramaCanvas){
            console.log("canvas present")
        }
        panoramaCanvas.addEventListener("mousemove", onMouseMove);
        panoramaCanvas.addEventListener("mousedown", onMouseDown);
        panoramaCanvas.addEventListener("mouseup", onMouseUp);
    }, [panoramaCanvas])


    const handleRemoveScene = (sceneToRemove) => {
        console.log('scene to remove', sceneToRemove)
        setScenes((scenes) => {

            return scenes.filter(scene => scene !== sceneToRemove)
        })
        toast.success(`deleted scene ${sceneToRemove.name} successfully`, {
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
            let sceneFromFile = {
                name: fileName,
                url: blobUrl,
                initialName: fileName,
                sceneUID: sceneUID
            }
            setScenes((scenes) => [...scenes, sceneFromFile])
        })
    }

    useEffect(() => {
        console.log(hotspots)
    }, [hotspots])

    //handle hotspots
    function addHotspot(){
        if(!selectedViewScene){
            return;
        }
        console.log("current scene", selectedViewScene)
        //mark the event
        document.dispatchEvent(new Event("hotspotAdded"))
        // createHotspot(pitch, yaw, scene);

    }

    function makeRoundedTexture(imageUrl, size = 128) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        canvas.style.cursor = "pointer";
        canvas.draggable = true;
        const ctx = canvas.getContext("2d");

        // Draw circular mask
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        const img = new Image();
        const texture = new THREE.CanvasTexture(canvas);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            texture.needsUpdate = true;
        };
        img.src = imageUrl;

        return texture;
    }






    function createHotspot(pitch, yaw, scene, radius = 500) {
        const pos = sphericalToCartesian(pitch, yaw, radius - 1);

        const texture = makeRoundedTexture("/foyer.jpg");
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: false,
        });


        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 999; // force draw on top
        sprite.position.copy(pos);
        sprite.scale.set(0.2, 0.2, 1);
        scene.add(sprite);

        sprite.userData = { pitch, yaw, isHotspot: true };
        console.log("✅ Hotspot added at:", pos);
        console.log("Hotspot position:", sprite.position, "Camera position:", camera.position);
        console.log("Dot to camera:", sprite.position.clone().normalize().dot(camera.getWorldDirection(new THREE.Vector3())));

        let randomString = (Math.random() + 1).toString(36).substring(7);
        let hotspotUID = "hot-" + randomString
        let hotspot = {
            name: hotspotUID,
            scene: selectedViewScene.sceneUID,
            initialName: hotspotUID,
            hotspotUID: hotspotUID,
            pitch: pitch,
            yaw: yaw,

        }
        setHotspots((hotspots) => [...hotspots, hotspot]);

        return sprite;
    }


    function onMouseMove(event) {
        console.log("moving")
        const rect = panoramaCanvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(sceneRef.current.children.filter(o => o.userData.isHotspot));

        console.log("scene", sceneRef.current)
        console.log("scene children", sceneRef.current.children)
        console.log("intersects length", intersects.length);
        // Handle hover
        if (intersects.length > 0) {
            const hotspot = intersects[0].object;
            console.log("hotspot is", hotspot)
            if (hoveredHotspot !== hotspot) {
                hoveredHotspot = hotspot;
                panoramaCanvas.style.cursor = "pointer";
            }
        } else {
            hoveredHotspot = null;
            if (!isDragging) panoramaCanvas.style.cursor = "default";
        }

        // Handle drag move
        if (isDragging && draggedHotspot) {
            const sphereIntersect = raycaster.intersectObject(currentSphere);
            if (intersects.length > 0) {
                const point = intersects[0].point;

                // Re-normalize to sphere radius (inside surface)
                const radius = 499.5;
                const pos = point.clone().normalize().multiplyScalar(radius);

                draggedHotspot.position.copy(pos);
            }
        }
    }

    function onMouseDown() {
        if (hoveredHotspot) {
            isDragging = true;
            draggedHotspot = hoveredHotspot;
            panoramaCanvas.style.cursor = "grabbing";
        } else {
            console.log("hovered hotspot not")
        }
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            panoramaCanvas.style.cursor = "pointer";

            if (draggedHotspot) {
                // Convert final position back to pitch/yaw
                const spherical = new THREE.Spherical().setFromVector3(draggedHotspot.position.clone().normalize());
                const yaw = THREE.MathUtils.radToDeg(spherical.theta);
                const pitch = 90 - THREE.MathUtils.radToDeg(spherical.phi);
                console.log(`New hotspot position — Pitch: ${pitch.toFixed(2)}, Yaw: ${yaw.toFixed(2)}`);
            }

            draggedHotspot = null;
        }
    }

    useEffect(() => {
        if(!selectedViewScene){
            return
        }
        loader.load(
             selectedViewScene.url,
            function (texture) {

                renderer.setSize(window.innerWidth * 0.65, window.innerHeight * 0.65);
                panoramaRef.current.innerHTML =  ''
                panoramaRef.current.appendChild(renderer.domElement);

                setPanoramaCanvas(renderer.domElement);



                const controls = new OrbitControls(camera, renderer.domElement);
                // controls.enableZoom = true;
                controls.enablePan = false;
                controls.enableDamping = false;

                controls.maxDistance = 400
                // controls.minDistance = 0.01
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.DOLLY,
                    RIGHT: THREE.MOUSE.PAN
                }
                controls.rotateSpeed = -0.8
                // Position the camera
                camera.position.z = 1;
                controls.update()


                animate();
                // const scene = new THREE.Scene()
                const material = new THREE.MeshBasicMaterial({  map: texture,
                    transparent: true,
                    opacity: 1 });


                const geometry = new THREE.SphereGeometry(500, 60, 40);
                geometry.scale(-1, 1, 1)
                const mesh = new THREE.Mesh(geometry, material);

                const scene = sceneRef.current;
                scene.add(mesh);
                document.addEventListener("hotspotAdded", (event) => {
                    console.log("hotspot add event");
                    //get  the pitch and yaw of at the center of the view
                    const dir = new THREE.Vector3();
                    camera.getWorldDirection(dir)
                    const spherical = new THREE.Spherical().setFromVector3(dir);
                    const yaw = THREE.MathUtils.radToDeg(spherical.theta);
                    const pitch = 90 - THREE.MathUtils.radToDeg(spherical.phi);
                    createHotspot(pitch, yaw, scene);

                    const rect = renderer.domElement.getBoundingClientRect();
                    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                    raycaster.setFromCamera(mouse, camera);

                    // Intersect with everything in the scene
                    const intersects = raycaster.intersectObjects(scene.children, true);

                    if (intersects.length > 0) {
                        // const point = intersects[0].point;
                        // const spherical = new THREE.Spherical().setFromVector3(point.clone().normalize());
                        // // const yaw = THREE.MathUtils.radToDeg(spherical.theta);
                        // // const pitch = 90 - THREE.MathUtils.radToDeg(spherical.phi);
                        // console.log(`📍 Clicked at → Yaw: ${yaw.toFixed(2)}°, Pitch: ${pitch.toFixed(2)}°`);


                    }
                });



                // Fade in new, fade out current
                let alpha = 0;

                const fade = () => {
                    alpha += 0.02;
                    if (currentSphere) currentSphere.material.opacity = 1 - alpha;
                    mesh.material.opacity = alpha;

                    if (alpha < 1) {
                        requestAnimationFrame(fade);
                    } else {
                        if (currentSphere) {
                            scene.remove(currentSphere);
                            currentSphere.material.dispose();
                            currentSphere.geometry.dispose();
                        }
                        setCurrentSphere(mesh)
                    }
                };

                fade();

    // Animation loop to render the scene
                function animate() {
                    requestAnimationFrame(animate);
                    renderer.clearDepth(); // 👈 add this
                    renderer.render(sceneRef.current, camera);
                }

                setSceneReady(true)
            },
            function (xhr) {
                // Optional: Progress callback
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                // Optional: Error callback
                console.error('An error occurred while loading the texture:', error);
            }
        )


    }, [isEditingScene, selectedViewScene]);
    if (isEditingScene) {
        return (
            <div className={'w-full h-full flex justify-center items-center'}>
            <EditSceneName setScenes={setScenes} scene={selectedEditScene} setIsEditingScene={setIsEditingScene}/>
            </div>
        )
    }
    return(


        <div className={'w-full h-full '}>
            <div className={'w-full h-24 bg-cambridge_light flex items-center'}>
                <button className={'w-28  h-16 cursor-pointer bg-tiffany rounded-2xl ml-auto text-black'}>
                    EXPORT
                </button>
            </div>
            <div className={'w-full h-[90%] flex justify-start items-center space-x-6'}>
                <div className={'w-[20%] h-96 shadow-xl border-black ml-4 border-1 bg-battle_gray flex flex-col items-center'}>
                    {/*  Project Title  */}
                    <div className={'flex w-full bg-white text-black'}>
                        <p className={'font-bold text-2xl'}>Project Title</p>
                    </div>
                    {/*    Settings*/}
                    <div className={'w-full flex flex-col items-center bg-battle_gray h-44'}>
                        <div className={'flex w-full h-[20%]  bg-cambridge_dark text-white'}>
                            <p className={'font-bold text-2xl'}>SETTINGS</p>
                        </div>
                        <div className={'flex flex-col h-[80%] w-full'}>
                            <div className={'flex w-full h-[30%] justify-start ml-16  text-white'}>
                                <p className={'font-bold text-xl'}>Autorotate</p>
                            </div>
                            <div className={'flex w-full h-[30%] justify-start ml-16  text-white'}>
                                <p className={'font-bold text-xl'}>View Control Buttons</p>
                            </div>
                            <div className={'flex w-full h-[30%] justify-start ml-16  text-white'}>
                                <p className={'font-bold text-xl'}>Fullscreen button</p>
                            </div>
                        </div>
                    </div>
                    {/*Panorama List*/}
                    <div className={'flex flex-col w-full text-white'}>
                        <div className={'flex w-full bg-cambridge_dark text-white'}>
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
                                   scenes.length > 0 ? (
                                       scenes.map((scene, index) => (
                                           <li key={index}>
                                               <div className={'w-full flex items-baseline h-20'}>
                                                   <div className={'w-[75%] h-16 font-extrabold text-white text-2xl cursor-pointer'} onClick={() => {
                                                       setSelectedViewScene(scene);
                                                   }}>
                                                       <p  className={'w-full h-full'}>{scene.name}</p>
                                                   </div>
                                                   <div className={'flex items-baseline space-x-2'}>
                                                       <div className={'w-8 h-8 cursor-pointer'} onClick={() => {
                                                           setSelectedEditScene(scene);
                                                           setIsEditingScene(true)
                                                       }}>
                                                           <img className={'object-contain aspect-square'} src={'/img/edit.png'} alt={'edit scene name'}/>
                                                       </div>
                                                       <div className={'w-9 h-9 cursor-pointer'} onClick={() => {
                                                           handleRemoveScene(scene)
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
                </div>
                {/*Actual Panorama*/}
                <div className={'flex flex-col w-[60%] h-[90%]'}>
                    <div ref={panoramaRef} className={'w-full h-[80%] '}>

                    </div>
                    <div className={'flex flex-row items-center justify-center space-x-20 mt-12'}>
                        <button onClick={addHotspot} className={'rounded-2xl bg-cyan-600 h-12 w-28 cursor-pointer'}> Add Hotspot </button>
                        <button className={'rounded-2xl bg-gray-600 h-12 w-28 cursor-pointer'}> Remove Hotspot </button>

                    </div>
                </div>

            </div>

        </div>
    )
}
