import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export class LowPolyTrees {


    constructor() {
        this._loader = new GLTFLoader().setPath("/")
        this._PineTree = new THREE.Group();

        this._LeafTree = new THREE.Group();

        this._SnowyTree = new THREE.Group();

    }

    getPineTree(name, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group()
        model.name = "_PineTree"

        if (!this._PineTree.children.length) {
            this._loader.load("low_poly_trees_pine.glb", (glb) => {
                this._PineTree.add(glb.scene.getObjectByName("Root").clone());
                // console.log(this._PineTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;
    }
    getTree(name, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group()
        model.name = "_LeafTree"

        if (!this._LeafTree.children.length) {
            this._loader.load("low_poly_trees.glb", (glb) => {
                this._LeafTree.add(glb.scene.getObjectByName("Root").clone());
                // console.log(this._LeafTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;

    }
    getSnowyTree(name, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group();
        model.name = "_SnowyTree";

        if (!this._SnowyTree.children.length) {
            this._loader.load("low_poly_trees_snowy.glb", (glb) => {
                this._SnowyTree.add(glb.scene.getObjectByName("Root").clone());
                // console.log(this._SnowyTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;
    }

    addTreeToModel(name, model, positionXYZ) {
        if (!this[model.name]) {
            console.warn("Model not loaded yet.");
            return;
        }

        let tree;
        if (!name) {
            const item = this._getRandomArbitrary(1, 6);
            tree = this[model.name].getObjectByName(`Tree_${item}`);
        } else {
            tree = this[model.name].getObjectByName(name);
        }

        if (tree) {
            const clonedTree = tree.clone(); // Клонируем дерево, чтобы избежать дублирования ссылок
            model.add(clonedTree);
            this.toDefault(clonedTree);
            this._setHeight(clonedTree, this._getRandomArbitrary(5, 25))
            model.position.copy(positionXYZ); // Используем copy для установки позиции
        } else {
            console.warn(`Tree ${name ? name : `Tree_${item}`} not found.`);
        }
    }
    toDefault(tree) {
        tree.position.set(0, 0, 0)
        tree.rotation.x = -Math.PI / 2
        tree.scale.set(1, 1, 1)
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
