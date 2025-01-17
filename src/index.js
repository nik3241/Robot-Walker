"use strict"
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Мои импорты
import "./styles/all.css"
import { Game } from "./app/game"
import { Terrain } from "./app/objects/Terrain"
import { BotControls } from './app/objects/Bot/BotControls'
import { BotModel } from './app/objects/Bot/BotModel';
import { rotate } from 'three/tsl';
import { VelocityShader } from 'three/examples/jsm/Addons.js';
// import { BotModel } from './app/objects/Bot/LoadBotModel';

const _DEBUG = true
function main() {
    const elem = document.getElementById("game")
    const myGame = new Game(elem)

    window.myGame = myGame



    // console.log("Конструктор игры", myGame)

    const stats = new Stats()
    stats.domElement.style = "position: absolute; top: 3px; left: 3px; cursor: pointer; opacity: 0.9; z-index: 10000;"
    // console.log()
    elem.children[0].appendChild(stats.domElement)

    const gui = new GUI({ container: elem.querySelector(".gui") })


    // console.log("размер области рендера: \n", myGame.renderer.width, myGame.renderer.height)

    const generalFolder = gui.addFolder("General")
    const cameraFolder = gui.addFolder("Camera")
    const helperFolder = gui.addFolder("Helpers").close()
    const objectFolder = gui.addFolder("Objects")
    const lightFolder = gui.addFolder("Lights").close()

    generalFolder.reset().add(myGame, "statisticsVisible")
        .onChange(() => { myGame.toggleStatistics() })



    myGame.lights.children.forEach((light, index) => {
        const folder = lightFolder.addFolder(light.type + index)
        folder.add(light, "intensity").name("intensity").step(0.01)
        folder.addColor(light, "color", 255)
    })

    myGame.camera.position.set(1, 2, 5)
    cameraFolder.add(myGame.camera.position, 'x').name("X").listen().step(0.01)
    cameraFolder.add(myGame.camera.position, 'y').name("Y").listen().step(0.01)
    cameraFolder.add(myGame.camera.position, 'z').name("Z").listen().step(0.01)
    cameraFolder.add(myGame.camera.rotation, 'x').name("rotatinon X").listen().step(0.01)
    cameraFolder.add(myGame.camera.rotation, 'y').name("rotatinon Y").listen().step(0.01)
    cameraFolder.add(myGame.camera.rotation, 'z').name("rotatinon Z").listen().step(0.01)



    // управление камерой от первого лица FirstPersonControls
    myGame.controls[0].enabled = false
    generalFolder.add(myGame.controls[0], "enabled")
        .name("FirstPersonControls")
        .listen()
        .onChange((value) => {
            // выбор используемого контроллера на сцене: 
            // контроллер свободной камеры или контроллер объекта
        })

    // хелперы на сцене
    {
        // отображение освещения
        myGame.helpers.add(new THREE.PointLightHelper(myGame.scene.children[0].children[1], 5))
        myGame.helpers.add(new THREE.PointLightHelper(myGame.scene.children[0].children[2], 5))


        // отображение осей
        myGame.helpers.add(new THREE.AxesHelper())

        // отображение метровой сетки
        myGame.helpers.add(new THREE.GridHelper(10, 10, 0x07b64a, 0x9807b5))

        // console.log(myGame.helpers.visible)
        helperFolder.add(myGame.helpers, 'visible').name("Отображение помощников")
        myGame.helpers.children.forEach((child) => {
            helperFolder.add(child, 'visible').name(child.type)
        })
    }

    // Добавляю землю и воду
    {
        let width = 500, height = 500, kSegments = 16

        const terrain = new Terrain(width, height, kSegments)
        terrain.visible = false

        // object.receiveShadow = true

        objectFolder.add(terrain, "visible").name("Земля")
        myGame.objects.add(terrain)
    }

    // Загрузка модели и первичное манипулирование
    const bot = new BotModel(myGame)
    // let length = myGame.controls.push(new BotControls(bot, myGame.canvas))
    bot.object.add(new THREE.AxesHelper(3))
    bot.object.children[0].position.set(0, 1, 1)
    console.log(bot.object)
    myGame.objects.add(bot.object)
    botFunc(bot.object)

    // myGame.scene.add(bot.object)

    // myGame.controls.push(bot.controls)
    // generalFolder.add(myGame.controls[length - 1], "enabled").listen().name("botControls Robot")






    // PLANE
    if (_DEBUG) {
        /////////
        // start plane
        /////////
        const size = 20
        const plane = new THREE.PlaneGeometry(size, size, size, size)
        const planeMTL = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            // wireframe: true
        })
        const planeMesh = new THREE.Mesh(plane, planeMTL)
        planeMesh.position.y = -0.01
        planeMesh.rotation.x = -Math.PI / 2
        planeMesh.name = "Plane"
        planeMesh.receiveShadow = true

        objectFolder.add(planeMesh, "visible").name("Плоскость")
        myGame.objects.add(planeMesh)
        /////////
        // end plane
        /////////
    }
    if (_DEBUG)
    // CUBE
    {

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            // wireframeLinewidth: 10000,
            color: Math.random() * 0xffffff,
            flatShading: true,
            // wireframe: true
        })
        material.name = "Cube_mtl"
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(-2, 1 / 2, 0)
        // добавление на сцену сетки. етка это геометрия и привязанный к нему матриалл
        mesh.name = "Cube"
        mesh.castShadow = true
        objectFolder.addFolder("Куб").close()
            .add(mesh, "visible").name("Куб")


        myGame.scene.add(mesh);

        const boxLocalAxisHelper = new THREE.AxesHelper(10)
        boxLocalAxisHelper.name = "boxLocalAxis"
        mesh.add(boxLocalAxisHelper)
        // boxLocalAxisHelper.position.set(mesh.position)
        // boxLocalAxisHelper.rotation.y = mesh.rotation.y
        // myGame.scene.add(boxLocalAxisHelper)
        // console.log(boxLocalAxisHelper)


        /////////
        // end BOX
        /////////
        myGame.addLog("на сцену добавлен куб с материалом")
        // myGame.controls.push(new BotControls(mesh, myGame.canvas))

        // myGame.controls.at(-1).connect()
        // myGame.controls.at(-1).enabled = true
    }


    // задаю цикл отрисовки и в loop передаю свой обработчик 
    myGame.renderer.setAnimationLoop(animate);
    setSizeRender()

    // animation
    function animate() {
        const delta = myGame.clock.getDelta()

        // меняем параметры куба - вращение
        if (myGame.scene.getObjectByName("Cube")) {
            const box = myGame.scene.getObjectByName("Cube")
            const axis = myGame.scene.getObjectByName("boxLocalAxis")
            // box.rotation.x += delta * 2;
            box.rotation.y += delta;
            box.translateZ(delta)
            // box.translateOnAxis(new THREE.Vector3(0, 0, 1), delta * 10)
            // axis.position.set(...box.position)
            // axis.setRotationFromEuler(box.rotation)
        }


        // myGame.camera.rotation.y += delta*0.3;
        // myGame.camera.translateOnAxis(new THREE.Vector3(0, 0, -1), delta * 10)


        myGame.controls[0].update(delta)

        if (myGame.controls[1]) {
            // console.log(myGame.controls[1])
            myGame.controls[1].update(delta)

        }




        if (myGame.objects.getObjectByName("BotModel")) {
            const bot = myGame.objects.getObjectByName("BotModel")
            const speed = 1
            // const rot = bot.rotation.y += delta
            // bot.position.z += delta * speed * Math.cos(-rot);
            // bot.position.x -= -delta * speed * Math.sin(rot);


            // bot.quaternion.random
        }

        if (myGame.camera.position.y <= 0)
            myGame.camera.position.y = 0




        render()
    }


    const keyPressed = {
        "KeyW": [false, 87],
        "KeyA": [false, 65],
        "KeyS": [false, 83],
        "KeyD": [false, 68],
        // "shift": true,
        // "ctrl": false,
        // "space": false,
        // "e": false,
        // "r": false,
        // "f": false,
        // "Escape": false
    }


    function botFunc(robot) {


        window.addEventListener('keydown', e => onkeydown(e)); // добавим прослушиватель события нажатия клавиш
        window.addEventListener('keyup', e => onkeyup(e));   // ~ отжатия клавиш

        // ускорение
        let acceleration = 0.1,
            // замедление
            decceleration = 0.05
        // скорость движения
        let isAccelerating = false // двигаемся?
        const maxSpeedForward = 100
        const maxSpeedBackward = maxSpeedForward * 0.2
        const velocity = new THREE.Vector3(0, 0, 0); // вектор перемещения  (группы `car`)
        const direction = new THREE.Vector3(0, 0, 1); // вектор направления  ~
        let angleOfRotation = 0
        const rotateMoveCoe = 0.05 // дополнительный коэффициент поворота
        const clock = new THREE.Clock()// просто время для отслежнивания изменений жизненного цикла приложения
        generalFolder.add({ angleOfRotation }, "angleOfRotation").listen().updateDisplay()

        // function onkeydown(e) {
        //     const delta = myGame.clock.getDelta()
        //     keyMap[e.keyCode] = e.type == 'keydown';
        //     console.log(keyMap)
        //     // shift +
        //     if (keyMap[16]) {
        //         console.log()
        //         acceleration = 0.1
        //         move()
        //     } else {
        //         acceleration = 0.01
        //         move()
        //     }

        // }
        function onkeydown(kEvent) {
            // console.log(kEvent)
            switch (kEvent.code) {
                case 'KeyW': // кнопка вверх
                    // keyPressed.KeyW[0] = true
                    move(1);
                    break;
                case 'KeyS': // кнопка вниз.
                    // keyPressed.KeyS[0] = true
                    move(-1);
                    break;
                case 'KeyA': // влево
                    // keyPressed.KeyA[0] = true
                    turning(1);
                    break;
                case 'KeyD': // вправо
                    // keyPressed.KeyD[0] = true
                    turning(-1);
                    break;
            }
        }


        function onkeyup(kEvent) {
            switch (kEvent.code) {
                case 'KeyW': // кнопка вверх
                case 'KeyS': // кнопка вниз
                    move(0);
                    break;
                case 'KeyA': // влево
                case 'KeyD': // вправо
                    turning(0);
                    break;
            }
        }


        // движение
        function move(value) {
            if (value === 1) {

                isAccelerating = true
                // console.log("move W")
                velocity.z += value * acceleration

                // ограничиваем максимальную скорость вперед
                if (velocity.z >= maxSpeedForward) {
                    velocity.z = maxSpeedForward
                }

                console.log("Front speed", velocity.z)
            }
            else if (value === -1) {
                isAccelerating = true
                // console.log("move S")
                velocity.z += value * acceleration


                // ограничиваем максимальную скорость назад
                if (velocity.z <= -maxSpeedBackward)
                    velocity.z = -maxSpeedBackward

                console.log("Back speed", velocity.z)
            }
            else if (value === 0) {

                isAccelerating = false
                // velocity.z = 0
                // actualMovementSpeed = 0
                if (velocity.z > 0)
                    velocity.z -= decceleration
                else
                    velocity.z += decceleration

                if (velocity.z <= 0.05 && velocity.z >= -0.05)
                    velocity.z = 0
                // стоя не поворачиваем
                // turning(0)
            }

        }
        // поворачивание
        function turning(value) {
            angleOfRotation += value * rotateMoveCoe

            robot.rotation.y = angleOfRotation;
        }


        // фнукция обновления данных
        function update(delta) {
            robot.translateZ(velocity.z * delta)
            // var t = robot.position.addScaledVector(direction, delta)
            myGame.camera.lookAt(robot.position)


            if (isAccelerating) {
                // Если нажата кнопка, остановка не производится
                isAccelerating = false;
            } else {
                // Постепенно останавливаем автомобиль, если кнопка не нажата
                stop();
            }
        }

        // функция анимирования сцены
        (function animate() {
            var delta = clock.getDelta(); // вычисляем дельту времени
            update(delta);
            requestAnimationFrame(animate); // рекурсивный вызов для продолжения анимации
        })();
    }




    function render() {

        stats.update()
        myGame.renderer.render(myGame.scene, myGame.camera);

    }

    function setSizeRender() {
        let parent = myGame.canvas.parentNode

        myGame.camera.aspect = parent.clientWidth / parent.clientHeight
        myGame.renderer.setSize(parent.clientWidth, parent.clientHeight, false)
        myGame.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        myGame.camera.updateProjectionMatrix();

    }



    /////////// Raycaster //////////////// 
    {
        const raycaster = new THREE.Raycaster();

        document.addEventListener('mousedown', onMouseDown);

        function onMouseDown(event) {
            // координаты от -1 до 1, с нулем в центре
            const coords = new THREE.Vector2(
                (event.clientX / myGame.renderer.domElement.clientWidth) * 2 - 1,
                -((event.clientY / myGame.renderer.domElement.clientHeight) * 2 - 1),
            );

            raycaster.setFromCamera(coords, myGame.camera);

            const intersections = raycaster.intersectObjects(myGame.scene.children, true);
            if (intersections.length > 0) {
                const selectedObject = intersections[0].object;
                const color = new THREE.Color(Math.random(), Math.random(), Math.random());
                selectedObject.material.color = color;
                console.log(`${selectedObject.name.toUpperCase()} was clicked! By coords: ${coords.x.toFixed(4)} ${coords.y.toFixed(4)}`);
            }
        }
    }
    /////////////////////////////////

    window.addEventListener("resize", setSizeRender)

    window.addEventListener("dblclick", (event) => {
        if (event.target === myGame.canvas) {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                setSizeRender()
            } else {
                myGame.canvas.requestFullscreen()
                setSizeRender()
            }
        }
    })

    window.addEventListener('keydown', (event) => {
        myGame.addLog(event.code)
    });

}
document.addEventListener("DOMContentLoaded", main)





// module.exports = { ...myGame }