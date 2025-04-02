import SimulationData from "./Data/SimulationData";
import SceneManager from "../3D/Scene/SceneManager";
import WebGPUManager from "../WebGPU/WebGPUManger";
import Fluidmanager from "./FluidManager";
import PipelineManager from "./Pipelines/PipelineManager";

class SimulationManager {
    private simulationData: SimulationData;
    private sceneManager: SceneManager;
    private webGPUManager: WebGPUManager;
    private fluidManager: Fluidmanager;
    private pipelineManager: PipelineManager;

    constructor(sceneManager: SceneManager, webGPUManager: WebGPUManager) {
        this.simulationData = this.getSimulationData();
        this.sceneManager = sceneManager;
        this.webGPUManager = webGPUManager;
        this.fluidManager = new Fluidmanager(this.simulationData, this.sceneManager);
        this.pipelineManager = new PipelineManager(this.webGPUManager, this.simulationData, this.sceneManager);
    }

    async init() {
        this.sceneManager.setContainer();
        this.simulationData.setBuffer(this.sceneManager.getContainerBuffer());
        this.fluidManager.init();
        await this.pipelineManager.init(this.fluidManager.getParticleData());
    }

    getSimulationData(): SimulationData {
        if (this.simulationData) {
            return this.simulationData;
        }

        const data = {
            filled: 0.5,
            fluidCount: 200000,
            buffer: null,
            fluidToGridRatio: 0.6667
        };

        return new SimulationData(data);
    }
}

export default SimulationManager;