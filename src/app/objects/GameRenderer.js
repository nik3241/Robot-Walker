"use strict"
import * as THREE from 'three';

export class GameRenderer extends THREE.WebGLRenderer {
    constructor(parameters) {
        super(parameters)
        this.shadowMap.enabled = true;
    }
    setSizeRender(){
        
    }
}