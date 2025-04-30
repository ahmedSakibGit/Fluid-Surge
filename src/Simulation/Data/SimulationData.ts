import ContainerManager from "../../3D/Container/ContainerManager";

class SimulationData {
    private filled: number;
    private fluidCount: number;
    private restDensity: number;
    private stiffness: number;
    private viscosity: number;
    private dt: number;
    private gravity: BABYLON.Vector3;
    private particleVolume: number;
    private fluidVolume: number;
    private massPerParticle: number;
    private renderRadius: number;
    private gridSpacing: number;
    private gridDim: number;
    private gridNodeCount: number;
    private containerManager: ContainerManager;
    private containerMin: BABYLON.Vector3;
    private containerMax: BABYLON.Vector3;
    private particleSpacing: number;
    
    constructor({ filled, fluidCount, restDensity, stiffness, viscosity, dt, gravity, gridSpacing, particleSpacing}: { filled: number; fluidCount: number, restDensity: number, stiffness: number, viscosity: number, dt: number, gravity: BABYLON.Vector3, gridSpacing: number, particleSpacing: number }, containerManager: ContainerManager) {
        this.containerManager = containerManager;
        this.filled = filled;
        this.fluidCount = fluidCount;
        this.restDensity = restDensity;
        this.stiffness = stiffness;
        this.viscosity = viscosity;
        this.dt = dt;
        this.gravity = gravity;
        this.gridSpacing = gridSpacing;
        this.particleSpacing = particleSpacing
        this.fluidVolume = this.containerManager.getVolume(this.filled);
        this.particleVolume = this.fluidVolume / this.fluidCount;
        this.massPerParticle = this.particleVolume * this.restDensity;
        this.renderRadius = Math.cbrt((3 * this.particleVolume) / 4 / Math.PI);
        const containerSize = this.containerManager.getContainerSize();
        this.gridDim = Math.ceil(containerSize / gridSpacing);
        this.gridNodeCount = this.gridDim * this.gridDim * this.gridDim;
        const { boundsMin, boundsMax } = this.containerManager.getBounds();
        this.containerMin = boundsMin;
        this.containerMax = boundsMax;
    }

    update({ filled, fluidCount}: { filled: number; fluidCount: number; buffer: GPUBuffer}): void {
        this.filled = filled;
        this.fluidCount = fluidCount;
    }

    getData() {
        return {
            filled: this.filled,
            fluidCount: this.fluidCount
        };
    }
    
    getFilled(): number {
        return this.filled;
    }

    getFluidCount(): number {
        return this.fluidCount;
    }


    getGridDim(): number {
        return this.gridDim;
    }

    getGridNodeCount(): number {
        return this.gridNodeCount;
    }

    getGridSpacing(): number {
        return this.gridSpacing;
    }

    getMassPerParticle(): number {
        return this.massPerParticle;
    }

    getRenderRadius(): number {
        return this.renderRadius;
    }

    getGravity(): BABYLON.Vector3 {
        return this.gravity;
    }

    getDt(): number {
        return this.dt;
    }

    getViscosity(): number {
        return this.viscosity;
    }

    getStiffness(): number {
        return this.stiffness;
    }

    getRestDensity(): number {
        return this.restDensity;
    }

    getParticleVolume() {
        return this.particleVolume;
    }

    getContainerMin(): BABYLON.Vector3 {
        return this.containerMin;
    }

    getContainerMax(): BABYLON.Vector3 {
        return this.containerMax;
    }

    getParticleSpaing(): number {
        return this.particleSpacing;
    }

}

export default SimulationData;