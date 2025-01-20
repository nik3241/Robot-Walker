"use strict"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BotControls } from './BotControls';
// // Загрузка модели и первичное манипулирование
export class BotModel {
    name = "little_robot_5.glb"
    src = "/" + this.name
    materials = []
    animations = []
    object = new THREE.Group()
    controls = new BotControls(this.object)

    constructor() {
        this.loadModel()
        return this
    }
    loadModel() {

        const loader = new GLTFLoader().setPath("/")
        loader.load("little_robot_5.glb", (glb) => {
            console.log(glb)
            // выгружаем анимации
            // this.animations.push(...glb.animations)
            this.object.animations.push(...glb.animations)
            console.log("анимации", this.object)

            this.object.add(glb.scene) // группа с самим роботом

            // развернулмодель и поставил в центре карты
            // glb.scene.rotation.x = -Math.PI / 2
            this.object.rotation.y = Math.PI
            this.object.position.set(0, 0, 0)
            this.object.name = "BotModel"

            // получение материалов модели
            this.object.traverse(object => {
                // это меш
                if (object.isMesh) {
                    // console.log(object.name, object.type, object.material.name)
                    // добавляю уникальные материалы (ссылки на метериалы)
                    if (!this.materials.includes(object.material)) {
                        this.materials.push(object.material)
                    }
                    // настраиваю тени мешу
                    object.castShadow = true
                    object.receiveShadow = true
                }
            })


            this.controls.connect()
        })

    }



}
