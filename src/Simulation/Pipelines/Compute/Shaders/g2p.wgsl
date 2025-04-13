struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    fluidCount: u32,
    gridDim: u32,
    boundsMinX: f32,
    boundsMinY: f32,
    boundsMinZ: f32,
    boundsMaxX: f32,
    boundsMaxY: f32,
    boundsMaxZ: f32,
    worldMatrix: mat4x4f,
    worldInvertMatrix: mat4x4f
};

struct Node {
    vx: i32,
    vy: i32,
    vz: i32,
    mass: i32
};


const FIXED_POINT_MULTIPLIER: f32 = 1e8;
const deltaT: f32 = 0.01;

fn decodeFixedPointPair(intPart: i32, remPart: i32) -> f32 {
    return f32(intPart) + (f32(remPart) / FIXED_POINT_MULTIPLIER);
}

@group(0) @binding(0) var<storage, read_write> positions: array<f32>;
@group(0) @binding(1) var<storage, read_write> velocity: array<f32>;
@group(0) @binding(2) var<storage, read_write> C0Buffer: array<f32>;
@group(0) @binding(3) var<storage, read_write> C1Buffer: array<f32>;
@group(0) @binding(4) var<storage, read_write> C2Buffer: array<f32>;
@group(0) @binding(5) var<storage, read> grid: array<Node>;
@group(0) @binding(6) var<storage, read> gridRem: array<Node>;
@group(0) @binding(7) var<uniform> shaderData: ShaderData;


@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.fluidCount) {
        return;
    }

    let baseIndex = id * 3u;
    let particlePosX = baseIndex;

    let particlePosY = baseIndex + 1u;
    let particlePosZ = baseIndex + 2u;

    let pos = vec3f(positions[particlePosX], positions[particlePosY], positions[particlePosZ]);
    let cell_idx = floor(pos);
    let cell_diff = pos - (cell_idx + vec3f(0.5));

    var weights: array<vec3f, 3>;
    weights[0] = 0.5 * (0.5 - cell_diff) * (0.5 - cell_diff);
    weights[1] = 0.75 - cell_diff * cell_diff;
    weights[2] = 0.5 * (0.5 + cell_diff) * (0.5 + cell_diff);

    var v = vec3f(0.0);
    var B = mat3x3f(vec3f(0.0), vec3f(0.0), vec3f(0.0)) * 4.0;

    for (var gx = 0u; gx < 3u; gx++) {
        for (var gy = 0u; gy < 3u; gy++) {
            for (var gz = 0u; gz < 3u; gz++) {
                let ix = u32(cell_idx.x) + gx - 1u;
                let iy = u32(cell_idx.y) + gy - 1u;
                let iz = u32(cell_idx.z) + gz - 1u;

                if (ix >= shaderData.gridDim || iy >= shaderData.gridDim || iz >= shaderData.gridDim) {
                    continue;
                }

                let weight = weights[gx].x * weights[gy].y * weights[gz].z;
                let gridIndex = ix * shaderData.gridDim * shaderData.gridDim +
                                iy * shaderData.gridDim +
                                iz;

                let node = grid[gridIndex];
                let nodeRem = gridRem[gridIndex];

                let weightedV = vec3f(
                    decodeFixedPointPair(node.vx, nodeRem.vx),
                    decodeFixedPointPair(node.vy, nodeRem.vy),
                    decodeFixedPointPair(node.vz, nodeRem.vz)
                ) * weight;
                let cellDist = (vec3f(f32(ix), f32(iy), f32(iz)) + 0.5) - pos;

                v += weightedV;
                B += mat3x3f(
                    weightedV * cellDist.x,
                    weightedV * cellDist.y,
                    weightedV * cellDist.z
                );
            }
        }
    }

    var newPosWorld = pos + v * deltaT;
    let posLocal = (shaderData.worldInvertMatrix * vec4f(pos, 1.0)).xyz;
    var newPos = (shaderData.worldInvertMatrix * vec4f(newPosWorld, 1.0)).xyz;
    let boxMin = (shaderData.worldInvertMatrix * vec4f(shaderData.boundsMinX , shaderData.boundsMinY, shaderData.boundsMinZ, 1.0)).xyz;
    let boxMax = (shaderData.worldInvertMatrix * vec4f(shaderData.boundsMaxX, shaderData.boundsMaxY, shaderData.boundsMaxZ, 1.0)).xyz;

    var hit = false;
    var normal = vec3f(0.0);
    var hitPoint = newPos;
    let restitution: f32 = 0.5;
    let friction: f32 = 0.3;

    if (newPos.x < boxMin.x) {
        normal = vec3f(1.0, 0.0, 0.0);
        hitPoint.x = boxMin.x;
        hit = true;
    } else if (newPos.x > boxMax.x) {
        normal = vec3f(-1.0, 0.0, 0.0);
        hitPoint.x = boxMax.x;
        hit = true;
    } else if (newPos.y < boxMin.y) {
        normal = vec3f(0.0, 1.0, 0.0);
        hitPoint.y = boxMin.y;
        hit = true;
    } else if (newPos.y > boxMax.y) {
        normal = vec3f(0.0, -1.0, 0.0);
        hitPoint.y = boxMax.y;
        hit = true;
    } else if (newPos.z < boxMin.z) {
        normal = vec3f(0.0, 0.0, 1.0);
        hitPoint.z = boxMin.z;
        hit = true;
    } else if (newPos.z > boxMax.z) {
        normal = vec3f(0.0, 0.0, -1.0);
        hitPoint.z = boxMax.z;
        hit = true;
    }

    if (hit) {
        let v_normal = dot(v, normal) * normal;
        let v_tangent = v - v_normal;
        v = -restitution * v_normal + (1.0 - friction) * v_tangent;

        let penetration = dot(newPos - hitPoint, normal);
        newPos = newPos - (1.0 + restitution) * penetration * normal;
    }

    newPosWorld = (shaderData.worldMatrix *  vec4f(newPos, 1.0)).xyz;

    positions[particlePosX] = newPosWorld.x;
    positions[particlePosY] = newPosWorld.y;
    positions[particlePosZ] = newPosWorld.z;

    velocity[particlePosX] = v.x;
    velocity[particlePosY] = v.y;
    velocity[particlePosZ] = v.z;

    C0Buffer[particlePosX] = B[0].x;
    C0Buffer[particlePosY] = B[0].y;
    C0Buffer[particlePosZ] = B[0].z;

    C1Buffer[particlePosX] = B[1].x;
    C1Buffer[particlePosY] = B[1].y;
    C1Buffer[particlePosZ] = B[1].z;

    C2Buffer[particlePosX] = B[2].x;
    C2Buffer[particlePosY] = B[2].y;
    C2Buffer[particlePosZ] = B[2].z;
}