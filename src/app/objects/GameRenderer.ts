"use strict"
import * as THREE from 'three';

export class GameRenderer extends THREE.WebGLRenderer {
    constructor(parameters?: THREE.WebGLRendererParameters) {
        super(parameters)
        this.shadowMap.enabled = true;
    }
    setSizeRender() {

    }
}