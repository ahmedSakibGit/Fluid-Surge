import WebGPUManager from "../../../../WebGPU/WebGPUManger";
import SimulationData from "../../../Data/SimulationData";
import BufferManager from "../../Buffer/BufferManager";
import { getSpatialDispatchDimensionAndShader } from "../utils";


class BaseCompute {
    webGPUManager: WebGPUManager;
    simulationData: SimulationData;
    bufferManager: BufferManager;
    computeShader: BABYLON.ComputeShader | null = null;
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
            entries: { name: string; type: string; value: number }[];
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
            const shaderUniform = new BABYLON.UniformBuffer(this.webGPUManager.getEngine());
            for (const entry of uniform.entries) {
                switch (entry.type) {
                    case "uint":
                        shaderUniform.addUniform(entry.name, 1);
                        break;
                    case "float":
                        shaderUniform.addUniform(entry.name, 1.0);
                        break;
                    default:
                        break;
                }
            }

            for (const entry of uniform.entries) {
                switch (entry.type) {
                    case "uint":
                        shaderUniform.updateUInt(entry.name, entry.value);
                        break;
                    case "float":
                        shaderUniform.updateFloat(entry.name, entry.value);
                        break;
                    default:
                        break;
                }
            }

            shaderUniform.update();
            this.computeShader.setUniformBuffer(uniform.name, shaderUniform);
        }

    }

    update() {
        if (!this.computeShader) return;
        this.computeShader.dispatch(this.data.dispatch.x, this.data.dispatch.y, this.data.dispatch.z);
    }
}

export default BaseCompute;