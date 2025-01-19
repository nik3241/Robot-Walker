
import * as THREE from 'three';

class BotControls {

    constructor(object, domElement = null) {
        // super(object, domElement);
        this.enabled = true
        this.object = object
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
        this.direction = new THREE.Vector3(0, 0, 1); // вектор направления  ~

        this.angleOfRotation = this.object.rotation.y
        this.rotateSpeed = Math.PI / 180 * 90 / 60 // 90градусов в секунду - дополнительный коэффициент поворота 

        this.keyboard = {}
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
            this.acceleration = this.accelerationDefault * 10
        } else {
            this.acceleration = this.accelerationDefault
        }

        // сильное торможение (ручник)
        if (this.keyboard["Space"]) {
            this.velocity.z = 0
            this.decceleration = this.deccelerationDefault * 10
        } else {
            this.decceleration = this.deccelerationDefault
        }

        this.object.translateZ(this.velocity.z * delta)
        this.object.rotation.y = this.angleOfRotation
        // console.log(this.keyboard)
        // console.log(this.velocity.z)
    }

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
        // // console.log(this.object)
        // var t = robot.position.addScaledVector(direction, delta)
        // myGame.camera.lookAt(robot.position)


        // if (this.isAccelerating) {
        //     // Если нажата кнопка, остановка не производится
        //     this.isAccelerating = false;
        // } else {
        //     // Постепенно останавливаем автомобиль, если кнопка не нажата
        //     stop();
        // }
    }

    // функция анимирования сцены
    // animate() {
    //     let delta = this.clock.getDelta() // вычисляем дельту времени
    //     this.update(delta)
    //     requestAnimationFrame(this.animate) // рекурсивный вызов для продолжения анимации
    // }

    lookAt(camera, offsetView) {
        if (camera.isCamera)
            camera.lookAt(this.object.position)
    }
}
export { BotControls }