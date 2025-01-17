"use strict"
import * as THREE from 'three';
import { WaterMesh } from 'three/examples/jsm/objects/Water2Mesh.js';



export class Terrain extends THREE.Mesh {
    constructor(width, height, kSegments) {
        super()
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
        const defaultHeightMap = [
            new THREE.TextureLoader().load("./../../../public/terrain/height-map.png"),
            new THREE.TextureLoader().load("./../../../public/terrain/height-map-colored.png"),
        ]
        const geometry = new THREE.PlaneGeometry(this.width, this.height, 32 * this.kSegments, 32 * this.kSegments);
        const material = new THREE.MeshPhongMaterial({
            // wireframeLinewidth: 10000,
            // flatShading: true,
            map: defaultHeightMap[1],
            emissiveMap: defaultHeightMap[1],
            emissiveIntensity: 0.1,
            displacementMap: defaultHeightMap[0],
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
        const defaultHeightMap = [
            new THREE.TextureLoader().load("./../../../public/terrain/ocean.png"),
            new THREE.TextureLoader().load("./../../../public/terrain/ocean-colored.png"),
        ]

        const geometry = new THREE.PlaneGeometry(
            this.width, this.height,
            32 * this.kSegments, 32 * this.kSegments
        );
        const material = new THREE.MeshPhongMaterial(
            {
                // color: 0x6e6eff,
                map: defaultHeightMap[1],
                emissiveMap: defaultHeightMap[1],
                emissiveIntensity: 0.1,
                displacementMap: defaultHeightMap[0],
                displacementScale: (this.width + this.height) / 100,
                // shininess: 0.1,
                // metalness: 0.1
            });

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = "water"

        this.add(mesh)
    }

}