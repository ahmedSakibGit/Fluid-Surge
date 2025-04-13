struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    fluidCount: u32,
    gridDim: u32
};

struct Node {
    vx: atomic<i32>,
    vy: atomic<i32>,
    vz: atomic<i32>,
    mass: atomic<i32>
};

const FIXED_POINT_MULTIPLIER: f32 = 1e8;
const STIFFNESS: f32 = 500.0;
const REST_DENSITY: f32 = 4.0;
const DYNAMIC_VISCOSITY: f32 = 0.1;
const DT: f32 = 0.01;

fn encodeFloatToInt(value: f32) -> vec2<i32> {
    let intPart = i32(value);
    let remPart = i32((value - f32(intPart)) * FIXED_POINT_MULTIPLIER);
    return vec2<i32>(intPart, remPart);
}

@group(0) @binding(0) var<storage, read> positions : array<f32>;
@group(0) @binding(1) var<storage, read> velocity: array<f32>;
@group(0) @binding(2) var<storage, read> c0Buffer: array<f32>;
@group(0) @binding(3) var<storage, read> c1Buffer: array<f32>;
@group(0) @binding(4) var<storage, read> c2Buffer: array<f32>;
@group(0) @binding(5) var<storage, read_write> grid: array<Node>;
@group(0) @binding(6) var<storage, read_write> gridRem: array<Node>;
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

    var weights: array<vec3f, 3>;

    let px = positions[id * 3 + 0];
    let py = positions[id * 3 + 1];
    let pz = positions[id * 3 + 2];
    let particlePos = vec3f(px, py, pz);
    let cell_idx = floor(particlePos);
    let cell_diff = particlePos - (cell_idx + vec3f(0.5));
    weights[0] = 0.5 * (0.5 - cell_diff) * (0.5 - cell_diff);
    weights[1] = 0.75 - cell_diff * cell_diff;
    weights[2] = 0.5 * (0.5 + cell_diff) * (0.5 + cell_diff);

    let vx = velocity[id * 3 + 0];
    let vy = velocity[id * 3 + 1];
    let vz = velocity[id * 3 + 2];
    //let v = vec3f(vx, vy, vz);

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
                let ix = u32(cell_x.x);
                let iy = u32(cell_x.y);
                let iz = u32(cell_x.z);
                if (ix < shaderData.gridDim &&
                    iy < shaderData.gridDim &&
                    iz < shaderData.gridDim) {
                    let cell_index = ix * shaderData.gridDim * shaderData.gridDim + iy * shaderData.gridDim + iz;
                    density += (f32(atomicLoad(&grid[cell_index].mass)) / FIXED_POINT_MULTIPLIER) * weight;
                }
            }
        }
    }

    let volume = 1.0 / density;
    let pressure = max(-0.0, STIFFNESS * (pow(density / REST_DENSITY, 5.0) - 1.0));
    var stress = mat3x3f(-pressure, 0, 0, 0, -pressure, 0, 0, 0, -pressure);
    let dudv = C;
    let strain = dudv + transpose(dudv);
    stress += DYNAMIC_VISCOSITY * strain;

    let eq_16_term0 = -volume * 4.0 * stress * DT;

    for (var gx: u32 = 0u; gx < 3u; gx++) {
        for (var gy: u32 = 0u; gy < 3u; gy++) {
            for (var gz: u32 = 0u; gz < 3u; gz++) {
                let weight = weights[gx].x * weights[gy].y * weights[gz].z;
                let cell_x = vec3f(
                    cell_idx.x + f32(gx) - 1.,
                    cell_idx.y + f32(gy) - 1.,
                    cell_idx.z + f32(gz) - 1.
                );
                let cell_dist = (cell_x + vec3f(0.5)) - particlePos;
                let momentum = eq_16_term0 * weight * cell_dist;

                let ix = u32(cell_x.x);
                let iy = u32(cell_x.y);
                let iz = u32(cell_x.z);
                if (ix < shaderData.gridDim &&
                    iy < shaderData.gridDim &&
                    iz < shaderData.gridDim) {
                    let cell_index = ix * shaderData.gridDim * shaderData.gridDim + iy * shaderData.gridDim + iz;
                    let encX = encodeFloatToInt(momentum.x);
                    let encY = encodeFloatToInt(momentum.y);
                    let encZ = encodeFloatToInt(momentum.z);
                    atomicAdd(&grid[cell_index].vx, encX.x);
                    atomicAdd(&gridRem[cell_index].vx, encX.y);
                    atomicAdd(&grid[cell_index].vy, encY.x);
                    atomicAdd(&gridRem[cell_index].vy, encY.y);
                    atomicAdd(&grid[cell_index].vz, encZ.x);
                    atomicAdd(&gridRem[cell_index].vz, encZ.y);
                }
            }
        }
    }
}
