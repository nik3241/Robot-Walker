import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class LowPolyTrees {
    constructor() {
        new THREE.Mesh()
    }

    getPineTree(name, positionXYZ = { x: 0, y: 0, z: 0 }) {
        const loader = new GLTFLoader().setPath("/")
        const model = new THREE.Group()
        model.name = "PineTree"

        console.log(model.name, name)
        loader.load("low_poly_trees_pine.glb", (glb) => {
            // console.log(glb)
            if (!name) {
                console.log()
                let item = this._getRandomArbitrary(1, 6)

                console.log()
                const tree = glb.scene.getObjectByName(`Tree_${item}`)

                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)

            }
            else {

                let item = this._getRandomArbitrary(1, 6)

                console.log(item)
                const tree = glb.scene.getObjectByName(name)
                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)
                console.log(tree)

            }
        })
        return model
    }
    getTree(name, positionXYZ = { x: 0, y: 0, z: 0 }) {
        const loader = new GLTFLoader().setPath("/")
        const model = new THREE.Group()
        model.name = "LeafTree"

        console.log(model.name, name)
        loader.load("low_poly_trees.glb", (glb) => {
            // console.log(glb)
            if (!name) {
                let item = this._getRandomArbitrary(1, 6)
                const tree = glb.scene.getObjectByName(`Tree_${item}`)
                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)

            }
            else {
                const tree = glb.scene.getObjectByName(name)
                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)

            }
        })
        return model
    }
    getSnowyTree(name, positionXYZ = { x: 0, y: 0, z: 0 }) {
        const loader = new GLTFLoader().setPath("/")
        const model = new THREE.Group()
        model.name = "SnowyTree"

        console.log(model.name, name)
        loader.load("low_poly_trees_snowy.glb", (glb) => {
            // console.log(glb)
            if (!name) {
                let item = this._getRandomArbitrary(1, 6)
                const tree = glb.scene.getObjectByName(`Tree_${item}`)
                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)
            }
            else {
                const tree = glb.scene.getObjectByName(name)
                tree.position.set(positionXYZ.x, positionXYZ.y, positionXYZ.z)
                tree.rotation.x = -Math.PI / 2
                tree.scale.set(1, 1, 1)
                model.add(tree)
            }
        })
        return model
    }
    loadModel() {

    }
    _getRandomArbitrary(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    _setHeight(obj, targetHeight) {
        // Вычисление ограничивающего прямоугольника для всей группы
        const boundingBox = new THREE.Box3().setFromObject(obj);
        // Размеры модели
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        let s = targetHeight / size.y
        obj.scale.multiplyScalar(s)

    }
}
