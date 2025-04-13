import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import GridClearShader from "../Shaders/gridClear.wgsl?raw";

class GridClear extends BaseCompute  {
    binding: BABYLON.ComputeBindingMapping = {
        grid: { group: 0, binding: 0 },
        gridRem: { group: 0, binding: 1 },
        shaderData: { group: 0, binding: 2 }
    }

    bytesPerThreadShared: number = 0;

    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        super(webGPUManager, simulationData, bufferManager);
    }

    init() {
        this.setCompute("GridSolveCompute",this.binding, this.bytesPerThreadShared, GridClearShader, this.simulationData.getGridNodeCount());
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
                    { name: "nodeCount", type: "uint", value: this.simulationData.getGridNodeCount()},
                    { name: "_padding", type: "uint", value: 1 }
                ]
            }
        ]
        this.data.buffers = [
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

export default GridClear;