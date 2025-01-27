import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


type PolyTrees = { [key: string]: THREE.Group<THREE.Object3DEventMap> }
export class LowPolyTrees {
    private _loader: GLTFLoader;
    private ['_PineTree']: THREE.Group<THREE.Object3DEventMap>;
    private ['_LeafTree']: THREE.Group<THREE.Object3DEventMap>;
    private ['_SnowyTree']: THREE.Group<THREE.Object3DEventMap>;


    constructor() {
        this._loader = new GLTFLoader().setPath("/")
        this._PineTree = new THREE.Group();

        this._LeafTree = new THREE.Group();

        this._SnowyTree = new THREE.Group();
    }

    getPineTree(name: string, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group()
        model.name = "_PineTree"

        if (!this._PineTree.children.length) {
            this._loader.load("low_poly_trees_pine.glb", (glb) => {
                this._PineTree.add(glb.scene.getObjectByName("Root")!.clone());
                // console.log(this._PineTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;
    }
    getTree(name: string, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group()
        model.name = "_LeafTree"

        if (!this._LeafTree.children.length) {
            this._loader.load("low_poly_trees.glb", (glb) => {
                this._LeafTree.add(glb.scene.getObjectByName("Root")!.clone());
                // console.log(this._LeafTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;

    }
    getSnowyTree(name: string, positionXYZ = new THREE.Vector3(0, 0, 0)) {
        const model = new THREE.Group();
        model.name = "_SnowyTree";

        if (!this._SnowyTree.children.length) {
            this._loader.load("low_poly_trees_snowy.glb", (glb) => {
                this._SnowyTree.add(glb.scene.getObjectByName("Root")!.clone());
                // console.log(this._SnowyTree);
                this.addTreeToModel(name, model, positionXYZ);
            });
        } else {
            this.addTreeToModel(name, model, positionXYZ);
        }

        return model;
    }
    private getTreeGroup(name: string): THREE.Group | null {
        switch (name) {
            case "_PineTree":
                return this._PineTree;
            case "_LeafTree":
                return this._LeafTree;
            case "_SnowyTree":
                return this._SnowyTree;
            default:
                return null;
        }
    }
    addTreeToModel(name: string, model: THREE.Object3D, positionXYZ: THREE.Vector3) {
        // if (!this[model.name]) {
        //     console.warn("Model not loaded yet.");
        //     return;
        // }

        let tree: THREE.Object3D | null = null;
        const treeGroup = this.getTreeGroup(model.name);
        if (!treeGroup) {
            console.warn(`Tree group ${model.name} not found.`);
            return;
        }
        if (!name) {
            const item = this._getRandomArbitrary(1, 6);
            tree = treeGroup.getObjectByName(`Tree_${item}`)!;
        } else {
            tree = treeGroup.getObjectByName(name)!;
        }

        if (tree) {
            const clonedTree = tree.clone(); // Клонируем дерево, чтобы избежать дублирования ссылок
            model.add(clonedTree);
            this.toDefault(clonedTree);
            this._setHeight(clonedTree, this._getRandomArbitrary(5, 25))
            model.position.copy(positionXYZ); // Используем copy для установки позиции
        } else {
            console.warn(`${model.name} not found.`);
        }
    }
    toDefault(tree: THREE.Object3D) {
        tree.position.set(0, 0, 0)
        tree.rotation.x = -Math.PI / 2
        tree.scale.set(1, 1, 1)
    }

    _getRandomArbitrary(min: number, max: number) {
        return Math.round(Math.random() * (max - min) + min);
    }

    _setHeight(obj: THREE.Object3D, targetHeight: number) {
        // Вычисление ограничивающего прямоугольника для всей группы
        const boundingBox = new THREE.Box3().setFromObject(obj);
        // Размеры модели
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        let s = targetHeight / size.y
        obj.scale.multiplyScalar(s)

    }
}
