import * as BABYLON from "@babylonjs/core";
import SimulationData from "./Data/SimulationData";
import SceneManager from "../3D/Scene/SceneManager";

class FluidManager {
    private simulationData: SimulationData;
    private sceneManager: SceneManager;
    private container: BABYLON.Mesh | null = null;

    constructor(simulationData: SimulationData, sceneManager: SceneManager) {
        this.simulationData = simulationData;
        this.sceneManager = sceneManager;
    }

    init() {
        this.container = this.sceneManager.getContainer();
    }

    getParticleData(): { positions: Float32Array;} {
        if (!this.container) {
            throw new Error("Container not found");
        }
    
        const boundingBox = this.container.getBoundingInfo().boundingBox;
        const containerSize = boundingBox.maximumWorld.subtract(boundingBox.minimumWorld);
        const containerPosition = this.container.position; // Get world position of the container
    
        const fluidCount = this.simulationData.getFluidCount();
        const positions = new Float32Array(fluidCount * 3);

        const particlesPerAxis = Math.ceil(Math.cbrt(fluidCount));
        const spacing = Math.min(containerSize.x, containerSize.z) / particlesPerAxis;
        let count = 0;

        for (let x = 0; x < particlesPerAxis && count < fluidCount; x++) {
            for (let y = 0; y < particlesPerAxis / 2 && count < fluidCount; y++) {
                for (let z = 0; z < particlesPerAxis && count < fluidCount; z++) {
                    const px = -containerSize.x / 2 + x * spacing + spacing / 2;
                    const py = -containerSize.y / 2 + y * spacing + spacing / 2;
                    const pz = -containerSize.z / 2 + z * spacing + spacing / 2;

                    positions[count * 3]     = px - containerPosition.x;
                    positions[count * 3 + 1] = py - containerPosition.y;
                    positions[count * 3 + 2] = pz - containerPosition.z;
                    count++;
                }
            }
        }
    
        return { positions};
    }

}

export default FluidManager;
