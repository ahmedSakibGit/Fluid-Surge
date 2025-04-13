import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import GridSolveShader from "../Shaders/gridSolve.wgsl?raw";
import ContainerManager from "../../../../3D/Container/ContainerManager";

class GridSolveCompute extends BaseCompute  {
    binding: BABYLON.ComputeBindingMapping = {
        grid: { group: 0, binding: 0 },
        gridRem: { group: 0, binding: 1 },
        shaderData: { group: 0, binding: 2 },
    }

    bytesPerThreadShared: number = 0;
    containerManager: ContainerManager | null = null;


    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        super(webGPUManager, simulationData, bufferManager);
    }

    init(containerManager: ContainerManager) {
        this.containerManager = containerManager;
        this.setCompute("GridSolveCompute", this.binding, this.bytesPerThreadShared, GridSolveShader, this.simulationData.getGridNodeCount());
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
                    { name: "NodeCount", type: "uint", value: this.simulationData.getGridNodeCount() },
                    { name: "worldInvertMatrix", type: "mat4", value: BABYLON.Matrix.Identity() }
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

    updateUniforms() {
        if (!this.containerManager) return;
        const {world, worldInvert} = this.containerManager.getContainerMatrices();
        this.uniformBuffer.updateMatrix("worldInvertMatrix", worldInvert);
        this.uniformBuffer.update();
    }
    
}

export default GridSolveCompute;