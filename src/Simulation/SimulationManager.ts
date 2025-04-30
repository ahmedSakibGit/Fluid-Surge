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
        this.sceneManager = sceneManager;
        this.containerManager = this.sceneManager.getContainerManager();
        this.sceneManager.setContainer();
        this.simulationData = this.getSimulationData();
        
        this.webGPUManager = webGPUManager;
        this.fluidManager = new Fluidmanager(this.simulationData, this.sceneManager);
        this.pipelineManager = new PipelineManager(this.webGPUManager, this.simulationData, this.sceneManager);
        
    }

    async init() {
        this.fluidManager.init();
        const texture: BABYLON.RawTexture3D = await this.sceneManager.getContainderSDFTexture(64);
        this.pipelineManager.init({ positions: this.fluidManager.getParticleData(), sdfTexture: texture }, this.containerManager);
    }

    getSimulationData(): SimulationData {
        if (this.simulationData) {
            return this.simulationData;
        }

        const data = {
            filled: 0.5,
            fluidCount: 200000,
            restDensity: 4.0,  
            stiffness: 3.0,
            viscosity: 0.1,
            dt: 0.2,
            gravity: new BABYLON.Vector3(0.0, -98.1, 0.0),
            gridSpacing: 0.05,
            particleSpacing: 0.0325
        };
 
        return new SimulationData(data, this.containerManager);
    }
}

export default SimulationManager;