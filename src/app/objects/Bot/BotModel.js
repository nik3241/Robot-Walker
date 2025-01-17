"use strict"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BotControls } from './BotControls';

// // Загрузка модели и первичное манипулирование
export class BotModel {
    name = "little_robot_5.glb"
    src = "/public/" + this.name
    materials = []
    animations = []
    object = new THREE.Group()


    constructor(myGame) {

        const loader = new GLTFLoader()

        loader.load(
            this.src,
            (glb) => {
                // выгружаем анимации
                this.animations.push(...glb.animations)
                console.log("анимации", this.animations)

                this.object.add(glb.scene) // группа с самим роботом

                // myGame.scene.add(this.object)
                // this.object.rotation.x = -Math.PI / 2
                this.object.position.set(0, 0, 0)
                this.object.name = "BotModel"

                // получение материалов модели
                glb.scene.traverse(object => {
                    // это меш
                    if (object.isMesh) {
                        // console.log(object.name, object.type, object.material.name)
                        // добавляю уникальные материалы
                        if (!this.materials.includes(object.material)) {
                            this.materials.push(object.material)
                        }
                        // настраиваю тени мешу
                        // object.castShadow = true
                        // object.receiveShadow = true
                    }
                })

                console.log("объект", this.object)


            },

        )

        return this
    }
}
