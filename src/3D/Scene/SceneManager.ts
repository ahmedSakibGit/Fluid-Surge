import CameraManager from "./Camera/CameraManager";
import LightManager from "./Light/LightManager";
import ContainerManager from "../Container/ContainerManager";

class SceneManager {
    private engine: BABYLON.WebGPUEngine;
    private scene: BABYLON.Scene;
    private cameraManager: CameraManager;
    private lightManager: LightManager;
    private canvas: HTMLCanvasElement;
    private containerManager: ContainerManager;

    constructor(canvas: HTMLCanvasElement, engine: BABYLON.WebGPUEngine) {
        this.canvas = canvas;
        this.engine = engine;
        this.scene = new BABYLON.Scene(this.engine);
        this.cameraManager = new CameraManager(this.scene, this.canvas);
        this.lightManager = new LightManager(this.scene);
        this.containerManager = new ContainerManager(this.scene);
    }

    init() {
        this.cameraManager.init();
        this.lightManager.init();
    }
    
    getScene(): BABYLON.Scene {
        return this.scene;
    }

    setContainer() {
        this.containerManager.setCube(2);
    }
    
    async getContainderSDFTexture(resolution: number): Promise<BABYLON.RawTexture3D> {
        return await this.containerManager.getSDFTexture(resolution);
    }

    getContainerManager() {
        return this.containerManager;
    }

    getContainer(): BABYLON.Mesh {
        return this.containerManager.getCurrentContainer();
    }


}

export default SceneManager;