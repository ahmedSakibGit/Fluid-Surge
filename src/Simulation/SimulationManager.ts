import SimulationData from "./Data/SimulationData";
import SceneManager from "../3D/Scene/SceneManager";
import WebGPUManager from "../WebGPU/WebGPUManger";
import Fluidmanager from "./FluidManager";
import PipelineManager from "./Pipelines/PipelineManager";
import ContainerManager from "../3D/Container/ContainerManager";

class SimulationManager {
    private simulationData: SimulationData;
    private sceneManager: SceneManager;
    private webGPUManager: WebGPUManager;
    private fluidManager: Fluidmanager;
    private pipelineManager: PipelineManager;
    private containerManager: ContainerManager

    constructor(sceneManager: SceneManager, webGPUManager: WebGPUManager) {
        this.simulationData = this.getSimulationData();
        this.sceneManager = sceneManager;
        this.webGPUManager = webGPUManager;
        this.fluidManager = new Fluidmanager(this.simulationData, this.sceneManager);
        this.pipelineManager = new PipelineManager(this.webGPUManager, this.simulationData, this.sceneManager);
        this.containerManager = this.sceneManager.getContainerManager();
    }

    async init() {
        this.sceneManager.setContainer();
        this.fluidManager.init();
        const texture: BABYLON.RawTexture3D = await this.sceneManager.getContainderSDFTexture(this.simulationData.getSDFTextureResolution());
        this.pipelineManager.init({positions: this.fluidManager.getParticleData(), sdfTexture: texture}, this.containerManager);
    }

    getSimulationData(): SimulationData {
        if (this.simulationData) {
            return this.simulationData;
        }

        const data = {
            filled: 0.5,
            fluidCount: 200000,
            buffer: null,
            fluidToGridRatio: 0.6667,
            sdfTextureResolution: 64
        };

        return new SimulationData(data);
    }
}

export default SimulationManager;