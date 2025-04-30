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
        //this.container.rotation.z = 0.5;
        //this.startComputeInterval();
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

    getBounds(): { boundsMin: BABYLON.Vector3, boundsMax: BABYLON.Vector3 } {
        const bounds = this.getContainerBounds();
        const boundsMin = BABYLON.Vector3.FromArray(bounds.min);
        const boundsMax = BABYLON.Vector3.FromArray(bounds.max);
        return { boundsMin, boundsMax };
    }

    async getSDFTexture(voxelResolution: number): Promise<BABYLON.RawTexture3D> {
        // const bounds = this.getContainerBounds();
        // const min = BABYLON.Vector3.FromArray(bounds.min);
        // const max = BABYLON.Vector3.FromArray(bounds.max);
        // const size = max.subtract(min);

        // const sdf = new Float32Array(voxelResolution * voxelResolution * voxelResolution);

        // const containerGeometry = this.container;
        // const positions = containerGeometry.getVerticesData(BABYLON.VertexBuffer.PositionKind) || [];
        // const indices = containerGeometry.getIndices() || [];

        // const worldMatrix = containerGeometry.computeWorldMatrix(true);
        // const transformedPositions: BABYLON.Vector3[] = [];

        // for (let i = 0; i < positions.length; i += 3) {
        //     const local = new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        //     const world = BABYLON.Vector3.TransformCoordinates(local, worldMatrix);
        //     transformedPositions.push(world);
        // }

        // function getIndex(x: number, y: number, z: number): number {
        //     return z * voxelResolution * voxelResolution + y * voxelResolution + x;
        // }

        // function closestPointOnSegment(p: BABYLON.Vector3, a: BABYLON.Vector3, b: BABYLON.Vector3): BABYLON.Vector3 {
        //     const ab = b.subtract(a);
        //     const t = BABYLON.Scalar.Clamp(BABYLON.Vector3.Dot(p.subtract(a), ab) / ab.lengthSquared(), 0, 1);
        //     return a.add(ab.scale(t));
        // }

        // function closestPointOnTriangle(p: BABYLON.Vector3, a: BABYLON.Vector3, b: BABYLON.Vector3, c: BABYLON.Vector3): BABYLON.Vector3 {
        //     const projected = BABYLON.Vector3.Zero();
        //     BABYLON.Vector3.ProjectOnTriangleToRef(p, a, b, c, projected);

        //     // Check if projection is inside triangle
        //     const ap = p.subtract(a);
        //     const ab = b.subtract(a);
        //     const ac = c.subtract(a);
        //     const d1 = BABYLON.Vector3.Dot(ab, ap);
        //     const d2 = BABYLON.Vector3.Dot(ac, ap);
        //     const inside = d1 >= 0 && d2 >= 0 && d1 + d2 <= BABYLON.Vector3.Dot(ab, ab) + BABYLON.Vector3.Dot(ac, ac);

        //     if (inside) {
        //         return projected;
        //     }

        //     // Check closest points on edges
        //     const cpAB = closestPointOnSegment(p, a, b);
        //     const cpBC = closestPointOnSegment(p, b, c);
        //     const cpCA = closestPointOnSegment(p, c, a);

        //     const cpList = [cpAB, cpBC, cpCA, a, b, c];
        //     let minDist = Infinity;
        //     let closest = cpAB;

        //     for (const pt of cpList) {
        //         const dist = BABYLON.Vector3.Distance(p, pt);
        //         if (dist < minDist) {
        //             minDist = dist;
        //             closest = pt;
        //         }
        //     }

        //     return closest;
        // }

        // for (let x = 0; x < voxelResolution; x++) {
        //     for (let y = 0; y < voxelResolution; y++) {
        //         for (let z = 0; z < voxelResolution; z++) {
        //             const voxelPos = new BABYLON.Vector3(
        //                 min.x + (x + 0.5) * size.x / voxelResolution,
        //                 min.y + (y + 0.5) * size.y / voxelResolution,
        //                 min.z + (z + 0.5) * size.z / voxelResolution
        //             );

        //             let minDist = Infinity;
        //             for (let i = 0; i < indices.length; i += 3) {
        //                 const a = transformedPositions[indices[i]];
        //                 const b = transformedPositions[indices[i + 1]];
        //                 const c = transformedPositions[indices[i + 2]];
        //                 const closestPoint = closestPointOnTriangle(voxelPos, a, b, c);
        //                 const dist = BABYLON.Vector3.Distance(closestPoint, voxelPos);
        //                 if (dist < minDist) {
        //                     minDist = dist;
        //                 }
        //             }

        //             // Mark all voxels inside the bounding box of the mesh as negative distance
        //             const voxelIndex = getIndex(x, y, z);
        //             if (this.container.intersectsPoint(voxelPos)) {
        //                 sdf[voxelIndex] = -minDist;
        //             } else {
        //                 console.log(minDist);
        //                 sdf[voxelIndex] = minDist;
        //             }
        //         }
        //     }
        // }

       // const data = sdf;
        const texture = new BABYLON.RawTexture3D(
            new Float32Array(voxelResolution * voxelResolution * voxelResolution),
            voxelResolution,
            voxelResolution,
            voxelResolution,
            BABYLON.Engine.TEXTUREFORMAT_R,
            this.scene,
            false, // no mipmaps
            false, // invertY
            BABYLON.Texture.NEAREST_SAMPLINGMODE,
            BABYLON.Engine.TEXTURETYPE_FLOAT,
            BABYLON.Constants.TEXTURE_CREATIONFLAG_STORAGE // ✅ Storage flag
          );
        return texture;
    }

    getContainerMatrices(): {worldInvert: BABYLON.Matrix, world: BABYLON.Matrix} {
        this.container.computeWorldMatrix(true);
        return {
            worldInvert: this.container.getWorldMatrix().invert(),
            world: this.container.getWorldMatrix()
        };
    }

    getVolume(filled: number): number {
        const bounds = this.getContainerBounds();
        const min = BABYLON.Vector3.FromArray(bounds.min);
        const max = BABYLON.Vector3.FromArray(bounds.max);
        const size = max.subtract(min);
        return size.x * size.y * size.z * filled;
    }
    
    getContainerSize(): number {
        const bounds = this.getContainerBounds();
        const min = BABYLON.Vector3.FromArray(bounds.min);
        const max = BABYLON.Vector3.FromArray(bounds.max);
        const size = max.subtract(min);
        return size.x;
    }
    

    private startComputeInterval() {
        setInterval(() => {
            this.container.rotation.x += 0.1;
        }, 100);
    }
}

export default ContainerManager;