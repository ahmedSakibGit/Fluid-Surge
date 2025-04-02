import WebGPUManager from "../../WebGPU/WebGPUManger";
import SimulationData from "../Data/SimulationData";
import Render from "./Render/Render";
import SceneManager from "../../3D/Scene/SceneManager";
import Compute from "./Compute/Compute";
import BufferManager from "./Buffer/BufferManager";

class PipelineManager {
    private webGPUManager: WebGPUManager;
    private simulationData: SimulationData;
    private renderPipeline: Render;
    private computePipeline: Compute;
    private sceneManager: SceneManager;
    private bufferManager: BufferManager;
    private scene: BABYLON.Scene;
    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, sceneManager: SceneManager) {
        this.webGPUManager = webGPUManager;
        this.simulationData = simulationData;
        this.sceneManager = sceneManager;
        this.scene = sceneManager.getScene();
        this.bufferManager = new BufferManager(this.webGPUManager.getEngine(), simulationData);
        this.computePipeline = new Compute(this.webGPUManager, this.bufferManager, simulationData);
        this.renderPipeline = new Render(this.webGPUManager, this.simulationData, this.scene, this.bufferManager);
    }

    async init({ positions }: { positions: Float32Array }) {
        this.bufferManager.init(positions);
        this.computePipeline.init();
        this.renderPipeline.init();
        this.startRenderLoop();
        this.startComputeInterval();
    }

    private startRenderLoop() {
        const engine = this.scene.getEngine();
        engine.runRenderLoop(() => {
            this.computePipeline.update();
            this.scene.render();
        });
    }

    private startComputeInterval() {
        setInterval(() => {
            document.getElementById("fps").textContent = `FPS: ${this.scene.getEngine().getFps().toFixed(2)}`
            //this.computePipeline.update();
        }, 1000);
    }
}

export default PipelineManager;
