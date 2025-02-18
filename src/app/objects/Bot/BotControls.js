
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GameCamera } from '../GameCamera';
class BotControls {

    constructor(object, animations = []) {
        // super(object, domElement);
        this.enabled = true
        this.object = object
        // console.log(object)
        // следовать за объектом
        this.isFollowPlayer = true

        // ускорение
        this.accelerationDefault = 3
        this.acceleration = this.accelerationDefault
        // замедление

        this.deccelerationDefault = 3
        this.decceleration = this.deccelerationDefault
        // скорость движения
        this.isAccelerating = false // двигаемся?
        this.maxSpeedForward = 15
        this.maxSpeedBackward = this.maxSpeedForward * 0.5

        this.movement = 0 // текущая скорость перемещения
        this.velocity = new CANNON.Vec3()
        this.euler = new THREE.Euler()
        this.quat = new THREE.Quaternion()

        this.angleOfRotation = this.object.rotation.y + Math.PI
        this.rotateSpeed = Math.PI / 180 * 90 / 60 // 90градусов в секунду - дополнительный коэффициент поворота 

        this.keyboard = {} // пулл нажатых кнопок


        // Настройка анимации и AnimationMixer
        this.isAnimated = false
        this.possibleClips = {}
        // this.clips = animations
        this.actions = {}
        this.orderOfIdel = []
        this.indexOrderOfIdel = 0

        this.activeAction
        this.lastAction
        // все анимационные действия
        this.mixer = new THREE.AnimationMixer(this.object); // Анимационный микшер для робота
        this.getClips(this.object.animations)

        // точка обозрения
        this.pivot = new THREE.Object3D() // точка обозрения -> приближение
        // this.pivot.position.set(0, 10, 10)

        this.yaw = new THREE.Object3D() // обзор лево-право
        this.pitch = new THREE.Object3D() // обзор тангаж

        this.object.game.scene.add(this.pivot)
        this.pivot.add(this.yaw)
        this.yaw.rotation.y = 0.39
        this.yaw.add(this.pitch)

        // this.yaw.rotation.x = -0.39
        this.pitch.add(this.object.game.camera)
        this.object.game.camera.position.z = 5


        this.targetQuaternion = new THREE.Quaternion()
        const p = this.object.position
        p.y -= 1
        const rotationMatrix = new THREE.Matrix4()
        rotationMatrix.lookAt(this.pivot.position, this.object.position, this.object.up)
        this.targetQuaternion.setFromRotationMatrix(rotationMatrix)

        this.startIdelAnimation()
        console.log(this.mixer)
    }

    // ["drift","fastDrive","SpinAround", "stop","walk", "Yes/No"])
    getClips(animations) {
        console.log('get clips')
        if (!animations.length) {
            animations = this.object.animations
        }
        if (animations.length > 0) {
            this.isAnimated = true

            for (let i = 0; i < animations.length; i++) {

                this.possibleClips[animations[i].name] = animations[i]
                this._setAction(animations[i].name)

                if (animations[i].name === 'stop') {
                    animations[i].duration = 5
                    this.activeAction = this.actions['stop']
                    console.log('this.lastAction', this.lastAction)
                }
            }

            this.setOrderIdel()
        }
        else {
            console.warn("***Animation not found***")
        }
    }

    _setAction(name) {
        if (name && this.possibleClips[name])
            this.actions[name] = this.mixer.clipAction(this.possibleClips[name])
        // if (name = 'stop')
        //     this.lastAction = this.actions[name]
    }
    setOrderIdel() {
        this.orderOfIdel.push(...[
            this.actions['stop'],
            this.actions['Yes/No'],
            this.actions['stop'],
            this.actions['drift'],
            this.actions['stop'],
            this.actions['SpinAround']
        ])
        console.log(this.orderOfIdel)
    }

    setAction = (toAction, loop = false) => {
        console.log(toAction.getClip().name)
        if (toAction != this.activeAction) {
            this.lastAction = this.activeAction
            this.activeAction = toAction
            this.lastAction.fadeOut(0.3)
            this.activeAction.reset()
            this.activeAction.fadeIn(0.3)
            this.activeAction.play()
            if (!loop) {
                this.activeAction.clampWhenFinished = true
                this.activeAction.loop = THREE.LoopOnce
            }
        }
    }

    startIdelAnimation() {
        this.mixer.addEventListener('finished', e => this.nextIdelAnim(e));

    }
    stopIdelAnimation() {
        // this.mixer.hasEventListener
        this.mixer.removeEventListener('finished', e => this.nextIdelAnim(e));
    }

    nextIdelAnim(e) {
        // some code
        console.log("next Idel Anim", e)
        this.onResetAllActions()
        if (this.indexOrderOfIdel < this.orderOfIdel.length) {
            this.indexOrderOfIdel++
        }
        else {
            this.indexOrderOfIdel = 0
        }
        this.setAction(this.orderOfIdel[this.indexOrderOfIdel], false)

    }
    kdLisener = (e) => { this.onkeydown(e) }
    kuLisener = (e) => { this.onkeyup(e) }
    mMoveListener = (e) => { this.onDocumentMouseMove(e) }
    mWheelListener = (e) => { this.onDocumentMouseWheel(e) }

    connect() {
        console.log("connect")
        window.addEventListener('keydown', this.kdLisener.bind(this), false); // добавим прослушиватель события нажатия клавиш
        window.addEventListener('keyup', this.kuLisener.bind(this), false);   // ~ отжатия клавиш
        this.object.game.canvas.addEventListener('mousemove', this.mMoveListener.bind(this), false)
        this.object.game.canvas.addEventListener('wheel', this.mWheelListener.bind(this), false)
    }
    disconnect() {
        console.log("disconnect")
        // function
        window.removeEventListener('keydown', this.kdLisener.bind(this), false); // добавим прослушиватель события нажатия клавиш
        window.removeEventListener('keyup', this.kuLisener.bind(this), false);   // ~ отжатия клавиш
        this.object.game.canvas.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this), false)
        this.object.game.canvas.removeEventListener('wheel', this.onDocumentMouseWheel.bind(this), false)
    }
    dispose() {
        this.disconnect();
    }

    onkeydown(kEvent) {
        // console.log(this.keyboard)
        // console.log(kEvent)
        this.keyboard[kEvent.code] = true
    }
    onkeyup(kEvent) {
        this.keyboard[kEvent.code] = false
    }
    onDocumentMouseMove(e) {
        e.preventDefault()
        console.log(e)
        this.yaw.rotation.y -= e.movementX * 0.002
        const v = this.pitch.rotation.x - e.movementY * 0.002
        if (v > -1 && v < 0.1) {
            this.pitch.rotation.x = v
        }
    }

    onDocumentMouseWheel(e) {
        // console.log(this.object.game.camera)
        // console.log(this.object.game.camera)
        e.preventDefault()
        const v = this.object.game.camera.position.z + e.deltaY * 0.005
        if (v >= 0.5 && v <= 5) {
            this.object.game.camera.position.z = v
        }
    }
    onResetAllActions() {
        console.log('resetanim')
        this.mixer.stopAllAction()
    }


    animationMove() {
        // иначе если нет направления движения и скорости то Idel анимация
        // если есть направление движения

        if (this.movement.z !== 0) {
            // анимация

            if (this.actions["walk"].paused || !this.actions["walk"].isRunning()) {
                this.stopIdelAnimation()
                this.setAction(this.actions["walk"], true)
            }

        } else {     // idel
            if (this.actions["walk"].isRunning() || this.actions["fastDrive"].isRunning()) {
                this.startIdelAnimation()
            }


            // добавить цепочку анимаций на спокойное ожидание
        }


        // ускорение — "fastDrive"
        if (this.keyboard["ShiftLeft"]) {
            this.actions["fastDrive"] = this.mixer.clipAction(this.possibleClips["fastDrive"])
            // action.timeScale = 0.2

            if (this.actions["fastDrive"].paused || !this.actions["fastDrive"].isRunning())
                this.actions["fastDrive"].play().fadeIn(15)

        } else {
            if (this.actions["fastDrive"]?.isRunning())
                this.actions["fastDrive"].stop()
        }

    }

    movePlayer(delta) {
        delta
        if (this.keyboard["KeyW"] && !this.keyboard["KeyS"]) {
            this.isAccelerating = true
            this.movement += this.acceleration * delta
            // ограничиваем максимальную скорость вперед
            // if (this.movement >= this.maxSpeedForward) {
            //     this.movement = this.maxSpeedForward
            // }
            if (this.object.body.velocity.length() >= this.maxSpeedForward) {
                this.object.body.velocity.normalize()
                this.object.body.velocity.scale(this.maxSpeedForward)
            }
        }
        // назад и не в перед
        if (this.keyboard["KeyS"] && !this.keyboard["KeyW"]) {
            this.isAccelerating = true
            this.movement -= this.acceleration * delta

            // ограничиваем максимальную скорость вперед
            // if (this.movement <= -this.maxSpeedBackward) {
            //     this.movement = -this.maxSpeedBackward
            // }
            if (this.object.body.velocity.length() <= -this.maxSpeedBackward) {
                this.object.body.velocity.normalize()
                this.object.body.velocity.scale(-this.maxSpeedBackward)
            }
        }

        this.stop(delta)
        console.log('!!!!!! movement', this.movement)
        console.log('!!!!!! velocity', this.object.body.velocity)
        // this.object.body.position.vadd(new CANNON.Vec3(
        //     this.movement.x,
        //     this.movement.y,
        //     this.movement.z))
        // this.velocity= new CANNON.Vec3(
        //     this.movement.x,
        //     this.movement.y,
        //     this.movement.z,
        // )

        // this.movement.setLength(delta * 10)

        // apply camera rotation to inputVelocity
        this.euler.y = this.yaw.rotation.y + Math.PI
        this.euler.order = 'XYZ'
        this.quat.setFromEuler(this.euler)
        this.quat.normalize()

        let moveVec = new THREE.Vector3(0, 0, 1)
            .applyQuaternion(this.quat)
            .setLength(this.movement)

        this.object.body.quaternion.set(
            this.quat.x,
            this.quat.y,
            this.quat.z,
            this.quat.w
        )
        //ВАРИАНТ С ДОБАВЛЕНИЕМ ИМПУЛЬСА
        // this.object.body.applyImpulse(new CANNON.Vec3(
        //     moveVec.x,
        //     moveVec.y,
        //     moveVec.z
        // ),
        //     // new CANNON.Vec3(0, 0, 0)
        // )

        this.object.body.velocity.set(
            // new CANNON.Vec3(

            moveVec.x,
            moveVec.y,
            moveVec.z
        // ),

            // new CANNON.Vec3(0, 0, 0)
        )

        // ЧЕРЕЗ ОБНОВЕНИЕ ПОЗИЦИИ ШУСТРО СЛИШКОМ
        // this.object.body.position.x += moveVec.x
        // this.object.body.position.y += moveVec.y
        // this.object.body.position.z += moveVec.z



        // this.velocity
        //     .vmul(this.movement)
        // console.log("moveVec", moveVec)
        // console.log("velocity", this.velocity)

        // this.velocity


        //       this.movement.applyQuaternion(this.quat)

        // this.object.body.velocity.set(
        //     this.movement.x,
        //     this.movement.y,
        //     this.movement.z,)
        // if (this.keyboard["KeyW"] && !this.keyboard["KeyS"]) {
        //     this.isAccelerating = true
        //     this.movement.z += this.acceleration * delta

        //     // ограничиваем максимальную скорость вперед
        //     if (this.movement.z >= this.maxSpeedForward) {
        //         this.movement.z = this.maxSpeedForward
        //     }
        // }
        // // назад и не в перед
        // if (this.keyboard["KeyS"] && !this.keyboard["KeyW"]) {
        //     this.isAccelerating = true
        //     this.movement.z -= this.acceleration * delta

        //     // ограничиваем максимальную скорость вперед
        //     if (this.movement.z <= -this.maxSpeedBackward) {
        //         this.movement.z = -this.maxSpeedBackward
        //     }
        // }
        // влево, и не в право
        // if (this.keyboard["KeyA"] && !this.keyboard["KeyD"]) {
        //     // +       
        //     this.angleOfRotation += this.rotateSpeed

        //     this.object.rotation.y = this.angleOfRotation;
        // }
        // // вправо и не в лево
        // if (this.keyboard["KeyD"] && !this.keyboard["KeyA"]) {
        //     // -
        //     this.angleOfRotation -= this.rotateSpeed

        //     this.object.rotation.y = this.angleOfRotation;
        // }

        // // сильное ускорение (гипердрайв) 
        // if (this.keyboard["ShiftLeft"]) {
        //     this.acceleration = this.accelerationDefault * 1.5
        // } else {
        //     this.acceleration = this.accelerationDefault
        // }

        // // сильное торможение (ручник)
        // if (this.keyboard["Space"]) {
        //     // this.movement.z = 0
        //     this.decceleration = this.deccelerationDefault * 1.5
        // } else {
        //     this.decceleration = this.deccelerationDefault
        // }
        // this.stop(delta)
        // this.object.translateZ(this.movement.z * delta)
        // this.object.rotation.y = this.angleOfRotation




        // if (this.keyboard["KeyF"]) {
        //     this.object.translateY(-this.movement.z * delta)
        // }
        // if (this.keyboard["KeyR"]) {
        //     this.object.translateY(this.movement.z * delta)
        // }
    }

    // Плавная остановка
    stop(delta) {
        // если двигаемся
        if (this.isAccelerating) {
            this.isAccelerating = false
        }
        else { // иначе тормозим

            if (this.movement > 0) {
                this.movement -= this.decceleration * delta
                // остановка   -0,5 <= movement.z <= 0,5
                if (this.movement <= this.decceleration / 4)
                    this.movement = 0
            }
            // this.movement.z <= 0
            else {
                this.movement += this.decceleration * delta
                // остановка   -0,5 <= movement.z <= 0,5
                if (this.movement >= -this.decceleration / 4)
                    this.movement = 0
            }
        }
    }

    // фнукция обновления данных
    update(delta) {
        // console.log(delta)
        if (this.enabled) {
            this.movePlayer(delta)
            if (this.isAnimated) {
                if (this.mixer) {
                    // console.log("update Mixer")
                    this.mixer.update(delta);

                }
                this.animationMove()
            }
        }


        this.object.position.set(this.object.body.position.x, this.object.body.position.y, this.object.body.position.z)
        let v = this.object.matrix
        let pos =
            this.pivot.position.setFromMatrixPosition(v)

        // console.log('this.object', this.object.position)
        // console.log('this.object.body.position', this.object.body.position)
        // console.log('pivot', this.pivot.position, this.pivot.rotation)
        // console.log(this.yaw.position, this.yaw.rotation)
        // console.log(this.pitch.position, this.pitch.rotation)

        // console.log(this.object.game.camera.position, this.object.game.camera.rotation)
        // console.log("this.object", pos)
    }


    // подписка на слежение за объектом, 
    // в update производится пересчет положения, поворота и направления камеры
    // followPlayer(camera, offsetView) {
    //     if (camera.isCamera) {
    //         this.isFollowPlayer = true
    //         this.camera = camera
    //         this.cameraOffsetTarget = new THREE.Vector3(0, 2, 0) // немного над объектом
    //         this.cameraOffsetPosition = new THREE.Vector3(0, 2.5, 5)

    //         this.cameraControl = new OrbitControls(camera)
    //         // camera.lookAt(this.object.position)
    //     }
    // }
    // // полностью удаляю камеру из конроллера и прекращаю отслеживать объект
    // unfollowPlayer() {
    //     this.camera = null
    //     this.isFollowPlayer = false
    // }

    // // остановка только отслеживания объекта, камера остается в контроллере
    // stopFollowPlayer() {
    //     this.isFollowPlayer = false
    // }
}
export { BotControls }