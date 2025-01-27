"use strict"
import * as THREE from 'three';


export class GameLight extends THREE.Group {
    flagCastShadow = true

    constructor() {
        super()
        // добавляю несколько объектов освещения
        // общий свет, и два точечных источника

        this.name = "lights"
        const light = new THREE.AmbientLight(0xffffff, 0.5);

        light.name = light.type


        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(-5, 110, 1)
        pointLight.castShadow = this.flagCastShadow;
        pointLight.name = pointLight.type

        // light blue
        const pointLight2 = new THREE.PointLight(0xffffff, 1.8);
        pointLight2.position.set(100, 60, -100);
        // Включаем создание динамических теней
        pointLight2.castShadow = this.flagCastShadow;
        pointLight.name = pointLight.type

        const directionLight = new THREE.DirectionalLight(0xffffff, 0.5)
        pointLight.name = pointLight.type

        directionLight.position.set(0, 1, 0).multiplyScalar(100)
        directionLight.target.position.set(-0.8, 0, -0.5).multiplyScalar(100)
        directionLight.castShadow = this.flagCastShadow
        directionLight.name = directionLight.type


        this.add(light)
        this.add(pointLight)
        this.add(pointLight2)
        this.add(directionLight)
    }
}
