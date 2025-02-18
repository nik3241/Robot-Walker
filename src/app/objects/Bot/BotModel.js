"use strict"

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BotControls } from './BotControls';
import CannonDebugRenderer from '../../utils/CannonDebugRenderer';
// // Загрузка модели и первичное манипулирование
export class BotModel extends THREE.Mesh {


    constructor(game) {
        super()
        this.game = game
        this.name = "BotModel"
        this.controls = {}
        this.materials = new Set()
        this.body = new CANNON.Body({
            type: CANNON.Body.DYNAMIC,
            mass: 1,
            linearDamping: 0.9,
            angularDamping: 0.9,
            angularFactor: new CANNON.Vec3(0, 1, 0)
        })



        return this
    }
    async loadModel() {

        let glb = await new GLTFLoader().setPath("/").loadAsync("little_robot_5.glb")

        // выгружаем анимации
        this.animations.push(...glb.animations)
        // this.object.animations.push(...glb.animations)

        this.add(glb.scene) // группа с самим роботом

        // развернулмодель и поставил в центре карты
        // this.rotation.y = Math.PI
        // this.position.set(0, 0, 0)

        // получение материалов модели
        this.traverse(object => {
            // console.log("fjdknlnsujfnsdm", object)
            // это меш
            if (object.isMesh) {
                // добавляю уникальные материалы (ссылки на метериалы)

                this.materials.add(object.material)

                // настраиваю тени мешу
                object.castShadow = true
                object.receiveShadow = true
            }
        })

        // let tempVector = new THREE.Vector3(1, 5, 2)
        // console.log('tempVector', tempVector)
        // let vec = new CANNON.Vec3()
        // console.log('vec', vec)
        // vec.set(tempVector.x, tempVector.y, tempVector.z)
        // console.log('vec2', vec)

        this.addPhysicalBody()
        this.controls = new BotControls(this)

    }

    addPhysicalBody() {
        const colliderShape = new CANNON.Sphere(0.75)
        this.body.addShape(colliderShape, new CANNON.Vec3(0, 0.75, 0))
        // this.body.addShape(colliderShape, new CANNON.Vec3(0, 1.5, 0))
        this.body.position.set(0, 2, 0)
        // this.body.initQuaternion = new CANNON.Quaternion()
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI)
        // this.body.velocity = new CANNON.Vec3(100, 1, 0)
        // this.body.applyImpulse(
        //     // new CANNON.Vec3(1000, 1, 0)
        //     // new CANNON.Vec3(0, 0, 0)
        // )
        // .setFromEuler(3, Math.PI / 2, Math.PI / 2,"YZX")
    }

    update(delta) {
        this.controls.update(delta)

        this.position.set(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        )
        this.quaternion.set(
            this.body.quaternion.x,
            this.body.quaternion.y,
            this.body.quaternion.z,
            this.body.quaternion.w
        )
    }

}
