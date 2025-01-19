"use strict"
import * as THREE from 'three';
export class LowPolyPineTree {
    constructor(trunkHeight = 0.4, trunkRadius = 0.1, foliageHeight = 1, foliageRadius = 1, foliageLevels = 3) {
        this.trunkHeight = trunkHeight;
        this.trunkRadius = trunkRadius;
        this.foliageLevels = foliageLevels;
        this.foliageHeight = foliageHeight;
        this.foliageRadius = foliageRadius;
        this.tree = new THREE.Group();
        this.tree.name = "tree"
        this.createTree();
        console.log(this.getTree())
    }
    shading() {
        this.tree.castShadow = true
        this.tree.receiveShadow = true
        this.tree.traverse((obj) => {
            if (obj.isObject3D) {
                obj.castShadow = true
                obj.receiveShadow = true
            }
        })
    }
    createTree() {
        // Создаем ствол
        const trunkGeometry = new THREE.CylinderGeometry(this.trunkRadius, this.trunkRadius, this.trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Коричневый цвет
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = this.trunkHeight / 2;
        trunk.name = "trunk"
        this.tree.add(trunk);

        // Создаем хвою
        const foliages = new THREE.Group()
        foliages.add(new THREE.AxesHelper())
        this.tree.add(foliages)
        let currentHeight = 0;
        for (let i = 0; i < this.foliageLevels; i++) {
            const foliageGeometry = new THREE.ConeGeometry(this.foliageRadius * (1 - i * 0.2), this.foliageHeight * (1 - i * 0.2), 5);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Зеленый цвет
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.name = "foliage " + i
            foliage.position.y = currentHeight * (1 - i * 0.2) + this.foliageHeight / 2;

            foliage.add(new THREE.AxesHelper())
            foliages.add(foliage);
            currentHeight += currentHeight * 0.8 + this.foliageHeight * (1 - i * 0.2) * 0.5; // Уменьшаем высоту для следующей пирамидки
        }
        foliages.position.y = this.trunkHeight * 0.8
        foliages.scale.y = 1.2
        this.shading()
    }

    getTree() {
        return this.tree;
    }
}