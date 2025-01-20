"use strict"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Мои импорты
import "./styles/all.css"
import { Game } from "./app/Game"
import { Terrain } from "./app/objects/Terrain"
import { BotModel } from './app/objects/Bot/BotModel';
import { LowPolyPineTree } from "./app/objects/Trees/LowPolyPineTree"
import { LowPolyTrees } from './app/objects/Trees/LowPolyTrees';

const _DEBUG = true
function main() {
    const elem = document.getElementById("game")
    const myGame = new Game(elem)

    window.myGame = myGame

    const stats = new Stats()
    stats.domElement.style = "position: absolute; top: 3px; left: 3px; cursor: pointer; opacity: 0.9; z-index: 10000;"
    console.log()
    elem.children[0].appendChild(stats.domElement)

    // const gui = new GUI({ container: elem.querySelector(".gui") })


    const generalFolder = myGame.gui.addFolder("General")
    const cameraFolder = myGame.gui.addFolder("Camera")
    const helperFolder = myGame.gui.addFolder("Helpers").close()
    const objectFolder = myGame.gui.addFolder("Objects")
    const lightFolder = myGame.gui.addFolder("Lights").close()

    generalFolder.reset().add(myGame, "statisticsVisible")
        .onChange(() => { myGame.toggleStatistics() })



    myGame.lights.children.forEach((light, index) => {
        const folder = lightFolder.addFolder(light.type + index)
        folder.add(light, "intensity").name("intensity").step(0.01)
        folder.addColor(light, "color", 255)
    })

    myGame.camera.position.set(1, 2, 5)
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
        myGame.helpers.children.forEach((child) => {
            helperFolder.add(child, 'visible').name(child.type)
        })
    }

    // Добавляю землю и воду
    {
        let width = 500, height = 500, kSegments = 16

        const terrain = new Terrain(width, height, kSegments)
        terrain.visible = false

        // object.receiveShadow = true

        objectFolder.add(terrain, "visible").name("Земля")
        myGame.objects.add(terrain)
    }

    // Загрузка модели и первичное манипулирование
    const bot = new BotModel(myGame)
    bot.controls.followPlayer(myGame.camera)

    console.log(bot.object)
    const objectSubFolder = objectFolder.addFolder("Robot")
    objectSubFolder.add(bot.object, "visible").name("робот")
    // objectSubFolder.add(bot.object.position, 'x').name("X").listen().step(0.01)
    // objectSubFolder.add(bot.object.position, 'y').name("Y").listen().step(0.01)
    // objectSubFolder.add(bot.object.position, 'z').name("Z").listen().step(0.01)
    // objectSubFolder.add(bot.object.rotation, 'x').name("rotatinon X").listen().step(0.01)
    // objectSubFolder.add(bot.object.rotation, 'y').name("rotatinon Y").listen().step(0.01)
    // objectSubFolder.add(bot.object.rotation, 'z').name("rotatinon Z").listen().step(0.01)

    myGame.objects.add(bot.object)
    bot.object.add(new THREE.AxesHelper(3))
    myGame.controls.push(bot.controls)
    generalFolder.add(bot.controls, "enabled").listen().name("botControls Robot")






    // PLANE
    if (_DEBUG) {
        /////////
        // start plane
        /////////
        const size = 20
        const plane = new THREE.PlaneGeometry(size, size, size, size)
        const planeMTL = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            // wireframe: true
        })
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


        // CUBE


        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            // wireframeLinewidth: 10000,
            color: Math.random() * 0xffffff,
            flatShading: true,
            // wireframe: true
        })
        material.name = "Cube_mtl"
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-2, 1 / 2, 0)
        // добавление на сцену сетки. етка это геометрия и привязанный к нему матриалл
        mesh.name = "Cube"
        mesh.castShadow = true
        objectFolder.addFolder("Куб").close()
            .add(mesh, "visible").name("Куб")


        myGame.scene.add(mesh);

        const boxLocalAxisHelper = new THREE.AxesHelper(10)
        boxLocalAxisHelper.name = "boxLocalAxis"
        mesh.add(boxLocalAxisHelper)



        /////////
        // end BOX
        /////////
        const trees = new LowPolyTrees()
        for (let i = 0; i < 6; i++) {
            const tree1 = trees.getPineTree("", { x: trees._getRandomArbitrary(-250, 250), y: 0, z: trees._getRandomArbitrary(-250, 250) })
            const tree2 = trees.getTree("Tree_1", { x: trees._getRandomArbitrary(-250, 250), y: 0, z: trees._getRandomArbitrary(-250, 250) })
            const tree3 = trees.getSnowyTree("Tree_1", { x: trees._getRandomArbitrary(-250, 250), y: 0, z: trees._getRandomArbitrary(-250, 250) })
            // trees._setHeight(tree1, trees._getRandomArbitrary(5, 25))
            // trees._setHeight(tree2, trees._getRandomArbitrary(5, 25))
            // trees._setHeight(tree3, trees._getRandomArbitrary(5, 25))
            myGame.scene.add(tree3)
            myGame.scene.add(tree2)
            myGame.scene.add(tree1)
        }

        myGame.camera.position.set(1, 2, 5)
        myGame.camera.lookAt(0, 0, 0)


        // const pineTree = new LowPolyPineTree();
        // myGame.objects.add(pineTree.getTree());
    }


    // задаю цикл отрисовки и в loop передаю свой обработчик 
    myGame.renderer.setAnimationLoop(animate);
    setSizeRender()

    // animation
    function animate() {
        const delta = myGame.clock.getDelta()

        // console.log(bot.controls.keyboard)
        bot.controls.update(delta)
        // меняем параметры куба - вращение
        if (myGame.scene.getObjectByName("Cube")) {
            const box = myGame.scene.getObjectByName("Cube")
            const axis = myGame.scene.getObjectByName("boxLocalAxis")
            box.rotation.x += -delta * delta * 10;
            box.rotation.y += delta;
            box.translateZ(delta * 2)
            // box.translateOnAxis(new THREE.Vector3(0, 0, 1), delta * 10)
            // axis.position.set(...box.position)
            // axis.setRotationFromEuler(box.rotation)
        }


        // myGame.camera.rotation.y += delta*0.3;
        // myGame.camera.translateOnAxis(new THREE.Vector3(0, 0, -1), delta * 10)


        myGame.controls[0].update(delta)

        if (myGame.controls[1]) {
            // console.log(myGame.controls[1])
            myGame.controls[1].update(delta)

        }


        if (myGame.camera.position.y <= 0)
            myGame.camera.position.y = 0




        render()
    }


    const keyPressed = {
        "KeyW": [false, 87],
        "KeyA": [false, 65],
        "KeyS": [false, 83],
        "KeyD": [false, 68],
        // "shift": true,
        // "ctrl": false,
        // "space": false,
        // "e": false,
        // "r": false,
        // "f": false,
        // "Escape": false
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

    myGame.canvas.addEventListener("resize", setSizeRender)

    myGame.canvas.addEventListener("dblclick", (event) => {
        // if (event.target === myGame.canvas) {
        if (document.fullscreenElement) {
            document.exitFullscreen()
            setSizeRender()
        } else {
            myGame.canvas.requestFullscreen()
            setSizeRender()
        }
        // }
    })

    window.addEventListener('keydown', (event) => {
        myGame.addLog(event.code)
    });

}
document.addEventListener("DOMContentLoaded", main)
