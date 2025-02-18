"use strict"
import { Clock, Group, Vector2 } from "three"
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import * as CANNON from 'cannon-es';

import { GameScene } from "./objects/GameScene"
import { GameCamera } from "./objects/GameCamera"
import { GameRenderer } from "./objects/GameRenderer"
import { GameHelpers } from "./objects/GameHelpers"
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import keyList from "../../temp/keyList";

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
    lights = this.scene.lights
    helpers = new GameHelpers()
    objects = new Group()
    clock = new Clock()
    controls = []
    menu
    startBtn
    isPointerLocked = false

    // высота и ширина изображения рендера
    renderViewPort = new Vector2(0, 0)

    phisicsWorld = new CANNON.World({
        gravity: new CANNON.Vec3(0, -8, 0)
    })
    phisicsBodys = new Map()
    nextBodyIndex = 0


    constructor(domGame) {


        // console.log(this.scene.getObjectByName("lights"))
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

            this.displayKeyHelper() // нажатие кнопок
            this.displayViewportHelper() // рамочка на экране

            document.querySelector("#game .viewport-wrapper ").insertAdjacentHTML('afterbegin', `<div id="menuPanel">
                <button id="startButton">Click to Start</button>
            </div>`)
            this.menu = document.getElementById("menuPanel")
            this.startBtn = document.getElementById('startButton')
            this.startBtn.addEventListener('click', () => { this.canvas.requestPointerLock(); })
            this.isPointerLocked = false


            this.gui = new GUI({ container: this.domElement.querySelector(".gui") })


        }


        // добавление на сцену хелперов и объектов 
        this.scene.name = "my games scene"
        this.scene.add(this.helpers)
        this.scene.add(this.objects)
        this.objects.name = "objects"


        // console.log(this.objects)
        this.addLog("Игра создана", "lime")
        return this
    }

    displayMenuStart() {

        document.addEventListener('pointerlockchange', () => {
            const bot = this.scene.getObjectByName("BotModel")
            console.log(bot)
            if (bot)
                if (document.pointerLockElement === this.canvas) {
                    this.isPointerLocked = true

                    this.startBtn.style.display = 'none'
                    this.menu.style.display = 'none'

                    bot.controls.connect()

                } else {
                    this.menu.style.display = 'block'
                    this.isPointerLocked = false
                    bot.controls.disconnect()

                    setTimeout(() => {
                        this.startBtn.style.display = 'block'
                    }, 1000)
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
        // const viewport = document.querySelector(".viewport-hendler")
        // const innerBox = viewport.children[0]
    }


    displayKeyHelper() {

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
    addPhisicsBody(body, name) {
        let lastbody
        if (name)
            lastbody = this.phisicsBodys.set(name, body)
        else
            lastbody = this.phisicsBodys.set(this.nextBodyIndex, body)

        this.nextBodyIndex += 1



        this.phisicsWorld.addBody(body)
        body.sleepState
        return lastbody
    }
}