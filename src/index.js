"use strict"
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


// Мои импорты
import "./styles/all.css"

import "./app/utils/CannonDebugRenderer"
import { Game } from "./app/Game"
import { Terrain } from "./app/objects/Terrain"
import { BotModel } from './app/objects/Bot/BotModel';

const _DEBUG = true
async function main() {
    const elem = document.getElementById("game")
    const myGame = new Game(elem)

    window.myGame = myGame

    const stats = new Stats()
    stats.domElement.style = "position: absolute; top: 3px; left: 3px; cursor: pointer; opacity: 0.9; z-index: 10000;"
    console.log()
    elem.children[0].appendChild(stats.domElement)

    const generalFolder = myGame.gui.addFolder("General")
    const cameraFolder = myGame.gui.addFolder("Camera")
    const helperFolder = myGame.gui.addFolder("Helpers").close()
    const objectFolder = myGame.gui.addFolder("Objects")
    const lightFolder = myGame.gui.addFolder("Lights").close()

    {
        generalFolder.reset().add(myGame, "statisticsVisible")
            .onChange(() => { myGame.toggleStatistics(); setSizeRender() })

        myGame.lights.children.forEach((light, index) => {
            const folder = lightFolder.addFolder(light.type + index)
            folder.add(light, "intensity").name("intensity").step(0.01)
            folder.addColor(light, "color", 255)
        })


        // myGame.camera.position.set(1, 2, 5)
        cameraFolder.add(myGame.camera.position, 'x').name("X").listen().step(0.01)
        cameraFolder.add(myGame.camera.position, 'y').name("Y").listen().step(0.01)
        cameraFolder.add(myGame.camera.position, 'z').name("Z").listen().step(0.01)
        cameraFolder.add(myGame.camera.rotation, 'x').name("rotatinon X").listen().step(0.01)
        cameraFolder.add(myGame.camera.rotation, 'y').name("rotatinon Y").listen().step(0.01)
        cameraFolder.add(myGame.camera.rotation, 'z').name("rotatinon Z").listen().step(0.01)



        // управление камерой от первого лица FirstPersonControls
        myGame.controls[0].enabled = false
        generalFolder.add(myGame.controls[0], "enabled")
            .name("FirstPersonControls")
            .listen()
            .onChange((value) => {
                // выбор используемого контроллера на сцене: 
                // контроллер свободной камеры или контроллер объекта
            })
    }
    // хелперы на сцене
    {
        // отображение освещения
        myGame.helpers.add(new THREE.PointLightHelper(myGame.scene.children[0].children[1], 5))
        myGame.helpers.add(new THREE.PointLightHelper(myGame.scene.children[0].children[2], 5))


        // отображение осей
        myGame.helpers.add(new THREE.AxesHelper())

        // отображение метровой сетки
        myGame.helpers.add(new THREE.GridHelper(10, 10, 0x07b64a, 0x9807b5))

        // console.log(myGame.helpers.visible)
        helperFolder.add(myGame.helpers, 'visible').name("Отображение помощников")
        helperFolder.close()
        myGame.helpers.children.forEach((child) => {
            helperFolder.add(child, 'visible').name(child.type)
        })
    }

    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0)


    const cannonDebugRenderer = THREE.cannonDebugRenderer(myGame.scene, world)


    // Добавляю землю и воду

    let width = 500, height = 500, kSegments = 16

    const terrain = new Terrain(width, height, kSegments)
    await terrain.__init__()
    terrain.visible = false

    objectFolder.add(terrain, "visible").name("Земля")
    myGame.objects.add(terrain)



    // Загрузка модели и первичное манипулирование
    const bot = new BotModel()
    await bot.loadModel()
    bot.controls.followPlayer(myGame.camera)

    // console.log(bot.object)
    objectFolder.add(bot.object, "visible").name("робот")

    myGame.objects.add(bot.object)
    bot.object.add(new THREE.AxesHelper(3)).add(myGame.lights.children.at(-1))
    myGame.controls.push(bot.controls)
    // generalFolder.add(bot.controls, "enabled").listen().name("botControls Robot")

    let RobotBody = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Sphere(1.5 / 2),
        position: new CANNON.Vec3(0, 0.2, 0)
    })
    world.addBody(RobotBody)


    // PLANE
    if (_DEBUG) {
        /////////
        // start plane
        /////////
        const planeTexture = new THREE.TextureLoader().setPath("/").load("floor.png")
        const size = 10

        const plane = new THREE.PlaneGeometry(size * 25, size * 25, size, size)
        const planeMTL = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            map: planeTexture,
            metalness: 1
            // wireframe: true
        })
        planeMTL.map.repeat.set(size, size)

        planeMTL.map.wrapS =
            planeMTL.map.wrapT = THREE.RepeatWrapping
        const planeMesh = new THREE.Mesh(plane, planeMTL)
        planeMesh.position.y = -0.01
        planeMesh.rotation.x = -Math.PI / 2
        planeMesh.name = "Plane"
        planeMesh.receiveShadow = true

        objectFolder.add(planeMesh, "visible").name("Плоскость")
        myGame.objects.add(planeMesh)
        /////////
        // end plane
        /////////



        var groundBody = new CANNON.Body({
            mass: 0 // mass == 0 makes the body static
        });
        var groundShape = new CANNON.Plane();
        groundBody.addShape(groundShape);
        world.addBody(groundBody);

        planeMesh.position.copy(groundBody.position)

        planeMesh.quaternion.copy(groundBody.quaternion)

const cubeSize = 1
        const cube = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize);
        myGame.scene.add(cube)
        const cubeBody = new CANNON.Body({
            mass:1,
            shape: new CANNON.Box(new CANNON.Vec3(cubeSize/2,cubeSize/2,cubeSize/2))
        })
world.addBody(cubeBody)
        cubeBody.position.set(0,2,0)

        // CUBE

        // const cubeTexture = new THREE.Texture(planeTexture.image)
        // cubeTexture.flipY = true
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            // wireframeLinewidth: 10000,
            color: Math.random() * 0xffffff,
            flatShading: true,
            // map: cubeTexture
            // wireframe: true
        })
        material.name = "Cube_mtl"
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-2, 1 / 2, 0)
        // добавление на сцену сетки. етка это геометрия и привязанный к нему матриалл
        mesh.name = "Cube"
        mesh.castShadow = true
        objectFolder
            .add(mesh, "visible").name("Куб")


        myGame.scene.add(mesh);

        const boxLocalAxisHelper = new THREE.AxesHelper(10)
        boxLocalAxisHelper.name = "boxLocalAxis"
        mesh.add(boxLocalAxisHelper)



        /////////
        // end BOX
        /////////

    }


    // задаю цикл отрисовки и в loop передаю свой обработчик 
    myGame.renderer.setAnimationLoop(animate);
    setSizeRender()

    // animation
    function animate() {
        const delta = myGame.clock.getDelta()

        bot.controls.update(delta)
        // меняем параметры куба - вращение
        if (myGame.scene.getObjectByName("Cube")) {
            const box = myGame.scene.getObjectByName("Cube")
            box.rotation.x += -delta * delta * 10;
            box.rotation.y += delta;
            box.translateZ(delta * 20)
        }

        myGame.controls[0].update(delta)

        if (myGame.controls[1]) {
            myGame.controls[1].update(delta)
        }

        world.step(delta)
        cannonDebugRenderer.update()

        render()
    }






    function render() {

        stats.update()
        myGame.renderer.render(myGame.scene, myGame.camera);

    }

    function setSizeRender() {
        let parent = myGame.canvas.parentNode

        myGame.camera.aspect = parent.clientWidth / parent.clientHeight
        myGame.renderer.setSize(parent.clientWidth, parent.clientHeight, false)
        myGame.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        myGame.camera.updateProjectionMatrix();

    }



    /////////// Raycaster //////////////// 
    {
        const raycaster = new THREE.Raycaster();

        document.addEventListener('mousedown', onMouseDown);

        function onMouseDown(event) {
            // координаты от -1 до 1, с нулем в центре
            const coords = new THREE.Vector2(
                (event.clientX / myGame.renderer.domElement.clientWidth) * 2 - 1,
                -((event.clientY / myGame.renderer.domElement.clientHeight) * 2 - 1),
            );

            raycaster.setFromCamera(coords, myGame.camera);

            const intersections = raycaster.intersectObjects(myGame.scene.children, true);
            if (intersections.length > 0) {
                const selectedObject = intersections[0].object;
                const color = new THREE.Color(Math.random(), Math.random(), Math.random());
                selectedObject.material.color = color;
                console.log(`${selectedObject.name.toUpperCase()} was clicked! By coords: ${coords.x.toFixed(4)} ${coords.y.toFixed(4)}`);
            }
        }
    }
    /////////////////////////////////

    window.addEventListener("resize", setSizeRender)

    myGame.canvas.addEventListener("dblclick", (event) => {
        if (event.target === myGame.canvas) {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                setSizeRender()
            } else {
                myGame.canvas.requestFullscreen()
                setSizeRender()
            }
        }
    })

    window.addEventListener('keydown', (event) => {
        myGame.addLog(event.code)
    });

}
document.addEventListener("DOMContentLoaded", main)
