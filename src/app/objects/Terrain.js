"use strict"
import * as THREE from 'three';
import { LowPolyTrees } from './Trees/LowPolyTrees';
import { TextureLoaderUtils } from '../utils/TextureLoaderUtils'


export class Terrain extends THREE.Mesh {
    constructor(width, height, kSegments) {
        super()

        this.textures = {}
        this.objects = {}

        this.name = "Terrain"
        this.width = width ? width : 100
        this.height = height ? width : 100
        this.kSegments = kSegments ? kSegments : 8
        this.rotateX(-Math.PI / 2)

        // деревья
        this.countTree = 50
        this.trees = new THREE.Group()
        this.trees.name = "Trees"

        this._loader = new TextureLoaderUtils().setPath("/terrain/")
    }

    async __init__() {
        
        console.log('init')
        this.textures["terrain"] = {
            name: "terrain",
            map: await this._loader.loadTexture("height-map-colored.png"),
            displacementMap: await this._loader.loadTexture("height-map.png"),
        }
        this.textures["ocean"] = {
            name: "ocean",
            map: await this._loader.loadTexture("ocean-colored.png"),
            displacementMap: await this._loader.loadTexture("ocean.png"),
        }

        // земля
        const terrain = this.createTerrain()
        this.objects[terrain.name] = terrain
        this.add(terrain)

        // океан
        const ocean = this.createOcean()
        this.objects[ocean.name] = ocean
        this.add(ocean)

        this.objects[this.trees.name] = this.trees
        this.createTrees(this.countTree)
        this.add(this.trees)

        return this
    }

    createTrees(count) {
        const trees = new LowPolyTrees()
        if (count > 0)
            for (let i = 0; i < count; i++) {
                const typetree = trees._getRandomArbitrary(1, 3)
                let treeParams = {
                    x: trees._getRandomArbitrary(-this.width / 2, this.height / 2),
                    z: 0,
                    y: trees._getRandomArbitrary(-this.width / 2, this.height / 2),
                }
                treeParams.z = this.getHeightAt(treeParams.x, treeParams.y)

                let tree
                switch (typetree) {
                    case 1:
                        tree = trees.getPineTree("", treeParams)
                        break;
                    case 2:
                        tree = trees.getTree("", treeParams)
                        break;
                    case 3:
                        tree = trees.getSnowyTree("", treeParams)
                        break;

                    default:
                        break;
                }
                tree.rotateX(Math.PI / 2)
                this.trees.add(tree)
            }
    }

    createTerrain() {

        const geometry = new THREE.PlaneGeometry(this.width, this.height, 32 * this.kSegments, 32 * this.kSegments);
        const material = new THREE.MeshPhongMaterial({
            // wireframeLinewidth: 10000,
            // flatShading: true,
            map: this.textures['terrain'].map,
            // emissiveMap: this.textures[0].map,
            emissiveIntensity: 0.1,
            displacementMap: this.textures['terrain'].displacementMap,
            displacementScale: (this.width + this.height) / 2 / 10,
            // shininess: 0,
            // wireframe: true
        })
        const mesh = new THREE.Mesh(geometry, material)
        // Включаем отбрасывание и прием динамических теней
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = "terrain"

        return mesh

    }
    createOcean() {
        const geometry = new THREE.PlaneGeometry(
            this.width, this.height,
            32 * this.kSegments, 32 * this.kSegments
        );
        const material = new THREE.MeshPhongMaterial(
            {
                map: this.textures['ocean'].map,
                // emissiveMap: this.textures[1].map,
                emissiveIntensity: 0.3,
                displacementMap: this.textures['ocean'].displacementMap,
                displacementScale: (this.width + this.height) / 100,
            });

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = "water"

        return mesh
    }


    // Функция для получения высоты по координатам X и Y
    getHeightAt(x, y) {
        // console.log('x/y: ', x, y)
        // Преобразуем координаты X и Y в координаты текстуры
        const u = (x / this.width) + 0.5;
        const v = -(y / this.height) + 0.5;

        // console.log(this.textures['terrain'].displacementMap.source.data.height)
        // Получаем пиксель из текстуры высот
        const pixel = this.getPixelFromTexture(this.textures['terrain'].displacementMap, u, v);
        // Преобразуем пиксель в высоту
        const height = this.pixelToHeight(pixel);

        return height;
    }

    // Функция для получения пикселя из текстуры
    getPixelFromTexture(texture, u, v) {
        // console.log('texture', texture)
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
        const maxHeight = (this.width + this.height) / 2 / 10
        return (pixel / 255) * maxHeight;
    }
}
