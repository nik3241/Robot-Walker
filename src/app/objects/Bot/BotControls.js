
import * as THREE from 'three';

class BotControls {

    constructor(object, domElement = null) {
        // super(object, domElement);
        this.enabled = true
        this.object = object
        // ускорение
        this.acceleration = 0.1
        // замедление
        this.decceleration = 0.15
        // скорость движения
        this.isAccelerating = false // двигаемся?
        this.maxSpeedForward = 100
        this.maxSpeedBackward = this.maxSpeedForward * 0.2

        this.velocity = new THREE.Vector3(0, 0, 0); // вектор перемещения  (группы `car`)
        this.direction = new THREE.Vector3(0, 0, 1); // вектор направления  ~

        this.angleOfRotation = 0
        this.rotateSpeed = Math.PI / 180 * 90 / 60 // 90градусов в секунду - дополнительный коэффициент поворота 

        this.clock = new THREE.Clock()// просто время для отслежнивания изменений жизненного цикла приложени
        // this.connect();


        // this.animate = this.animate.bind(this); // Позаботьтесь о контексте
        // this.animate(); // Запуск анимации
        console.log("constructor")
    }


    connect() {
        console.log("connect")
        window.addEventListener('keydown', e => this.onkeydown(e)); // добавим прослушиватель события нажатия клавиш
        window.addEventListener('keyup', e => this.onkeyup(e));   // ~ отжатия клавиш

    }

    disconnect() {
        console.log("disconnect")
        window.removeEventListener('keydown', e => this.onkeydown(e)); // добавим прослушиватель события нажатия клавиш
        window.removeEventListener('keyup', e => this.onkeyup(e));   // ~ отжатия клавиш
    }
    dispose() {
        this.disconnect();
    }

    onkeydown(kEvent) {
        console.log(kEvent)
        switch (kEvent.code) {
            case 'KeyW': // кнопка вверх
                // keyPressed.KeyW[0] = true
                this.move(1);
                break;
            case 'KeyS': // кнопка вниз.
                // keyPressed.KeyS[0] = true
                this.move(-1);
                break;
            case 'KeyA': // влево
                // keyPressed.KeyA[0] = true
                this.turning(1);
                break;
            case 'KeyD': // вправо
                // keyPressed.KeyD[0] = true
                this.turning(-1);
                break;
        }
    }
    onkeyup(kEvent) {
        switch (kEvent.code) {
            case 'KeyW': // кнопка вверх
            case 'KeyS': // кнопка вниз
                this.move(0);
                break;
            case 'KeyA': // влево
            case 'KeyD': // вправо
                this.turning(0);
                break;
        }
    }

    // движение: value -1,0,1 - направление движения и остановка
    move(value) {
        if (value === 1) {

            this.isAccelerating = true
            // console.log("move W")
            this.velocity.z += value * this.acceleration

            // ограничиваем максимальную скорость вперед
            if (this.velocity.z >= this.maxSpeedForward) {
                this.velocity.z = this.maxSpeedForward
            }

            console.log("Front speed", this.velocity.z)
        }
        else if (value === -1) {
            this.isAccelerating = true
            // console.log("move S")
            this.velocity.z += value * this.acceleration


            // ограничиваем максимальную скорость назад
            if (this.velocity.z <= -this.maxSpeedBackward)
                this.velocity.z = -this.maxSpeedBackward

            console.log("Back speed", this.velocity.z)
        }
    }

    // поворачивание: value -1,0,1 - направление поворота движения и остановка 
    turning(value) {
        console.log(this.angleOfRotation)
        this.angleOfRotation += value * this.rotateSpeed

        this.object.rotation.y = this.angleOfRotation;
    }

    // Плавная остановка
    stop() {
        this.isAccelerating = false
        // velocity.z = 0
        // actualMovementSpeed = 0
        if (this.velocity.z > 0)
            this.velocity.z -= this.decceleration
        else
            this.velocity.z += this.decceleration

        if (this.velocity.z <= 0.05 && this.velocity.z >= -0.05)
            this.velocity.z = 0
        // стоя не поворачиваем
        // turning(0)

    }

    // фнукция обновления данных
    update(delta) {
        // console.log(this.object)
        this.object.translateZ(this.velocity.z * delta)
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