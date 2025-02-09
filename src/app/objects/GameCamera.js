"use strict"
import { PerspectiveCamera } from 'three';

export class GameCamera extends PerspectiveCamera {
    constructor() {
        super(75, 16 / 9)
        this.name = "MainCamera"
        this.position.set(1, 2, 5);
        return this
    }
}