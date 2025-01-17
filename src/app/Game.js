"use strict"
import { Clock, Group, Vector2 } from "three"
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

import { GameScene } from "./objects/GameScene"
import { GameCamera } from "./objects/GameCamera"
import { GameRenderer } from "./objects/GameRenderer"
import { GameHelpers } from "./objects/GameHelpers"
import keyList from "./utils/keyList";

const shortKeyList = [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    // "KeyQ",
    // "KeyE",
    // "KeyR",
    // "KeyF",
    "ShiftLeft",
    "ControlLeft",
    // "Space",
    // "Escape",
]

// класс игры
export class Game {
    title = "MyGame"
    domElement = document.createElement("article")
    canvas = document.createElement("canvas")
    statistics = document.createElement("aside")

    statisticsVisible = false

    log = new Array()

    scene = new GameScene()
    camera = new GameCamera()
    renderer = new GameRenderer({ canvas: this.canvas, antialias: true })
    lights = this.scene.getObjectByName("lights")
    helpers = new GameHelpers()
    objects = new Group()
    clock = new Clock()
    controls = [
        new FirstPersonControls(this.camera, this.canvas),
    ]

    // высота и ширина изображения рендера
    renderViewPort = new Vector2(0, 0)

    constructor(domGame) {
        console.log(this.scene.getObjectByName("lights"))
        if (domGame) {
            this.domElement = domGame
        } else {
            document.appendChild(this.domElement)
        }

        { // верстка макета
            this.domElement.setAttribute("id", "game")
            this.canvas.setAttribute("name", "main-viewport")

            this.canvas.setAttribute("tabindex", "1")
            // this.canvas.setAttribute("style", "width: 100%; height: 100%;")
            this.canvas.height = 450
            this.canvas.innerText = "Ваш браузер не поддерживает элемент canvas"

            this.domElement.insertAdjacentHTML("afterBegin", `<div class="viewport-wrapper"><div class="gui"></div></div>`)

            this.domElement.children[0].appendChild(this.canvas)

            this.statistics.setAttribute("name", "statistics")

            this.statistics.insertAdjacentHTML("afterbegin", `<div class="header">
                    <span class="title">Статистика</span>
                    <span class="close">></span>
                    </div>
                <div class="log"></div>`)
            this.domElement.appendChild(this.statistics)
            this.statistics.classList.toggle("hidden")

            this.displayKeyHelper()
            this.displayViewportHelper()
        }

        // настраиваем контролер от первого лица
        this.controls[0].movementSpeed = 2;
        this.controls[0].lookSpeed = 0.2;
        this.controls[0].activeLook = false

        // добавление на сцену хелперов и объектов 
        this.scene.name = "my games scene"
        this.scene.add(this.helpers)
        this.scene.add(this.objects)
        this.objects.name = "objects"


        // console.log(this.objects)
        this.addLog("Игра создана", "lime")
        return this
    }


    activeControl(index) {
        this.controls.forEach((control, idx) => {
            switch (control) {
                case control.activeLook: control.activeLook = false
                case control.enabled: control.enabled = false
            }
            if (idx === index) {
                if (control.activeLook != undefined)
                    control.activeLook = true
                control.enabled = true // для тех у кого 
            }


        })
    }

    displayViewportHelper() {
        // Добавляю элемент
        document.querySelector("#game .viewport-wrapper ").insertAdjacentHTML("afterbegin",
            `<div class="viewport-hendler">
                <div class="inner-box"></div>
            </div>`
        )

        // Получаю элементы
        const viewport = document.querySelector(".viewport-hendler")
        const innerBox = viewport.children[0]


    }

    displayKeyHelper() {
        // console.log("displayKeyHelper")
        // const keyControl = document.querySelector("#game .viewport-wrapper .keyboard-controllers-wrapper")
        // // удаляем старые подсказки управления
        // if (keyControl)
        //     keyControl.remove()

        // добавляем новый
        document.querySelector("#game .viewport-wrapper ").insertAdjacentHTML("afterbegin",
            `<div class="keyboard-controllers-wrapper">
            <div class="keyboard-controllers">
                <div class="key-special">
                    <div class="key ShiftLeft">Shift</div>
                    <div class="key ControlLeft">Ctrl</div>
                </div>

                <div class="key-move">
                    <div class="key key-empty"></div>
                    <div class="key KeyW">W</div>
                    <div class="key KeyE">E</div>
                    <div class="key KeyA">A</div>
                    <div class="key KeyS">S</div>
                    <div class="key KeyD">D</div>
                </div>
            </div>
        </div>`)

        window.addEventListener("keydown", onKeyDownKeyControl)
        window.addEventListener("keyup", onKeyUpKeyControl)

        function onKeyDownKeyControl(event) {
            // console.log(shortKeyList.includes(event.code))
            if (shortKeyList.includes(event.code))
                document.querySelector(`.${event.code}`).classList.add("pressed")
            return
        }
        function onKeyUpKeyControl(event) {
            // console.log(shortKeyList.indexOf(event.code))
            if (shortKeyList.includes(event.code))
                document.querySelector(`.${event.code}`).classList.remove("pressed")
            return
        }
    }

    toggleStatistics() {
        // если показывать, удаляем скрывание 
        if (this.statisticsVisible) {
            // hide statistic

            this.statistics.classList.remove("hidden")
            // console.log(this.statisticsVisible)
        }
        // иначе скрываем
        else {
            // hide statistic
            this.statistics.classList.add("hidden")
        }
    }
    addLog(message = "", colorText) {

        // console.log(message)
        const obj = { date: Date.now(), message }
        let index = this.log.push(obj)
        this.statistics.children[1].insertAdjacentHTML("afterBegin",
            `<p ${colorText ? "style='color:" + colorText + ";'" : ""}>
                <span class="date-time">${new Date(obj.date).toISOString()}</span> 
        // <span class="msg">${obj.message}</span></p>`)

        // console.log(message)
        return index;
    }
}




// window.onresize = () => {
//     console.log(`из window -- Новые размеры: ${myGame.canvas.width}x${myGame.canvas.height}`);
//     // game.setSizeCanvas()
// }



// const scene = new THREE.Scene();
// const canvas = document.querySelector('.canvas');

// const stats = new Stats();
// stats.showPanel(0);
// document.body.appendChild(stats.dom);

// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight,
// };

// const cursor = {
//     x: 0,
//     y: 0,
// };

// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.z = 5;
// camera.position.y = 0.8;

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// scene.add(camera);

// const gui = new dat.GUI({ closeFolders: true, width: 200 });

// const textureLoader = new THREE.TextureLoader();
// const color = textureLoader.load('/textures/lava/basecolor.jpg');
// const roughness = textureLoader.load('/textures/lava/roughness.jpg');
// const norm = textureLoader.load('/textures/lava/normal.jpg');
// const ao = textureLoader.load('/textures/lava/ambientOcclusion.jpg');
// const emissive = textureLoader.load('/textures/lava/emissive.jpg');
// const height = textureLoader.load('/textures/lava/height.png');

// const geometry = new THREE.SphereGeometry(2, 100, 100);
// const material = new THREE.MeshStandardMaterial({
//     map: color,
//     roughnessMap: roughness,
//     normalMap: norm,
//     aoMap: ao,
//     emissive: emissive,
//     displacementMap: height,
//     displacementScale: 0.3
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// gui.add(mesh.material, 'roughness').min(0).max(1);
// gui.add(mesh.material, 'aoMapIntensity').min(0).max(1);
// gui.add(mesh.material, 'displacementScale').min(0).max(1.5);
// gui.add(mesh.material.normalScale, 'x').min(0).max(5);
// gui.add(mesh.material.normalScale, 'y').min(0).max(5);


// const light = new THREE.AmbientLight(0xefefef, 1.5);
// const pointLight = new THREE.PointLight(0xff9000, 3);
// pointLight.position.set(3, 3, 3);
// const pointLight2 = new THREE.PointLight(0x000000, 6);
// pointLight2.position.set(-3, -3, 3);

// scene.add(light);
// scene.add(pointLight);
// scene.add(pointLight2)

// const renderer = new THREE.WebGLRenderer({ canvas });
// renderer.setSize(sizes.width, sizes.height);
// renderer.render(scene, camera);

// const clock = new THREE.Clock();
// const tick = () => {
//     stats.begin();
//     const delta = clock.getDelta();
//     mesh.rotation.y += delta * 0.2;

//     controls.update();
//     renderer.render(scene, camera);

//     stats.end();
//     window.requestAnimationFrame(tick);
// };

// tick();

// window.addEventListener('resize', () => {
//     // Обновляем размеры
//     sizes.width = window.innerWidth;
//     sizes.height = window.innerHeight;

//     // Обновляем соотношение сторон камеры
//     camera.aspect = sizes.width / sizes.height;
//     camera.updateProjectionMatrix();

//     // Обновляем renderer
//     renderer.setSize(sizes.width, sizes.height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.render(scene, camera);
// });

