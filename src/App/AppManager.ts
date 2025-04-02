import WebGPUManager from "../WebGPU/WebGPUManger";
import SceneManager from "../3D/Scene/SceneManager";
import SimulationManager from "../Simulation/SimulationManager";

class AppManager {
    private webGPUManager: WebGPUManager;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.webGPUManager = new WebGPUManager(canvas);
        this.canvas = canvas;
        this.canvas.style.zIndex = "0";
    }

    async init(): Promise<void> {
        await this.webGPUManager.initWebGPUEngine();
        const sceneManager = new SceneManager(this.canvas, this.webGPUManager.getEngine());
        sceneManager.init();
        const simulationManager = new SimulationManager(sceneManager, this.webGPUManager);
        await simulationManager.init();
    }
}

export default AppManager;