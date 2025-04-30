struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    fluidCount: u32,
    gridDim: u32,
    stiffness: f32,
    viscosity: f32,
    dt: f32,
    restDensity: f32,
    particleVolume: f32,
    gridSpacing: f32,
    boundsMinX: f32,
    boundsMinY: f32,
    boundsMinZ: f32
};

struct Node {
    vx: atomic<u32>,
    vxNeg: atomic<u32>,
    vy: atomic<u32>,
    vyNeg: atomic<u32>,
    vz: atomic<u32>,
    vzNeg: atomic<u32>,
    mass: atomic<u32>
};

const DEGREE_TO_SAVE = 23; 
fn tou64(value: f32) -> vec2u {
    let positiveValue = abs(value);
    let low = u32((positiveValue * pow(2., DEGREE_TO_SAVE)) % pow(2., 32));
    let high = u32(positiveValue /  pow(2., 32 - DEGREE_TO_SAVE));
    return vec2u(high, low);
}

fn tof32(high: u32, low: u32) -> f32 {
    return f32(high) * pow(2., 32 - DEGREE_TO_SAVE) + f32(low) / pow(2., DEGREE_TO_SAVE);

}


@group(0) @binding(0) var<storage, read> positions : array<f32>;
@group(0) @binding(1) var<storage, read> velocity: array<f32>;
@group(0) @binding(2) var<storage, read> c0Buffer: array<f32>;
@group(0) @binding(3) var<storage, read> c1Buffer: array<f32>;
@group(0) @binding(4) var<storage, read> c2Buffer: array<f32>;
@group(0) @binding(5) var<storage, read_write> grid: array<Node>;
@group(0) @binding(6) var<storage, read_write> gridRem: array<Node>;
@group(0) @binding(7) var<uniform> shaderData: ShaderData;
@group(0) @binding(8) var<storage, read_write> debug: array<f32>;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;
    if (id >= shaderData.fluidCount) {
        return;
    }
    var v = velocity[0];
    var STIFFNESS: f32 = shaderData.stiffness;
    var REST_DENSITY: f32 = shaderData.restDensity;
    var DYNAMIC_VISCOSITY: f32 = shaderData.viscosity;
    var DT: f32 = shaderData.dt;

    var weights: array<vec3f, 3>;

    let px = positions[id * 3 + 0];
    let py = positions[id * 3 + 1];
    let pz = positions[id * 3 + 2];
    let particlePos = vec3f(px, py, pz);
    let boundsMin = vec3f(shaderData.boundsMinX, shaderData.boundsMinY, shaderData.boundsMinZ);
    let gridPos = (particlePos - boundsMin) / shaderData.gridSpacing;
    let cell_idx = floor(gridPos);
    let cell_diff = gridPos - (cell_idx + vec3f(0.5));
    weights[0] = 0.5 * (0.5 - cell_diff) * (0.5 - cell_diff);
    weights[1] = 0.75 - cell_diff * cell_diff;
    weights[2] = 0.5 * (0.5 + cell_diff) * (0.5 + cell_diff);

    let c0 = vec3f(c0Buffer[id * 4 + 0], c0Buffer[id * 4 + 1], c0Buffer[id * 4 + 2]);
    let c1 = vec3f(c1Buffer[id * 4 + 0], c1Buffer[id * 4 + 1], c1Buffer[id * 4 + 2]);
    let c2 = vec3f(c2Buffer[id * 4 + 0], c2Buffer[id * 4 + 1], c2Buffer[id * 4 + 2]);
    let C = mat3x3f(c0, c1, c2);

    var density = 0.0;
    for (var gx: u32 = 0u; gx < 3u; gx++) {
        for (var gy: u32 = 0u; gy < 3u; gy++) {
            for (var gz: u32 = 0u; gz < 3u; gz++) {
                let weight = weights[gx].x * weights[gy].y * weights[gz].z;
                let cell_x = vec3f(
                    cell_idx.x + f32(gx) - 1.,
                    cell_idx.y + f32(gy) - 1.,
                    cell_idx.z + f32(gz) - 1.
                );

                if (cell_x.x < 0.0 || cell_x.y < 0.0 || cell_x.z < 0.0 ||
                    cell_x.x >= f32(shaderData.gridDim) ||
                    cell_x.y >= f32(shaderData.gridDim) ||
                    cell_x.z >= f32(shaderData.gridDim)) {
                    continue;
                }


                let ix = u32(cell_x.x);
                let iy = u32(cell_x.y);
                let iz = u32(cell_x.z);

                let cell_index = ix * shaderData.gridDim * shaderData.gridDim + iy * shaderData.gridDim + iz;
                let decodedMass = tof32(atomicLoad(&grid[cell_index].mass), atomicLoad(&gridRem[cell_index].mass));
                density += decodedMass * weight;
                
            }
        }
    }

    let volume = 1.0 / density;
    let pressure = max(- 0.0, STIFFNESS * (pow(density / REST_DENSITY, 5.0) - 1.0));
    var stress = mat3x3f(-pressure, 0, 0, 0, -pressure, 0, 0, 0, -pressure);
    let dudv = C;
    let strain = dudv + transpose(dudv);
    stress += DYNAMIC_VISCOSITY * strain;

    let eq_16_term0 = - volume * 4 * stress * DT;

    for (var gx: u32 = 0u; gx < 3u; gx++) {
        for (var gy: u32 = 0u; gy < 3u; gy++) {
            for (var gz: u32 = 0u; gz < 3u; gz++) {
                let weight = weights[gx].x * weights[gy].y * weights[gz].z;
                let cell_x = vec3f(
                    cell_idx.x + f32(gx) - 1.,
                    cell_idx.y + f32(gy) - 1.,
                    cell_idx.z + f32(gz) - 1.
                );

                if (cell_x.x < 0.0 || cell_x.y < 0.0 || cell_x.z < 0.0 ||
                    cell_x.x >= f32(shaderData.gridDim) ||
                    cell_x.y >= f32(shaderData.gridDim) ||
                    cell_x.z >= f32(shaderData.gridDim)) {
                    continue;
                }

                let cell_dist = (cell_x + vec3f(0.5)) - particlePos;
                
                let momentum = eq_16_term0 * weight * cell_dist;

                let ix = u32(cell_x.x);
                let iy = u32(cell_x.y);
                let iz = u32(cell_x.z);
                debug[0] = 0.0;
                let cell_index = ix * shaderData.gridDim * shaderData.gridDim + iy * shaderData.gridDim + iz;
                let mx = tou64(momentum.x);
                let my = tou64(momentum.y);
                let mz = tou64(momentum.z);

                if (momentum.x > 0.0) {
                    atomicAdd(&grid[cell_index].vx, mx.x);
                    atomicAdd(&gridRem[cell_index].vx, mx.y);
                } else {
                    atomicAdd(&grid[cell_index].vxNeg, mx.x);
                    atomicAdd(&gridRem[cell_index].vxNeg, mx.y);
                }

                if (momentum.y > 0.0) {
                    atomicAdd(&grid[cell_index].vy, my.x);
                    atomicAdd(&gridRem[cell_index].vy, my.y);
                } else {
                    atomicAdd(&grid[cell_index].vyNeg, my.x);
                    atomicAdd(&gridRem[cell_index].vyNeg, my.y);
                }

                if (momentum.z > 0.0) {
                    atomicAdd(&grid[cell_index].vz, mz.x);
                    atomicAdd(&gridRem[cell_index].vz, mz.y);
                } else {
                    atomicAdd(&grid[cell_index].vzNeg, mz.x);
                    atomicAdd(&gridRem[cell_index].vzNeg, mz.y);
                }
                
            }
        }
    }
}
