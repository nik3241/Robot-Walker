"use strict"
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Clock,
    Group,
    Vector2,
    Controls,
    Object3D,
    Object3DEventMap,
    Vector3,
    AxesHelper,
} from 'three';

import { GameScene } from "./objects/GameScene"
import { GameCamera } from "./objects/GameCamera"
import { GameRenderer } from "./objects/GameRenderer"
import { GameHelpers } from "./objects/GameHelpers"
// import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
// import keyList from "./utils/keyList";
import { FirstPersonControls } from 'three/examples/jsm/Addons';
import { BotModel } from './objects/Bot/BotModel';
import { Terrain } from './objects/Terrain';

type Log = { date: Date | number, message: string }
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
    scene: Scene = new GameScene()
    camera: PerspectiveCamera = new GameCamera()
    renderer: WebGLRenderer
    clock: Clock = new Clock()
    gui: GUI
    controls: Array<{}>
    objects: Group = new Group()
    lights!: Group | Object3D<Object3DEventMap>;
    helpers: Group = new GameHelpers()
    statisticsVisible: boolean = false
    canvas: HTMLCanvasElement;
    domElement: HTMLElement;
    statistics: HTMLElement;
    menu: HTMLElement;
    startBtn: HTMLElement;
    isPointerLocked: boolean = true
    log: Log[] = [];
    renderViewPort: Vector2;



    constructor(element: HTMLElement) {

        this.domElement = element

        this.canvas = document.createElement("canvas")
        this.statistics = document.createElement("aside")
        this.lights = this.scene.getObjectByName("lights")!
        this.renderer = new GameRenderer({ canvas: this.canvas, antialias: true })

        this.controls = [
            new FirstPersonControls(this.camera, this.canvas),
        ]

        // высота и ширина изображения рендера
        this.renderViewPort = new Vector2(0, 0)


        // верстка макета
        this.domElement.setAttribute("id", "game")
        this.canvas.setAttribute("name", "main-viewport")

        this.canvas.setAttribute("tabindex", "1")
        // this.canvas.setAttribute("style", "width: 100%; height: 100%;")
        this.canvas.height = 450
        this.canvas.innerText = "Ваш браузер не поддерживает элемент canvas"

        this.domElement.insertAdjacentHTML("afterbegin", `<div class="viewport-wrapper"><div class="gui"></div></div>`)

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

        document.querySelector("#game .viewport-wrapper ")!.insertAdjacentHTML('afterbegin', `<div id="menuPanel">
            <button id="startButton">Click to Start</button>
        </div>`)
        this.menu = document.getElementById("menuPanel")!
        this.startBtn = document.getElementById('startButton')!
        this.startBtn!.addEventListener('click', () => { this.canvas.requestPointerLock() })
        this.isPointerLocked = false

        this.gui = new GUI({ container: this.domElement.querySelector(".gui") as HTMLElement })

        // добавление на сцену хелперов и объектов 
        this.scene.name = "my games scene"
        this.scene.add(this.helpers)
        this.scene.add(this.objects)
        this.objects.name = "objects"


        // console.log(this.objects)
        this.addLog("Игра создана", "lime")

    }
    async createPlaces() {
        let width = 500, height = 500, kSegments = 16

        const terrain = new Terrain(width, height, kSegments)
        await terrain.__init__()
        this.objects.add(terrain)
    }
    async placeRobot() {
        // Загрузка модели и первичное манипулирование
        const bot = new BotModel()
        await bot.loadModel()
        // bot.controls.followPlayer(this.camera, new Vector3)
        console.log(bot)

        this.objects.add(bot)
        bot.object
            .add(new AxesHelper(3))
            .add(this.lights.getObjectByProperty("type", "DirectionalLight")!)

        this.displayMenuStart()
    }
    displayMenuStart() {

        document.addEventListener('pointerlockchange', () => {
            const bot = this.objects.getObjectByName("BotModel") as BotModel
            if (document.pointerLockElement === this.canvas) {
                this.isPointerLocked = true

                this.startBtn.style.display = 'none'
                this.menu.style.display = 'none'

                bot.controls?.connect()

            } else {
                this.menu.style.display = 'block'

                bot.controls?.disconnect()

                setTimeout(() => {
                    this.startBtn.style.display = 'block'
                }, 1000)
            }
        })
    }

    displayViewportHelper() {
        // Добавляю элемент
        document.querySelector("#game .viewport-wrapper ")!.insertAdjacentHTML("afterbegin",
            `<div class="viewport-hendler">
                <div class="inner-box"></div>
            </div>`
        )

        // Получаю элементы
        // const viewport = document.querySelector(".viewport-hendler")
        // const innerBox = viewport.children[0]
    }
    displayKeyHelper() {

        // добавляем новый
        document.querySelector("#game .viewport-wrapper ")!.insertAdjacentHTML("afterbegin",
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

        function onKeyDownKeyControl(event: KeyboardEvent) {
            // console.log(shortKeyList.includes(event.code))
            if (shortKeyList.includes(event.code))
                document.querySelector(`.${event.code}`)!.classList.add("pressed")
            return
        }
        function onKeyUpKeyControl(event: KeyboardEvent) {
            // console.log(shortKeyList.indexOf(event.code))
            if (shortKeyList.includes(event.code))
                document.querySelector(`.${event.code}`)!.classList.remove("pressed")
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

    addLog(message = "", colorText?: string) {

        // console.log(message)
        const obj: Log = { date: Date.now(), message }
        let index = this.log.push(obj)
        this.statistics.children[1].insertAdjacentHTML("afterbegin",
            `<p ${colorText ? "style='color:" + colorText + ";'" : ""}>
                <span class="date-time">${new Date(obj.date).toISOString()}</span> 
        // <span class="msg">${obj.message}</span></p>`)

        // return index;
    }
}