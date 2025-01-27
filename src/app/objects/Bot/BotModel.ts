"use strict"

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BotControls } from './BotControls';
// // Загрузка модели и первичное манипулирование
export class BotModel extends THREE.Object3D {
    name = "little_robot_5.glb"
    path = "/"
    materials: Set<THREE.Material> = new Set()
    animations: THREE.AnimationClip[] = []
    object = new THREE.Group()
    controls: BotControls | undefined

    constructor() { super() }

    async loadModel() {
        let glb = await new GLTFLoader().setPath(this.path).loadAsync(this.name)
        console.log(typeof glb)
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
            console.log(typeof object)
            if (object instanceof THREE.SkinnedMesh) {
                // console.log(object.name, object.type, object.material.name)
                // добавляю уникальные материалы (ссылки на метериалы)

                this.materials.add(object.material)

                // настраиваю тени мешу
                object.castShadow = true
                object.receiveShadow = true
            }
        })

        // console.log(this.object)
        this.controls = new BotControls(this.object)
        await this.controls.getClips(this.object.animations)

    }
}
