import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import BaseCompute from "./BaseCompute";
import G2PShader from "../Shaders/g2p.wgsl?raw";
import ContainerManager from "../../../../3D/Container/ContainerManager";


class G2PCompute extends BaseCompute {
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
    containerManager: ContainerManager | null = null;


    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        super(webGPUManager, simulationData, bufferManager);
    }

    init(containerManager: ContainerManager) {
        this.containerManager = containerManager;
        this.setCompute("G2PCompute", this.binding, this.bytesPerThreadShared, G2PShader, this.simulationData.getFluidCount());
        this.prepSSBO();
        this.setSSBO();
    }

    prepSSBO() {
        if (!this.computeShader || !this.containerManager) return;
        const gridNodeCount = this.simulationData.getGridNodeCount();
        const gridDim = Math.ceil(Math.cbrt(gridNodeCount));
        const { boundsMin, boundsMax } = this.containerManager.getBounds();
        const { world, worldInvert } = this.containerManager.getContainerMatrices();
        console.log(boundsMin, boundsMax);
        this.data.uniforms = [
            {
                name: "shaderData",
                entries: [
                    { name: "dispatchX", type: "uint", value: this.data.dispatch.x * this.data.workgroupSize.k },
                    { name: "dispatchY", type: "uint", value: this.data.dispatch.y * this.data.workgroupSize.l },
                    { name: "fluidCount", type: "uint", value: this.simulationData.getFluidCount() },
                    { name: "gridDim", type: "uint", value: gridDim },
                    { name: "boundsMinX", type: "float", value: boundsMin.x },
                    { name: "boundsMinY", type: "float", value: boundsMin.y },
                    { name: "boundsMinZ", type: "float", value: boundsMin.z },
                    { name: "boundsMaxX", type: "float", value: boundsMax.x },
                    { name: "boundsMaxY", type: "float", value: boundsMax.y },
                    { name: "boundsMaxZ", type: "float", value: boundsMax.z },
                    { name: "worldMatrix", type: "mat4", value: world },
                    { name: "worldInvertMatrix", type: "mat4", value: worldInvert }
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
        this.uniformBuffer.updateMatrix("worldMatrix", world);
        this.uniformBuffer.updateMatrix("worldInvertMatrix", worldInvert);
        this.uniformBuffer.update();
    }

}

export default G2PCompute;