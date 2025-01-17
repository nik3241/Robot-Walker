"use strict"
import { PerspectiveCamera } from 'three';

export class GameCamera extends PerspectiveCamera {
    constructor(position) {
        super(75, 16 / 9)
        this.name = "MainCamera"
        this.position.set(5, 5, 5);
        return this
    }
}