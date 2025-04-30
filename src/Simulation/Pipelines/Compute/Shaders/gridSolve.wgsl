struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
    dt: f32,
    gravityX: f32,
    gravityY: f32,
    gravityZ: f32,
    worldInvertMatrix: mat4x4f,
    worldMatrix: mat4x4f
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
fn tou64(value: f32) -> vec2u {
    let positiveValue = abs(value);
    let low = u32((positiveValue * pow(2., DEGREE_TO_SAVE)) % pow(2., 32));
    let high = u32(positiveValue / pow(2., 32 - DEGREE_TO_SAVE));
    return vec2u(high, low);
}

fn tof32(high: u32, low: u32) -> f32 {
    return f32(high) * pow(2., 32 - DEGREE_TO_SAVE) + f32(low) / pow(2., DEGREE_TO_SAVE);
}

@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<storage, read_write> gridRem: array<Node>;
@group(0) @binding(2) var<storage, read_write> debug: array<NodeFloat>;
@group(0) @binding(3) var<uniform> shaderData: ShaderData;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.nodeCount) {
        return;
    }

    var deltaT: f32 = shaderData.dt;
    var gravity: vec3<f32> = vec3<f32>(shaderData.gravityX, shaderData.gravityY, shaderData.gravityZ);

    let mass = grid[id].mass;
    let massRem = gridRem[id].mass;
    if (mass == 0 && massRem == 0) {
        return;
    }

    let massFloat = tof32(mass, massRem);

    let vxFloat =  tof32(grid[id].vx, gridRem[id].vx) - tof32(grid[id].vxNeg, gridRem[id].vxNeg);
    let vyFloat =  tof32(grid[id].vy, gridRem[id].vy) - tof32(grid[id].vyNeg, gridRem[id].vyNeg) + (gravity.y * shaderData.dt);
    let vzFloat =  tof32(grid[id].vz, gridRem[id].vz) - tof32(grid[id].vzNeg, gridRem[id].vzNeg);
    var float_v: vec3f = vec3f(vxFloat, vyFloat, vzFloat);
    float_v /= massFloat;
    
    let vx = tou64(float_v.x);
    let vy = tou64(float_v.y);
    let vz = tou64(float_v.z);
    if (float_v.x > 0.0) {
        grid[id].vx = vx.x;
        gridRem[id].vx = vx.y;
    } else {
        grid[id].vxNeg = vx.x;
        gridRem[id].vxNeg = vx.y;
    }

    if (float_v.y > 0.0) {
        grid[id].vy = vy.x;
        gridRem[id].vy = vy.y;
    } else {
        grid[id].vyNeg = vy.x;
        gridRem[id].vyNeg = vy.y;
    }

    if (float_v.z > 0.0) {
        grid[id].vz = vz.x;
        gridRem[id].vz = vz.y;
    } else {
        grid[id].vzNeg = vz.x;
        gridRem[id].vzNeg = vz.y;
    }

    debug[id].vx = float_v.x; 
    debug[id].vy = float_v.y;
    debug[id].vz = float_v.z;
    debug[id].mass = massFloat;
}