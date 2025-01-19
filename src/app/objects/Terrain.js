"use strict"
import * as THREE from 'three';



export class Terrain extends THREE.Mesh {
    constructor(width, height, kSegments) {
        super()

        this.textures = []

        this.textures.push({
            name: "terrain",
            map: new THREE.TextureLoader().setPath("/terrain/").load("height-map-colored.png"),
            displacementMap: new THREE.TextureLoader().setPath("/terrain/").load("height-map.png"),
        })
        this.textures.push({
            name: "ocean",
            map: new THREE.TextureLoader().setPath("/terrain/").load("ocean-colored.png"),
            displacementMap: new THREE.TextureLoader().setPath("/terrain/").load("ocean.png"),
        })
        console.log("текстура высоты", this.textures[0].displacementMap)
        this.countTree = 10
        this.name = "Terrain"
        this.width = width ? width : 100
        this.height = height ? width : 100
        this.kSegments = kSegments ? kSegments : 8
        this.rotateX(-Math.PI / 2)
        // this.children.push( this.createTerrain())
        this.createTerrain()
        this.createOcean()


        // Включаем отбрасывание и прием динамических теней
        this.castShadow = true;
        this.receiveShadow = true;
        // console.log(this)
        return this
    }

    createTerrain() {

        const geometry = new THREE.PlaneGeometry(this.width, this.height, 32 * this.kSegments, 32 * this.kSegments);
        const material = new THREE.MeshPhongMaterial({
            // wireframeLinewidth: 10000,
            // flatShading: true,
            map: this.textures[0].map,
            emissiveMap: this.textures[0].map,
            emissiveIntensity: 0.1,
            displacementMap: this.textures[0].displacementMap,
            displacementScale: (this.width + this.height) / 2 / 10,
            // shininess: 0,
            // wireframe: true
        })
        const mesh = new THREE.Mesh(geometry, material)
        // Включаем отбрасывание и прием динамических теней
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = "place"

        this.add(mesh)

    }
    createOcean() {
        const geometry = new THREE.PlaneGeometry(
            this.width, this.height,
            32 * this.kSegments, 32 * this.kSegments
        );
        const material = new THREE.MeshPhongMaterial(
            {
                map: this.textures[1].map,
                emissiveMap: this.textures[1].map,
                emissiveIntensity: 0.3,
                displacementMap: this.textures[1].displacementMap,
                displacementScale: (this.width + this.height) / 100,
            });

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = "water"

        this.add(mesh)
    }

    createTree() {
        // хвоя
        const needlesG = new THREE.ConeGeometry(0.5, 1, 3)
        const needlesMtl = new THREE.MeshStandardMaterial({ color: 0x139621 })
        const meshNeedles = new THREE.Mesh(needlesG, needlesMtl)
    }

    // Функция для получения высоты по координатам X и Y
    getHeightAt(x, y) {
        // Преобразуем координаты X и Y в координаты текстуры
        const u = (x / this.width) + 0.5;
        const v = -(y / this.height) + 0.5;

        // Получаем пиксель из текстуры высот
        const pixel = this.getPixelFromTexture(this.textures[0].displacementMap, u, v);

        // Преобразуем пиксель в высоту
        const height = this.pixelToHeight(pixel);

        return height;
    }

    // Функция для получения пикселя из текстуры
    getPixelFromTexture(texture, u, v) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;
        context.drawImage(texture.image, 0, 0);

        const pixelX = Math.floor(u * canvas.width);
        const pixelY = Math.floor(v * canvas.height);
        const imageData = context.getImageData(pixelX, pixelY, 1, 1).data;

        // Предположим, что высота хранится в красном канале (R)
        return imageData[0];
    }

    // Функция для преобразования пикселя в высоту
    pixelToHeight(pixel) {
        // Предположим, что высота нормализована от 0 до 1
        return (pixel / 255) * maxHeight;
    }
}
