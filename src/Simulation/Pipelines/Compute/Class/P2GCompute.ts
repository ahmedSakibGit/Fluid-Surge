import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import p2GShader from "../Shaders/p2g.wgsl?raw";

class P2GCompute extends BaseCompute {
    binding: BABYLON.ComputeBindingMapping = {
        positions: { group: 0, binding: 0 },
        shaderData: { group: 0, binding: 1 },
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
        this.data.uniforms = [
            {
                name: "shaderData",
                entries: [
                    { name: "dispatchX", type: "uint", value: this.data.dispatch.x * this.data.workgroupSize.k },
                    { name: "dispatchY", type: "uint", value: this.data.dispatch.y * this.data.workgroupSize.l },
                    { name: "fluidCount", type: "uint", value: this.simulationData.getFluidCount() },
                    { name: "_padding", type: "uint", value: 1 }
                ]
            }
        ]

        this.data.buffers = [
            {
                name: "positions",
                buffer: this.bufferManager.getPositionBuffer()
            }
        ];

    }
}

export default P2GCompute;
