import SimulationData from "../../Data/SimulationData"

class BufferManager {
    private positionBuffer: BABYLON.StorageBuffer | null = null;
    private engine: BABYLON.WebGPUEngine;
    private simulationData: SimulationData;
    private gridBuffer: BABYLON.StorageBuffer | null = null;
    private velocityBuffer: BABYLON.StorageBuffer | null = null;
    private C0Buffer: BABYLON.StorageBuffer | null = null;
    private C1Buffer: BABYLON.StorageBuffer | null = null;
    private C2Buffer: BABYLON.StorageBuffer | null = null;
    private gridRemainderBuffer: BABYLON.StorageBuffer | null = null;
    private sdfTexture: BABYLON.RawTexture3D | null = null;
    private buffers: BABYLON.StorageBuffer[] = [];
    private debugBuffer: BABYLON.StorageBuffer | null = null;
    
    constructor(engine: BABYLON.WebGPUEngine, simulationData: SimulationData) {
        this.engine = engine;
        this.simulationData = simulationData;
    }

    init(positions: Float32Array, sdfTexture: BABYLON.RawTexture3D) {
        this.setBuffers(positions);
        this.sdfTexture = sdfTexture;
    }

    setBuffers(positions: Float32Array) {
        this.setParticleBuffers(positions);
        this.setGridBuffer();
    }

    setParticleBuffers(positions: Float32Array) {  
        const positionBufferFlags =
        BABYLON.Constants.BUFFER_CREATIONFLAG_VERTEX |
        BABYLON.Constants.BUFFER_CREATIONFLAG_READWRITE;
        const otherBufferFlags = BABYLON.Constants.BUFFER_CREATIONFLAG_READWRITE;
        const velocityvalues = new Float32Array(positions.length).fill(0.0);
        
        this.positionBuffer = new BABYLON.StorageBuffer(this.engine, positions.byteLength, positionBufferFlags);
        this.velocityBuffer = new BABYLON.StorageBuffer(this.engine, positions.byteLength, otherBufferFlags);
        this.C0Buffer = new BABYLON.StorageBuffer(this.engine, positions.byteLength, otherBufferFlags);
        this.C1Buffer = new BABYLON.StorageBuffer(this.engine, positions.byteLength, otherBufferFlags);
        this.C2Buffer = new BABYLON.StorageBuffer(this.engine, positions.byteLength, otherBufferFlags);
        
        
        this.C0Buffer.update(velocityvalues);
        this.C1Buffer.update(velocityvalues);
        this.C2Buffer.update(velocityvalues); 
        this.positionBuffer.update(positions);
        this.velocityBuffer.update(velocityvalues);
        this.buffers.push(this.positionBuffer);
        this.buffers.push(this.velocityBuffer);
        this.buffers.push(this.C0Buffer);
        this.buffers.push(this.C1Buffer);
        this.buffers.push(this.C2Buffer);
    }

    getPositionBuffer(): BABYLON.StorageBuffer {
        if (!this.positionBuffer) {
            throw new Error("Position buffer not initialized");
        }

        return this.positionBuffer;
    }

    getVelocityBuffer(): BABYLON.StorageBuffer {
        if (!this.velocityBuffer) {
            throw new Error("Velocity buffer not initialized");
        }

        return this.velocityBuffer;
    }

    getC0Buffer(): BABYLON.StorageBuffer {
        if (!this.C0Buffer) {
            throw new Error("C0 buffer not initialized");
        }

        return this.C0Buffer;
    }

    getC1Buffer(): BABYLON.StorageBuffer {
        if (!this.C1Buffer) {
            throw new Error("C1 buffer not initialized");
        }

        return this.C1Buffer;
    }

    getC2Buffer(): BABYLON.StorageBuffer {
        if (!this.C2Buffer) {
            throw new Error("C2 buffer not initialized");
        }

        return this.C2Buffer;
    }
    
    setGridBuffer() {
        const creationFlags = BABYLON.Constants.BUFFER_CREATIONFLAG_READWRITE;
        const gridLength = this.simulationData.getGridNodeCount();
        const bytelength = gridLength * 7 * 4;
        this.gridBuffer = new BABYLON.StorageBuffer(this.engine, bytelength, creationFlags);
        this.gridRemainderBuffer = new BABYLON.StorageBuffer(this.engine, bytelength, creationFlags);
        this.buffers.push(this.gridBuffer);
        this.buffers.push(this.gridRemainderBuffer);
        this.debugBuffer = new BABYLON.StorageBuffer(this.engine, bytelength, creationFlags);
    }

    getGridBuffer() {
        if (!this.gridBuffer) {
            throw new Error("Grid buffer not initialized");
        }

        return this.gridBuffer;
    }

    getGridRemainderBuffer() {
        if (!this.gridRemainderBuffer) {
            throw new Error("Grid remainder buffer not initialized");
        }
        
        return this.gridRemainderBuffer;
    }

    getSDFTexture() { 
        if (!this.sdfTexture) {
            throw new Error("SDF texture not initialized");
        }

        return this.sdfTexture;
    }

    getDebugBuffer() {
        if (!this.debugBuffer) {
            throw new Error("Debug buffer not initialized");
        }

        return this.debugBuffer;
    }


}

export default BufferManager;
