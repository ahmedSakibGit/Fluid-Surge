import vertexShader from "./Shader/vertex.ts";
import fragmentShader from "./Shader/fragment.ts";
import WebGPUManager from "../../../WebGPU/WebGPUManger";
import SimulationData from "../../Data/SimulationData";
import BufferManager from "../Buffer/BufferManager";

class Render {
    private webGPUManager: WebGPUManager;
    private simulationData: SimulationData;
    private scene: BABYLON.Scene;
    private mesh: BABYLON.Mesh | null = null;
    private bufferManager: BufferManager;

    constructor(webGPUManager: WebGPUManager, simulationData: SimulationData, scene: BABYLON.Scene, bufferManager: BufferManager) {
        this.simulationData = simulationData;
        this.scene = scene
        this.webGPUManager = webGPUManager;
        this.bufferManager = bufferManager;
    }

    async render() {

    }

    init() {
        this.createMesh();
    }

    createMesh() {
        BABYLON.ShaderStore.ShadersStoreWGSL[vertexShader.name] = vertexShader.code;
        BABYLON.ShaderStore.ShadersStoreWGSL[fragmentShader.name] = fragmentShader.code;
        var shaderMaterial = new BABYLON.ShaderMaterial("shader", this.scene, {
            vertex: vertexShader.name.replace("VertexShader", ""),
            fragment: fragmentShader.name.replace("FragmentShader", ""),
        },
            {
                attributes: ["position", "positionIndex", "offsetIndex"],
                uniformBuffers: ["Scene", "Mesh"],
                shaderLanguage: BABYLON.ShaderLanguage.WGSL,
            }
        );

        shaderMaterial.setStorageBuffer("positions", this.bufferManager.getPositionBuffer());
        const numParticles = this.simulationData.getFluidCount();
        const positions: number[] = new Array(numParticles * 6 * 3).fill(0);


        const totalVertices = numParticles * 6;

        const indices = Array.from({ length: totalVertices }, (_, i) => i);
        const positionIndex = Array.from({ length: totalVertices }, (_, i) => Math.floor(i / 6));
        const offsetIndex = Array.from({ length: totalVertices }, (_, i) => i % 6);

        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        const customMesh = new BABYLON.Mesh("customMesh", this.scene);
        vertexData.applyToMesh(customMesh);
        shaderMaterial.backFaceCulling = false;
        shaderMaterial.forceDepthWrite = false;
        shaderMaterial.separateCullingPass = false;
        shaderMaterial.disableDepthWrite = true;

        customMesh.material = shaderMaterial;
        customMesh.position.y = 0;

        const positionIndexBuffer = new BABYLON.VertexBuffer(this.scene.getEngine(), positionIndex, "positionIndex", false, false, 1);
        customMesh.setVerticesBuffer(positionIndexBuffer);

        const offsetIndexBuffer = new BABYLON.VertexBuffer(this.scene.getEngine(), offsetIndex, "offsetIndex", false, false, 1);
        customMesh.setVerticesBuffer(offsetIndexBuffer);
    }
}

export default Render;
