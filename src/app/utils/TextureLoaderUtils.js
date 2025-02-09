import * as THREE from 'three';

class TextureLoaderUtils {

    textureLoader = new THREE.TextureLoader();
    constructor() {
    }

    setPath(path) {

        this.textureLoader.setPath(path);
        return this;
    }

    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(url, resolve, undefined, reject);
        });
    }

    // async loadTextures(terrainMapUrl, terrainDisplacementMapUrl, oceanMapUrl, oceanDisplacementMapUrl) {
    //     const terrainMap = await this.loadTexture(terrainMapUrl);
    //     const terrainDisplacementMap = await this.loadTexture(terrainDisplacementMapUrl);
    //     const oceanMap = await this.loadTexture(oceanMapUrl);
    //     const oceanDisplacementMap = await this.loadTexture(oceanDisplacementMapUrl);

    //     return [
    //         { name: "terrain", map: terrainMap, displacementMap: terrainDisplacementMap },
    //         { name: "ocean", map: oceanMap, displacementMap: oceanDisplacementMap }
    //     ];
    // }
}

export { TextureLoaderUtils };