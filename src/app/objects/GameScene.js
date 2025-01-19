"use strict"
import * as THREE from 'three';
import { GameLight } from './GameLight';

export class GameScene extends THREE.Scene {

    constructor() {
        super()
        this.background = new THREE.Color(0xb0f3f2);

        const environmentTexture = new THREE.CubeTextureLoader()
            .setPath('/enviroment/')
            .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
        this.environment = environmentTexture
        this.background = environmentTexture


        // освещение
        this.add(new GameLight())

    }
}