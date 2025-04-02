import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import G2PShader from "../Shaders/g2p.wgsl?raw";

class G2PCompute extends BaseCompute  {
    binding: BABYLON.ComputeBindingMapping = {
        positions: { group: 0, binding: 0 },
        grid: { group: 0, binding: 1 },
        velocity: { group: 0, binding: 2 },
        c0Buffer: { group: 0, binding: 3 },
        c1Buffer: { group: 0, binding: 4 },
        c2Buffer: { group: 0, binding: 5 },
        shaderData: { group: 0, binding: 6 },
    }

    bytesPerThreadShared: number = 64;

    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        super(webGPUManager, simulationData, bufferManager);
    }

    init() {
        this.setCompute("G2PCompute", this.binding, this.bytesPerThreadShared, G2PShader, this.simulationData.getFluidCount());
        this.prepSSBO();
        this.setSSBO();
    }

    prepSSBO() {
        const gridNodeCount = this.simulationData.getGridNodeCount();
        const gridDim = Math.ceil(Math.cbrt(gridNodeCount));
        this.data.uniforms = [
            {
                name: "shaderData",
                entries: [
                    { name: "dispatchX", type: "uint", value: this.data.dispatch.x * this.data.workgroupSize.k },
                    { name: "dispatchY", type: "uint", value: this.data.dispatch.y * this.data.workgroupSize.l },
                    { name: "fluidCount", type: "uint", value: this.simulationData.getFluidCount() },
                    { name: "gridDim", type: "uint", value: gridDim},
                ]
            }
        ]

        this.data.buffers = [
            {
                name: "positions",
                buffer: this.bufferManager.getPositionBuffer()
            },
            {
                name: "grid",
                buffer: this.bufferManager.getGridBuffer()
            },
            {
                name: "velocity",
                buffer: this.bufferManager.getVelocityBuffer()
            },
            {
                name: "c0Buffer",
                buffer: this.bufferManager.getC0Buffer()
            },
            {
                name: "c1Buffer",
                buffer: this.bufferManager.getC1Buffer()
            },
            {
                name: "c2Buffer",
                buffer: this.bufferManager.getC2Buffer()
            }
        ];


    }
    
}

export default G2PCompute;