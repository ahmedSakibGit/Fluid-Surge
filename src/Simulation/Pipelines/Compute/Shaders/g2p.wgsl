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
    worldInvertMatrix: mat4x4f,
    dt: f32,
    gridSpacing: f32
};

struct Node {
    vx: u32,
    vxNeg: u32,
    vy: u32,
    vyNeg: u32,
    vz: u32,
    vzNeg: u32,
    mass: u32
};

struct NodeFloat {
    vx: f32,
    vy: f32,
    vz: f32,
    mass: f32
};


const DEGREE_TO_SAVE = 23; 

fn inverse3x3(m: mat3x3f) -> mat3x3f {
    let a = m[0].x; let b = m[0].y; let c = m[0].z;
    let d = m[1].x; let e = m[1].y; let f = m[1].z;
    let g = m[2].x; let h = m[2].y; let i = m[2].z;

    let A =  e * i - f * h;
    let B = -(d * i - f * g);
    let C =  d * h - e * g;
    let D = -(b * i - c * h);
    let E =  a * i - c * g;
    let F = -(a * h - b * g);
    let G =  b * f - c * e;
    let H = -(a * f - c * d);
    let I =  a * e - b * d;

    let det = a * A + b * B + c * C;
    if (abs(det) < 1e-8) {
        return mat3x3f(vec3f(0.0), vec3f(0.0), vec3f(0.0));
    }

    let invDet = 1.0 / det;
    return mat3x3f(
        vec3f(A, D, G),
        vec3f(B, E, H),
        vec3f(C, F, I)
    ) * invDet;
}

fn tou64(value: f32) -> vec2u {
    let positiveValue = abs(value);
    let low = u32((positiveValue * pow(2., DEGREE_TO_SAVE)) % pow(2., 32));
    let high = u32(positiveValue /  pow(2., 32 - DEGREE_TO_SAVE));
    return vec2u(high, low);
}

fn tof32(high: u32, low: u32) -> f32 {
    return f32(high) * pow(2., 32 - DEGREE_TO_SAVE) + f32(low) / pow(2., DEGREE_TO_SAVE);

}

@group(0) @binding(0) var<storage, read_write> positions: array<f32>;
@group(0) @binding(1) var<storage, read_write> velocity: array<f32>;
@group(0) @binding(2) var<storage, read_write> C0Buffer: array<f32>;
@group(0) @binding(3) var<storage, read_write> C1Buffer: array<f32>;
@group(0) @binding(4) var<storage, read_write> C2Buffer: array<f32>;
@group(0) @binding(5) var<storage, read> grid: array<Node>;
@group(0) @binding(6) var<storage, read> gridRem: array<Node>;
@group(0) @binding(7) var<uniform> shaderData: ShaderData;
@group(0) @binding(8) var<storage, read_write> debug: array<NodeFloat>;


@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.fluidCount) {
        return;
    }

    var deltaT = shaderData.dt;
    let baseIndex = id * 3u;
    let particlePosX = baseIndex;

    let particlePosY = baseIndex + 1u;
    let particlePosZ = baseIndex + 2u;

    let pos = vec3f(positions[particlePosX], positions[particlePosY], positions[particlePosZ]);
    let boundsMin = vec3f(shaderData.boundsMinX, shaderData.boundsMinY, shaderData.boundsMinZ);
    let gridPos = (pos - boundsMin) / shaderData.gridSpacing;
    let cell_idx = floor(gridPos);
    let cell_diff = gridPos - (cell_idx + vec3f(0.5));

    var weights: array<vec3f, 3>;
    weights[0] = 0.5 * (0.5 - cell_diff) * (0.5 - cell_diff);
    weights[1] = 0.75 - cell_diff * cell_diff;
    weights[2] = 0.5 * (0.5 + cell_diff) * (0.5 + cell_diff);

    var v = vec3f(0.0);
    var B = mat3x3f(vec3f(0.0), vec3f(0.0), vec3f(0.0));

    for (var gx = 0u; gx < 3u; gx++) {
        for (var gy = 0u; gy < 3u; gy++) {
            for (var gz = 0u; gz < 3u; gz++) {
                let ix = cell_idx.x + f32(gx) - 1.0;
                let iy = cell_idx.y + f32(gy) - 1.0;
                let iz = cell_idx.z + f32(gz) - 1.0;
                let cell_x = vec3f(ix, iy, iz);

                if (cell_x.x < 0.0 || cell_x.y < 0.0 || cell_x.z < 0.0 ||
                    cell_x.x >= f32(shaderData.gridDim) ||
                    cell_x.y >= f32(shaderData.gridDim) ||
                    cell_x.z >= f32(shaderData.gridDim)) {
                    continue;
                }

                let weight = weights[gx].x * weights[gy].y * weights[gz].z;
                let cell_dist = vec3f((cell_x + 0.5f) - pos);
                let gridIndex: u32 = u32(ix * f32(shaderData.gridDim) * f32(shaderData.gridDim) +
                                iy * f32(shaderData.gridDim) +
                                iz);

                let vx = tof32(grid[gridIndex].vx, gridRem[gridIndex].vx) - tof32(grid[gridIndex].vxNeg, gridRem[gridIndex].vxNeg);
                let vy = tof32(grid[gridIndex].vy, gridRem[gridIndex].vy) - tof32(grid[gridIndex].vyNeg, gridRem[gridIndex].vyNeg);
                let vz = tof32(grid[gridIndex].vz, gridRem[gridIndex].vz) - tof32(grid[gridIndex].vzNeg, gridRem[gridIndex].vzNeg);

                debug[gridIndex].vx = vx;
                debug[gridIndex].vy = vy;
                debug[gridIndex].vz = vz;
                let weighted_velocity = vec3f(vx, vy, vz);
                B += mat3x3f(
                    weighted_velocity * cell_dist.x,
                    weighted_velocity * cell_dist.y,
                    weighted_velocity * cell_dist.z
                );

                velocity[particlePosX] += vx;
                velocity[particlePosY] += vy;
                velocity[particlePosZ] += vz;
            }
        }
    }

    B = B * 4.0;

    C0Buffer[particlePosX] = B[0].x;
    C0Buffer[particlePosY] = B[0].y;
    C0Buffer[particlePosZ] = B[0].z;

    C1Buffer[particlePosX] = B[1].x;
    C1Buffer[particlePosY] = B[1].y;
    C1Buffer[particlePosZ] = B[1].z;

    C2Buffer[particlePosX] = B[2].x;
    C2Buffer[particlePosY] = B[2].y;
    C2Buffer[particlePosZ] = B[2].z;


    positions[particlePosX] += velocity[particlePosX] * shaderData.dt;
    positions[particlePosY] += velocity[particlePosY] * shaderData.dt;
    positions[particlePosZ] += velocity[particlePosZ] * shaderData.dt;

    velocity[particlePosX] = v.x;
    velocity[particlePosY] = v.y;
    velocity[particlePosZ] = v.z;

}