import {
    Controls,
    MathUtils,
    Spherical,
    Vector3
} from 'three';

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();
const _targetPosition = new Vector3();

const keyPressed = {
    "w": true,
    "a": true,
    "s": false,
    "d": false,
    "shift": true,
    "ctrl": false,
    "space": false,
    "e": false,
    "r": false,
    "f": false,
    "Escape": false
}


class BotControls extends Controls {




    constructor(object, domElement = null) {

        super(object, domElement);

        this.enabled = true

        // скорость и максимальная скорость
        this.movementSpeed = 0
        this.maxSpeed = 5
        this.rotateSpeed = Math.PI / 3
        // ускорение
        this.acceleration = 0.001
        // направление, посути куда смотрим и двигаемся
        this.direction = new Vector3(0, 0, 1)


        this.angleDegrees = 0 // ровно вперед

        this._onKeyDown = onKeyDown.bind(this);
        this._onKeyUp = onKeyUp.bind(this);

        // if (domElement !== null) {

            this.connect();

            //     this.handleResize();

        // }

        this._setOrientation();

        console.log("constructor")
        // return this
    }


    connect() {
        console.log("connect")

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

    }

    disconnect() {
        console.log("disconnect")

        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);

    }

    dispose() {
        this.disconnect();
    }

    handleResize() {
        console.log("handleResize")

        if (this.domElement === document) {

            this._viewHalfX = window.innerWidth / 2;
            this._viewHalfY = window.innerHeight / 2;

        } else {

            this._viewHalfX = this.domElement.offsetWidth / 2;
            this._viewHalfY = this.domElement.offsetHeight / 2;

        }

    }

    lookAt(x, y, z) {
        console.log("lookAt")

        if (x.isVector3) {

            _target.copy(x);

        } else {

            _target.set(x, y, z);

        }

        this.object.lookAt(_target);

        this._setOrientation();

        return this;

    }

    update(delta) {

        if (this.enabled === false) return;

        if (this.heightSpeed) {

            const y = MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax);
            const heightDelta = y - this.heightMin;

            this._autoSpeedFactor = delta * (heightDelta * this.heightCoef);

        } else {

            this._autoSpeedFactor = 0.0;

        }

        const actualMoveSpeed = delta * this.movementSpeed;

        if (this._moveForward || (this.autoForward && !this._moveBackward))
            this.object.translateZ(- (actualMoveSpeed + this._autoSpeedFactor));
        if (this._moveBackward) this.object.translateZ(actualMoveSpeed);

        if (this._moveUp) this.object.translateY(actualMoveSpeed);
        if (this._moveDown) this.object.translateY(- actualMoveSpeed);

        const actualRotateSpeed = delta * this.rotateSpeed
        if (this._rotateLeft) this.object.rotateY(- actualRotateSpeed);
        if (this._rotateRight) this.object.rotateY(actualRotateSpeed);


        // let actualLookSpeed = delta * this.lookSpeed;

        // if (!this.activeLook) {

        //     actualLookSpeed = 0;

        // }

        // let verticalLookRatio = 1;

        // if (this.constrainVertical) {

        //     verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

        // }

        this._lon -= this._pointerX * actualRotateSpeed;
        if (this.lookVertical) this._lat -= this._pointerY * actualRotateSpeed /* * verticalLookRatio */;

        this._lat = Math.max(- 85, Math.min(85, this._lat));

        let phi = MathUtils.degToRad(90 - this._lat);
        const theta = MathUtils.degToRad(this._lon);

        if (this.constrainVertical) {

            phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);

        }

        const position = this.object.position;

        _targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

        this.object.lookAt(_targetPosition);

    }

    _setOrientation() {

        const quaternion = this.object.quaternion;

        _lookDirection.set(0, 0, - 1).applyQuaternion(quaternion);
        _spherical.setFromVector3(_lookDirection);

        this._lat = 90 - MathUtils.radToDeg(_spherical.phi);
        this._lon = MathUtils.radToDeg(_spherical.theta);

    }

    // listenKeyBoardEvent() {
    //     window.addEventListener("keydown", this.onKeyDown)
    //     window.addEventListener("keyup", this.onKeyUp)
    // }
    // discardKeyBoardEvent() {
    //     window.removeEventListener("keydown", this.onKeyDown)
    //     window.removeEventListener("keyup", this.onKeyUp)
    // }

    // onKeyDown(keyboardEvent) {
    //     console.log(
    //         this.accelerate(1))
    //     switch (keyboardEvent.key) {
    //         case "ArrowUp":
    //             this.accelerate(1)
    //             console.log("onKeyDown", keyboardEvent.key)
    //             break
    //         case "ArrowDown": {
    //             this.accelerate(-1)
    //             console.log("onKeyDown", keyboardEvent.key)
    //             break
    //         }
    //         case "ArrowLeft":
    //             this.accelerate(-.1)
    //             console.log("onKeyDown", keyboardEvent.key)
    //             break
    //         case "ArrowRight":
    //             this.accelerate(.1)
    //             console.log("onKeyDown", keyboardEvent.key)
    //             break
    //     }
    // }
    // onKeyUp(keyboardEvent) {
    //     switch (keyboardEvent.key) {
    //         case "ArrowUp":
    //         case "ArrowDown":
    //             this.accelerate(0)
    //             console.log("onKeyUp", keyboardEvent.key)
    //             break
    //         case "ArrowLeft":
    //         case "ArrowRight":
    //             this.accelerate(0)
    //             console.log("onKeyUp", keyboardEvent.key)
    //             break
    //     }
    // }
    // // направление движения 
    // // 0 нет движения
    // // + вперед или право
    // // - назад или лево 
    // accelerate(value) {

    //     // вычисление изменения координат?
    //     return console.log(value)
    // }
}

function onKeyDown(event) {

    switch (event.code) {

        case 'KeyW':
            console.log('KeyW')
            this._moveForward = true;
            break;

        case 'KeyA':
            console.log('KeyA')
            this._rotateLeft = true;
            break;

        case 'KeyS':
            console.log('KeyS')
            this._moveBackward = true;
            break;

        case 'KeyD':
            console.log('KeyD')
            this._rotateRight = true;
            break;

        case 'Space':
            this._moveUp = true;
            break;
        case 'ShiftLeft':
            this._moveDown = true;
            break;

    }

}

function onKeyUp(event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW': this._moveForward = false; break;

        case 'ArrowLeft':
        case 'KeyA': this._rotateLeft = false; break;

        case 'ArrowDown':
        case 'KeyS': this._moveBackward = false; break;

        case 'ArrowRight':
        case 'KeyD': this._rotateRight = false; break;

        case 'KeyR': this._moveUp = false; break;
        case 'KeyF': this._moveDown = false; break;

    }

}
export { BotControls }
// export default keyPressed