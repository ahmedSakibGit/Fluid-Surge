import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import { getSpatialDispatchDimensionAndShader } from "../utils";


class BaseCompute {
    webGPUManager: WebGPUManager;
    simulationData: SimulationData;
    bufferManager: BufferManager;
    computeShader: BABYLON.ComputeShader | null = null;
    uniformBuffer: BABYLON.UniformBuffer;
    data = {
        binding: {},
        shader: "",
        dispatch: {
            x: 0,
            y: 0,
            z: 0
        },
        workgroupSize: {
            k: 0,
            l: 0,
            m: 0
        },
        uniforms: [] as {
            name: string;
            entries: { name: string; type: string; value: number | BABYLON.Matrix | Float32Array }[];
        }[],
        buffers: [] as {
            name: string;
            buffer: BABYLON.StorageBuffer;
        }[],

    }

    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, bufferManager: BufferManager) {
        this.webGPUManager = webGPUManager;
        this.simulationData = simulationData;
        this.bufferManager = bufferManager;
        this.uniformBuffer = new BABYLON.UniformBuffer(this.webGPUManager.getEngine());
    }

    setCompute(name: string, binding: BABYLON.ComputeBindingMapping, bytesPerThreadShared: number, computeShader: string, elementCount: number) {
        this.setData(binding, bytesPerThreadShared, computeShader, elementCount);
        this.computeShader = new BABYLON.ComputeShader(name, this.webGPUManager.getEngine(),
            {
                computeSource: this.data.shader
            },
            { bindingsMapping: this.data.binding }
        );

    }

    setData(binding: BABYLON.ComputeBindingMapping, bytesPerThreadShared: number, computeShader: string, elementCount: number) {
        this.data.binding = binding;
        const { dispatch, shader, workgroupSize } = getSpatialDispatchDimensionAndShader(this.webGPUManager.getDevice(), elementCount, bytesPerThreadShared, computeShader);
        this.data.dispatch = dispatch;
        this.data.shader = shader;
        this.data.workgroupSize = workgroupSize;
    }

    setSSBO() {
        if (!this.computeShader) return;
        for (const buffer of this.data.buffers) {
            this.computeShader.setStorageBuffer(buffer.name, buffer.buffer);
        }

        for (const uniform of this.data.uniforms) {
            for (const entry of uniform.entries) {
                switch (entry.type) {
                    case "uint":
                        this.uniformBuffer.addUniform(entry.name, 1);
                        break;
                    case "float":
                        this.uniformBuffer.addUniform(entry.name, 1.0);
                        break;
                    case "mat4":
                        this.uniformBuffer.addMatrix(entry.name, BABYLON.Matrix.Identity());
                        break;
                    case "vec4":
                        this.uniformBuffer.addUniform(entry.name, 4);
                        break;
                    default:
                        break;
                }
            }

            for (const entry of uniform.entries) {
                switch (entry.type) {
                    case "uint":
                        this.uniformBuffer.updateUInt(entry.name, entry.value as number);
                        break;
                    case "float":

                        this.uniformBuffer.updateFloat(entry.name, entry.value as number);
                        break;
                    case "mat4":
                        this.uniformBuffer.updateMatrix(entry.name, entry.value as BABYLON.Matrix);
                        break;
                    case "vec4":
                        if (Array.isArray(entry.value)) {
                            this.uniformBuffer.updateFloat4(entry.name, entry.value[0], entry.value[1], entry.value[2], entry.value[3]);
                        }
                        break;
                    default:
                        break;
                }
            }

            this.uniformBuffer.update();
            this.computeShader.setUniformBuffer(uniform.name, this.uniformBuffer);
        }

    }
    

    async update() {
        if (!this.computeShader) return;
        await this.computeShader.dispatchWhenReady(this.data.dispatch.x, this.data.dispatch.y, this.data.dispatch.z);
    }
}

export default BaseCompute;