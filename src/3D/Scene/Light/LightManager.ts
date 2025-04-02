class LightManager {
    private scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }

    init() {
        new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(1, -1, 1), this.scene);
    }
}

export default LightManager;