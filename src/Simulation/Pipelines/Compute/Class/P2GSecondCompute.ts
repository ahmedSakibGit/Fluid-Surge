import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import p2GShader from "../Shaders/p2g2.wgsl?raw";

class P2GSecondCompute extends BaseCompute {
    binding: BABYLON.ComputeBindingMapping = {
        positions: { group: 0, binding: 0 },
        velocity: { group: 0, binding: 1 },
        c0Buffer: { group: 0, binding: 2 },
        c1Buffer: { group: 0, binding: 3 },
        c2Buffer: { group: 0, binding: 4 },
        grid: { group: 0, binding: 5 },
        gridRem: { group: 0, binding: 6 },
        shaderData: { group: 0, binding: 7 },
    }

    bytesPerThreadShared: number = 0;

    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        super(webGPUManager, simulationData, bufferManager);
    }

    init() {
        this.setCompute("P2GCompute", this.binding, this.bytesPerThreadShared, p2GShader, this.simulationData.getFluidCount());
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
                    { name: "gridDim", type: "uint", value: gridDim }
                ]
            }
        ]

        this.data.buffers = [
            {
                name: "positions",
                buffer: this.bufferManager.getPositionBuffer()
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
            },
            {
                name: "grid",
                buffer: this.bufferManager.getGridBuffer()
            },
            {
                name: "gridRem",
                buffer: this.bufferManager.getGridRemainderBuffer()
            }
        ];

    }
}

export default P2GSecondCompute;
