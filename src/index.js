"use strict"
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugRenderer from "./app/utils/CannonDebugRenderer"

import CannonUtils from "./app/utils/cannonUtils"

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js';
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


// Мои импорты
import "./styles/all.css"
import { Game } from "./app/Game"
import { Terrain } from "./app/objects/Terrain"
import { BotModel } from './app/objects/Bot/BotModel';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GameCamera } from './app/objects/GameCamera';
import { LowPolyTrees } from './app/objects/Trees/LowPolyTrees';

const _DEBUG = true
async function main() {
    const elem = document.getElementById("game")
    const myGame = new Game(elem)

    // const newCamera = new GameCamera()

    let cannonDebugRenderer

    const world = myGame.phisicsWorld

    window.myGame = myGame

    const stats = new Stats()
    stats.domElement.style = "position: absolute; top: 3px; left: 3px; cursor: pointer; opacity: 0.9; z-index: 10000;"
    console.log()
    elem.children[0].appendChild(stats.domElement)

    const generalFolder = myGame.gui.addFolder("General")
    const helperFolder = myGame.gui.addFolder("Helpers").close()
    const objectFolder = myGame.gui.addFolder("Objects")
    const lightFolder = myGame.gui.addFolder("Lights").close()


    myGame.displayMenuStart()
    initCannon()
    myGame.camera.position.set(0, 0, 0)
    myGame.camera.rotation.set(0, 0, 0)



    // папочки gui

    generalFolder.reset().add(myGame, "statisticsVisible")
        .onChange(() => { myGame.toggleStatistics(); setSizeRender(myGame.camera) })

    myGame.lights.children.forEach((light, index) => {
        const folder = lightFolder.addFolder(light.type + index)
        folder.add(light, "intensity").name("intensity").step(0.01)
        folder.addColor(light, "color", 255)
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
        helperFolder.close()
        myGame.helpers.children.forEach((child) => {
            helperFolder.add(child, 'visible').name(child.type)
        })
    }

    // Добавляю землю и воду

    let width = 500, height = 500, kSegments = 16

    const terrain = new Terrain(width, height, kSegments)
    await terrain.__init__()
    terrain.visible = false

    objectFolder.add(terrain, "visible").name("Земля")
    myGame.objects.add(terrain)




    // Загрузка модели и первичное манипулирование
    const bot = new BotModel(myGame)

    myGame.objects.add(bot)
    await bot.loadModel()
{
    generalFolder.add(bot.position, 'x')
    generalFolder.add(bot.position, 'y')
    generalFolder.add(bot.position, 'z')
    generalFolder.add(bot.rotation, 'x')
    generalFolder.add(bot.rotation, 'y')
    generalFolder.add(bot.rotation, 'z')}

    objectFolder.add(bot, "visible").name("робот")


    bot
        .add(new THREE.AxesHelper(3))
        .add(myGame.lights.children.at(-1))
    myGame.controls.push(bot.controls)
    myGame.addPhisicsBody(bot.body, 'bot')

    // PLANE

    /////////
    // start plane
    /////////
    const planeMesh = createGroundMesh()
    objectFolder.add(planeMesh, "visible").name("Плоскость")
    myGame.objects.add(planeMesh)

    var groundBody = createGroundBody(planeMesh)
    world.addBody(groundBody);
    updateMeshFromBody(planeMesh, groundBody)
    /////////
    // end plane
    /////////
    const trees = new LowPolyTrees()
    const treesGroup = new THREE.Group()
    myGame.objects.add(treesGroup)
    for (let index = 0; index < 15; index++) {

        treesGroup.add(trees.getTree('', new THREE.Vector3(
            trees._getRandomArbitrary(0, 45),
            0,
            trees._getRandomArbitrary(0, 45),
        )))
    }



    function generateBoxes(count = 5) {

        const result = []
        const boxMeshMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            flatShading: true,
            name: "Box_mtl"
        })
        for (let i = 0; i < count; i++) {
            const halfExtents = new CANNON.Vec3(Math.random() * 2, Math.random() * 2, Math.random() * 2)
            const boxShape = new CANNON.Box(halfExtents)
            const boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2)
            const x = (Math.random() - 0.5) * 20
            // const y = 2 + i * 2
            const y = halfExtents.y * 2 + (Math.random()) * 20
            const z = (Math.random() - 0.5) * 20
            const boxBody = new CANNON.Body({
                mass: 1,
                // material: groundMaterial
            })
            boxBody.addShape(boxShape)
            boxBody.position.set(x, y, z)
            world.addBody(boxBody)
            const boxMesh = new THREE.Mesh(boxGeometry, boxMeshMaterial)


            myGame.scene.add(boxMesh)
            boxMesh.castShadow = true
            boxMesh.receiveShadow = true

            result.push({ mesh: boxMesh, body: boxBody })

        }
        return result
    }
    function generateIcosahedron(count = 5) {

        const result = []
        const meshMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            flatShading: true,
            name: "Icosahedron_mtl"
        })

        for (let i = 0; i < count; i++) {
            const geometry = new THREE.IcosahedronGeometry(0.5 + Math.random() * 3, 0)
            const shape = CannonUtils.CreateConvexPolyhedron(geometry)

            const x = (Math.random() - 0.5) * 20 - 10
            // const y = 2 + i * 2
            const y = (Math.random()) * 8
            const z = (Math.random() - 0.5) * 20 - 10
            const body = new CANNON.Body({
                mass: 0.5 + Math.random() * 5,
            })
            body.addShape(shape)
            body.position.set(x, y, z)
            world.addBody(body)
            const mesh = new THREE.Mesh(geometry, meshMaterial)


            myGame.scene.add(mesh)
            mesh.castShadow = true
            mesh.receiveShadow = true

            result.push({ mesh, body })

        }
        return result
    }
    function generateTorusKnot(count = 5) {

        const result = []
        const meshMaterial = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            flatShading: true,
            name: "TorusKnot_mtl"
        })

        for (let i = 0; i < count; i++) {
            const temp = 0.5 + Math.random() * 3
            const geometry = new THREE.TorusKnotGeometry(temp, 0.1 * temp, 32, 6)
            const shape = CannonUtils.CreateTrimesh(geometry)

            const x = (Math.random() - 0.5) * 20 - 10
            // const y = 2 + i * 2
            const y = (Math.random()) * 8
            const z = (Math.random() - 0.5) * 20 - 10
            const body = new CANNON.Body({
                mass: 0.5,
            })
            body.addShape(shape)
            body.position.set(x, y, z)
            world.addBody(body)
            const mesh = new THREE.Mesh(geometry, meshMaterial)


            myGame.scene.add(mesh)
            mesh.castShadow = true
            mesh.receiveShadow = true

            result.push({ mesh, body })

        }
        return result
    }
    const boxes = generateBoxes()
    const Icosahedrons = generateIcosahedron()
    const TorusKnots = generateTorusKnot(0)

    // куб
    const cubeSize = 1

    // физическое тело
    const cubeBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(cubeSize, cubeSize, cubeSize))
    })
    world.addBody(cubeBody)
    cubeBody.position.set(0, 2.5, 4)
    console.log("кубик физическое тело", cubeBody)


    // геометрическое тело
    const geometry = new THREE.BoxGeometry(2 * cubeSize, 2 * cubeSize, 2 * cubeSize);
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        flatShading: true,
        name: "Cube_mtl"
    })
    const cudeMesh = new THREE.Mesh(geometry, material);
    cudeMesh.name = "Cube"
    cudeMesh.castShadow = true


    myGame.scene.add(cudeMesh);
    console.warn(world)

    objectFolder
        .add(cudeMesh, "visible").name("Куб")
    const boxLocalAxisHelper = new THREE.AxesHelper(10)
    boxLocalAxisHelper.name = "boxLocalAxis"
    cudeMesh.add(boxLocalAxisHelper)




    // задаю цикл отрисовки и в loop передаю свой обработчик 
    myGame.renderer.setAnimationLoop(animate);
    setSizeRender(myGame.camera)

    // setSizeRender(newCamera)
    console.log(cannonDebugRenderer)

    // animation
    function animate() {
        const delta = myGame.clock.getDelta()

        bot.update(delta)
        updateMeshFromBody(cudeMesh, cubeBody)
        for (let i = 0; i < boxes.length; i++) {
            updateMeshFromBody(boxes[i].mesh, boxes[i].body)
        }
        for (let i = 0; i < Icosahedrons.length; i++) {
            updateMeshFromBody(Icosahedrons[i].mesh, Icosahedrons[i].body)
        }
        for (let i = 0; i < TorusKnots.length; i++) {
            updateMeshFromBody(TorusKnots[i].mesh, TorusKnots[i].body)
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
        console.log(this)
        console.log(myGame.camera)
        myGame.camera.aspect = parent.clientWidth / parent.clientHeight
        myGame.camera.updateProjectionMatrix();
        myGame.renderer.setSize(parent.clientWidth, parent.clientHeight, false)
        myGame.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    }
    function updateMeshFromBody(mesh, body) {
        // console.log(mesh, body)
        mesh.position.set(
            body.position.x,
            body.position.y,
            body.position.z
        )
        mesh.quaternion.set(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w
        )
    }

    function initCannon() {
        const gravity = myGame.phisicsWorld.gravity
        const physicsFolder = myGame.gui.addFolder('Physics')
        physicsFolder.add(gravity, 'x', -10.0, 10.0, 0.1)
        physicsFolder.add(gravity, 'y', -10.0, 10.0, 0.1)
        physicsFolder.add(gravity, 'z', -10.0, 10.0, 0.1)
        physicsFolder.open()

        initCannonDebagger()
    }

    function initCannonDebagger() {

        cannonDebugRenderer = new CannonDebugRenderer(myGame.scene, world)
    }

    function createGroundMesh() {
        const planeTexture = new THREE.TextureLoader().setPath("/").load("grass.png")
        const size = 10

        const plane = new THREE.PlaneGeometry(size * 25, size * 25, size, size)
        const planeMTL = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            map: planeTexture,
            metalness: 1
        })
        planeMTL.map.repeat.set(4 * size, 4 * size)

        planeMTL.map.wrapS =
            planeMTL.map.wrapT = THREE.RepeatWrapping
        const planeMesh = new THREE.Mesh(plane, planeMTL)
        planeMesh.name = "Plane"
        planeMesh.receiveShadow = true

        return planeMesh
    }

    function createGroundBody(mesh) {
        var groundBody = new CANNON.Body({
            mass: 0 // mass == 0 makes the body static
        });
        var groundShape = new CANNON.Plane();
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

        groundBody.position.y = -.2


        mesh.position.copy(groundBody.position)
        mesh.quaternion.copy(groundBody.quaternion)

        return groundBody
    }



    /////////// Raycaster //////////////// 
    // {
    //     const raycaster = new THREE.Raycaster();

    //     document.addEventListener('mousedown', onMouseDown);

    //     function onMouseDown(event) {
    //         // координаты от -1 до 1, с нулем в центре
    //         const coords = new THREE.Vector2(
    //             (event.clientX / myGame.renderer.domElement.clientWidth) * 2 - 1,
    //             -((event.clientY / myGame.renderer.domElement.clientHeight) * 2 - 1),
    //         );

    //         raycaster.setFromCamera(coords, myGame.camera);

    //         const intersections = raycaster.intersectObjects(myGame.scene.children, true);
    //         if (intersections.length > 0) {
    //             const selectedObject = intersections[0].object;
    //             const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    //             selectedObject.material.color = color;
    //             console.log(`${selectedObject.name.toUpperCase()} was clicked! By coords: ${coords.x.toFixed(4)} ${coords.y.toFixed(4)}`);
    //         }
    //     }
    // }
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


}
document.addEventListener("DOMContentLoaded", main)
