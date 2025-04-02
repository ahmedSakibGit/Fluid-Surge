import Cube from "./Cube";
class ContainerManager {
    private scene: BABYLON.Scene;
    private container: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.container = new BABYLON.Mesh("container", scene);
    }

    setCube(size: number) {
        const cube = new Cube(this.scene, 5);
        this.container = cube.getMesh();
        this.container.isVisible = true;
    }

    getCurrentContainer(): BABYLON.Mesh {
        return this.container;
    }

    getContainerGPUBuffer(): GPUBuffer {
        const mesh = this.getCurrentContainer();
        const vertexBuffer = mesh.getVertexBuffer(BABYLON.VertexBuffer.PositionKind);
    
        if (!vertexBuffer) {
            throw new Error("No vertex buffer found on container mesh.");
        }

        const internalBuffer = (vertexBuffer as any)._buffer;
        if (!internalBuffer) {
            throw new Error("No valid internal buffer retrieved.");
        }
        
    
        return internalBuffer._buffer._buffer;
    }

    getContainerBounds(): { min: [number, number, number], max: [number, number, number] } {
        const boundingInfo = this.container.getBoundingInfo();
        const min = boundingInfo.boundingBox.minimumWorld.asArray();
        const max = boundingInfo.boundingBox.maximumWorld.asArray();
        return { min, max };
    }

}


export default ContainerManager;