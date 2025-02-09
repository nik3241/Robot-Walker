
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
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

        this.deccelerationDefault = 1
        this.decceleration = this.deccelerationDefault
        // скорость движения
        this.isAccelerating = false // двигаемся?
        this.maxSpeedForward = 15
        this.maxSpeedBackward = this.maxSpeedForward * 0.2

        this.velocity = new THREE.Vector3(0, 0, 0); // вектор перемещения  (группы `car`)

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
                if (animations[i].name === 'stop') {
                    animations[i].duration = 5
                    console.log(animations[i])
                }
                this.possibleClips[animations[i].name] = animations[i]
                this._setAction(animations[i].name)
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

    setAction = (toAction, loop) => {
        if (toAction != this.activeAction) {
            this.lastAction = this.activeAction
            this.activeAction = toAction
            this.lastAction.fadeOut(0.1)
            this.activeAction.reset()
            this.activeAction.fadeIn(0.1)
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

    nextIdelAnim(e) {
        // this.onResetAllActions()

        if (e.action.getClip().name === 'Yes/No' ||
            e.action.getClip().name === 'drift' ||
            e.action.getClip().name === 'stop' ||
            e.action.getClip().name === 'SpinAround') {
            // some code
            this.onResetAllActions()
            if (this.indexOrderOfIdel < this.orderOfIdel.length) {
                this.indexOrderOfIdel++
            }
            else {
                this.indexOrderOfIdel = 0
            }
            this.setAction(this.orderOfIdel[this.indexOrderOfIdel], false)
        }
    }
    kdLisener = (e) => { this.onkeydown(e) }

    kuLisener = (e) => { this.onkeyup(e) }
    connect() {
        console.log("connect")
        window.addEventListener('keydown', this.kdLisener.bind(this)); // добавим прослушиватель события нажатия клавиш
        window.addEventListener('keyup', this.kuLisener.bind(this));   // ~ отжатия клавиш

    }
    disconnect() {
        console.log("disconnect")
        // function
        window.removeEventListener('keydown', this.kdLisener.bind(this)); // добавим прослушиватель события нажатия клавиш
        window.removeEventListener('keyup', this.kuLisener.bind(this));   // ~ отжатия клавиш
    }
    dispose() {
        this.disconnect();
    }

    onkeydown(kEvent) {
        console.log(this.keyboard)
        console.log(kEvent)
        this.keyboard[kEvent.code] = true
    }
    onkeyup(kEvent) {
        this.keyboard[kEvent.code] = false
    }

    onResetAllActions() {
        console.log('resetanim')
        this.mixer.stopAllAction()
    }


    animationMove() {


        // иначе если нет направления движения и скорости то Idel анимация
        // если есть направление движения

        if (this.keyboard["KeyW"] || this.keyboard["KeyS"]
            || this.keyboard["KeyA"] || this.keyboard["KeyD"]) {
            // анимация
            this.actions["walk"] = this.mixer.clipAction(this.possibleClips["walk"])
            // action.timeScale = 0.2
            if (this.actions["walk"].paused || !this.actions["walk"].isRunning())
                this.actions["walk"].play().fadeIn(0.3)

        } else {     // idel
            if (this.actions["walk"]?.isRunning())
                this.actions["walk"].stop()
            if (this.actions["fastDrive"]?.isRunning())
                this.actions["fastDrive"].stop()

            // добавить цепочку анимаций на спокойное ожидание
        }


        // ускорение — "fastDrive"
        if (this.keyboard["ShiftLeft"]) {
            this.actions["fastDrive"] = this.mixer.clipAction(this.possibleClips["fastDrive"])
            // action.timeScale = 0.2

            if (this.actions["fastDrive"].paused || !this.actions["fastDrive"].isRunning())
                this.actions["fastDrive"].play().fadeIn(0.3)

        } else {
            if (this.actions["fastDrive"]?.isRunning())
                this.actions["fastDrive"].stop()
        }

    }

    movePlayer(delta) {
        if (this.keyboard["KeyW"] && !this.keyboard["KeyS"]) {
            this.isAccelerating = true
            this.velocity.z += this.acceleration

            // ограничиваем максимальную скорость вперед
            if (this.velocity.z >= this.maxSpeedForward) {
                this.velocity.z = this.maxSpeedForward
            }
        }
        // назад и не в перед
        if (this.keyboard["KeyS"] && !this.keyboard["KeyW"]) {
            this.isAccelerating = true
            this.velocity.z -= this.acceleration

            // ограничиваем максимальную скорость вперед
            if (this.velocity.z <= -this.maxSpeedBackward) {
                this.velocity.z = -this.maxSpeedBackward
            }
        }
        // влево, и не в право
        if (this.keyboard["KeyA"] && !this.keyboard["KeyD"]) {
            // +       
            this.angleOfRotation += this.rotateSpeed

            this.object.rotation.y = this.angleOfRotation;
        }
        // вправо и не в лево
        if (this.keyboard["KeyD"] && !this.keyboard["KeyA"]) {
            // -
            this.angleOfRotation -= this.rotateSpeed

            this.object.rotation.y = this.angleOfRotation;
        }
        
        // сильное ускорение (гипердрайв) 
        if (this.keyboard["ShiftLeft"]) {
            this.acceleration = this.accelerationDefault * 1.5
        } else {
            this.acceleration = this.accelerationDefault
        }

        // сильное торможение (ручник)
        if (this.keyboard["Space"]) {
            // this.velocity.z = 0
            this.decceleration = this.deccelerationDefault * 1.5
        } else {
            this.decceleration = this.deccelerationDefault
        }
        this.stop(delta)
        this.object.translateZ(this.velocity.z * delta)
        this.object.rotation.y = this.angleOfRotation

        // this.animationMove()





        // this.stop(delta)

        // this.object.translateZ(this.velocity.z * delta)
        // this.object.rotation.y = this.angleOfRotation


        if (this.keyboard["KeyF"]) {
            this.object.translateY(-this.velocity.z * delta)
        }
        if (this.keyboard["KeyR"]) {
            this.object.translateY(this.velocity.z * delta)
        }
    }





    // Плавная остановка
    stop(delta) {
        // если двигаемся
        if (this.isAccelerating) {
            this.isAccelerating = false
        }
        else { // иначе тормозим

            if (this.velocity.z > 0) {
                this.velocity.z -= this.decceleration * delta
                // остановка   -0,5 <= velocity.z <= 0,5
                if (this.velocity.z <= this.decceleration)
                    this.velocity.z = 0
            }
            // this.velocity.z < 0
            else {
                this.velocity.z += this.decceleration * delta
                // остановка   -0,5 <= velocity.z <= 0,5
                if (this.velocity.z >= -this.decceleration)
                    this.velocity.z = 0
            }
        }
    }

    // фнукция обновления данных
    update(delta) {
        if (this.enabled) {
            this.movePlayer(delta)

            if (this.isAnimated) {
                if (this.mixer) {
                    // console.log("update Mixer")
                    this.mixer.update(delta);

                }
                this.animationMove()
            }

            if (this.isFollowPlayer && this.camera) {
                const target = this.object.position.clone().add(this.cameraOffsetTarget)
                const position = this.object.position.clone().add(this.cameraOffsetPosition)
                // this.camera.rotation.copy(this.object.rotation.clone())
                this.camera.position.copy(position)
                this.camera.lookAt(target)
            }
        }
        // console.log("this.actions", this.actions)
    }


    // подписка на слежение за объектом, 
    // в update производится пересчет положения, поворота и направления камеры
    followPlayer(camera, offsetView) {
        if (camera.isCamera) {
            this.isFollowPlayer = true
            this.camera = camera
            this.cameraOffsetTarget = new THREE.Vector3(0, 2, 0) // немного над объектом
            this.cameraOffsetPosition = new THREE.Vector3(0, 2.5, 5)

            this.cameraControl = new OrbitControls(camera)
            // camera.lookAt(this.object.position)
        }
    }
    // полностью удаляю камеру из конроллера и прекращаю отслеживать объект
    unfollowPlayer() {
        this.camera = null
        this.isFollowPlayer = false
    }

    // остановка только отслеживания объекта, камера остается в контроллере
    stopFollowPlayer() {
        this.isFollowPlayer = false
    }
}
export { BotControls }