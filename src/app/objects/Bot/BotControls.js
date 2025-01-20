
import * as THREE from 'three';

class BotControls {

    constructor(object, domElement = null) {
        // super(object, domElement);
        this.enabled = true
        this.object = object

        // следовать за объектом
        this.isFollowPlayer = true

        // ускорение
        this.accelerationDefault = 0.1
        this.acceleration = 0.1
        // замедление

        this.deccelerationDefault = 0.15
        this.decceleration = 0.15
        // скорость движения
        this.isAccelerating = false // двигаемся?
        this.maxSpeedForward = 15
        this.maxSpeedBackward = this.maxSpeedForward * 0.2

        this.velocity = new THREE.Vector3(0, 0, 0); // вектор перемещения  (группы `car`)

        this.angleOfRotation = this.object.rotation.y
        this.rotateSpeed = Math.PI / 180 * 90 / 60 // 90градусов в секунду - дополнительный коэффициент поворота 

        this.keyboard = {} // пулл нажатых кнопок


        // Настройка анимации и AnimationMixer
        this.isAnimated = false
        this.clips = {}
        this.actions = {}
        if (object.animations.length > 0) {
            this.isAnimated = true
            for (let i = 0; i < object.animations.length; i++) { // ["drift","fastDrive","SpinAround", "stop","walk", "Yes/No"])
                this.clips[object.animations.name]
                    = THREE.AnimationClip()
                        .findByName(object.animations, object.animations.name)
            }
        }
        // все анимационные действия
        this.animationMixer = new THREE.AnimationMixer(this.object); // Анимационный микшер для робота
    }


    connect() {
        // console.log("connect")
        window.addEventListener('keydown', e => this.onkeydown(e)); // добавим прослушиватель события нажатия клавиш
        window.addEventListener('keyup', e => this.onkeyup(e));   // ~ отжатия клавиш

    }
    disconnect() {
        // console.log("disconnect")
        window.removeEventListener('keydown', e => this.onkeydown(e)); // добавим прослушиватель события нажатия клавиш
        window.removeEventListener('keyup', e => this.onkeyup(e));   // ~ отжатия клавиш
    }
    dispose() {
        this.disconnect();
    }

    onkeydown(kEvent) {
        this.keyboard[kEvent.code] = true
    }
    onkeyup(kEvent) {
        this.keyboard[kEvent.code] = false
    }

    animationMove() {
        // вперед и назад "walk"
        if (this.keyboard["KeyW"] || this.keyboard["KeyS"]
            || this.keyboard["KeyA"] || this.keyboard["KeyD"]) {
            // анимация
            this.actions["walk"] = this.animationMixer.clipAction(this.clips["walk"])
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
            this.actions["fastDrive"] = this.animationMixer.clipAction(this.clips["fastDrive"])
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
            if (this.velocity.z <= this.maxSpeedBackward) {
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
        // кнопки движения отпущены
        // if (!this.keyboard["KeyS"] && !this.keyboard["KeyW"]) {
        //     this.stop(delta)
        // }

        // сильное ускорение (гипердрайв) 
        if (this.keyboard["ShiftLeft"]) {
            this.acceleration = this.accelerationDefault * 1.5
        } else {
            this.acceleration = this.accelerationDefault
        }

        // сильное торможение (ручник)
        if (this.keyboard["Space"]) {
            this.velocity.z = 0
            this.decceleration = this.deccelerationDefault * 1.5
        } else {
            this.decceleration = this.deccelerationDefault
        }

        this.object.translateZ(this.velocity.z * delta)
        this.object.rotation.y = this.angleOfRotation

        // this.animationMove()
        // this.stop()
    }

    // idelAnimation(animationNames = []) {
    //     const orderClip = [];
    //     if (!animationNames.length) {
    //         animationNames.push(...["SpinAround", "stop", "SpinAround", "stop", "drift", "stop", "Yes/No", "stop"])
    //     }

    //     for (let i = 0; i < animationNames.length; i++) {
    //         const clip = THREE.AnimationClip.findByName(this.clips, animationNames[i]);
    //         if (clip) {
    //             orderClip.push(clip);
    //         } else {
    //             console.warn(`Animation "${animationNames[i]}" not found.`);
    //         }
    //     }


    //     return orderClip
    // }

    // playAnimationsSequentially(orderClip) {
    //     if (this.currentAnimationIndex >= orderClip.length) {
    //         this.currentAnimationIndex = 0; // Начинаем сначала
    //     }
    //     console.log("индекс анимации", this.currentAnimationIndex)
    //     const clip = orderClip[this.currentAnimationIndex];
    //     if (clip) {
    //         const action = this.animationMixer.clipAction(clip);
    //         // action.reset().play();
    //         action.play()
    //         action.onComplete = () => {
    //             this.currentAnimationIndex++;
    //             if (this.currentAnimationIndex < orderClip.length) {
    //                 this.playAnimationsSequentially(orderClip);
    //             }
    //         };
    //     } else {
    //         console.warn('Animation not found.');
    //     }
    // }
    // move(value) {
    //     if (value === 1) {

    //         this.isAccelerating = true
    //         // console.log("move W")
    //         this.velocity.z += value * this.acceleration

    //         // ограничиваем максимальную скорость вперед
    //         if (this.velocity.z >= this.maxSpeedForward) {
    //             this.velocity.z = this.maxSpeedForward
    //         }

    //         console.log("Front speed", this.velocity.z)
    //     }
    //     else if (value === -1) {
    //         this.isAccelerating = true
    //         // console.log("move S")
    //         this.velocity.z += value * this.acceleration


    //         // ограничиваем максимальную скорость назад
    //         if (this.velocity.z <= -this.maxSpeedBackward)
    //             this.velocity.z = -this.maxSpeedBackward

    //         console.log("Back speed", this.velocity.z)
    //     }
    // }

    // поворачивание: value -1,0,1 - направление поворота движения и остановка 
    // turning(value) {
    //     console.log(this.angleOfRotation)
    //     this.angleOfRotation += value * this.rotateSpeed

    //     this.object.rotation.y = this.angleOfRotation;
    // }

    // Плавная остановка
    stop(delta) {
        if (this.isAccelerating) {
            this.isAccelerating = false
            // velocity.z = 0
            // actualMovementSpeed = 0
        } else {
            if (this.velocity.z > 0)
                this.velocity.z -= this.decceleration * delta
            else
                this.velocity.z += this.decceleration * delta
            //    -0,5 <= velocity.z <= 0,5
            if (this.velocity.z >= -0.5 && this.velocity.z <= 0.5)
                this.velocity.z = 0
        }

        // this.object.translateZ(this.velocity.z * delta)
        // this.object.rotation.set(this.angleOfRotation * delta)
    }

    // фнукция обновления данных
    update(delta) {
        this.movePlayer(delta)
        if (this.animationMixer) {
            this.animationMixer.update(delta);
        }

        if (this.isFollowPlayer && this.camera) {
            this.camera.lookAt(this.object.position)
            this.camera.position
        }
    }

    // функция анимирования сцены
    // animate() {
    //     let delta = this.clock.getDelta() // вычисляем дельту времени
    //     this.update(delta)
    //     requestAnimationFrame(this.animate) // рекурсивный вызов для продолжения анимации
    // }

    // подписка на слежение за объектом, 
    // в update производится пересчет положения, поворота и направления камеры
    followPlayer(camera, offsetView) {
        if (camera.isCamera) {
            this.isFollowPlayer = true
            this.camera = camera
            this.cameraOffsetTarget = new THREE.Vector3(0, 0, -3) // на 3 клетки вперед
            this.cameraOffsetPosition = new THREE.Vector3(0, 2.5, 5)
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