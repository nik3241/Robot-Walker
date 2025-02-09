"use strict"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BotControls } from './BotControls';
// // Загрузка модели и первичное манипулирование
export class BotModel {


    constructor() {
        this.name = "little_robot_5.glb"
        this.src = "/" + this.name
        this.materials = []
        this.animations = []
        this.object = new THREE.Group()
        this.controls = {}

        return this
    }
    async loadModel() {

        let glb = await new GLTFLoader().setPath("/").loadAsync("little_robot_5.glb")

        // выгружаем анимации
        // this.animations.push(...glb.animations)
        this.object.animations.push(...glb.animations)

        this.object.add(glb.scene) // группа с самим роботом

        // развернулмодель и поставил в центре карты
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

// console.log(this.object)
        this.controls = new BotControls(this.object)


    }



}
