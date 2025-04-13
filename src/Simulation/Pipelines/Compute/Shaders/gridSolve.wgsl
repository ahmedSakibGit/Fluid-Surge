struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
    worldInvertMatrix: mat4x4f
};

struct Node {
    vx: i32,
    vy: i32,
    vz: i32,
    mass: i32,
};

const FIXED_POINT_MULTIPLIER: f32 = 1e8;
const deltaT: f32 = 0.01;
const gravity: vec3<f32> = vec3<f32>(0.0, -98.1, 0.0);

fn decodeFloatFromInt(intPart: i32, remPart: i32) -> f32 {
    return f32(intPart) + f32(remPart) / FIXED_POINT_MULTIPLIER;
}

fn encodeFloatToInt(value: f32) -> vec2<i32> {
    let intPart = i32(value);
    let remPart = i32((value - f32(intPart)) * FIXED_POINT_MULTIPLIER);
    return vec2<i32>(intPart, remPart);
}

@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<storage, read_write> gridRem: array<Node>;
@group(0) @binding(2) var<uniform> shaderData: ShaderData;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.nodeCount) {
        return;
    }

    var node = grid[id];

    if (node.mass > 0) {
        let vx = decodeFloatFromInt(node.vx, gridRem[id].vx);
        let vy = decodeFloatFromInt(node.vy, gridRem[id].vy);
        let vz = decodeFloatFromInt(node.vz, gridRem[id].vz);
        let m = decodeFloatFromInt(node.mass, gridRem[id].mass);

        var float_v: vec3f = vec3f(vx, vy, vz);
        float_v /= m;
        let gravityWorld = vec3f(0.0, -9.81, 0.0);
        let gravityLocal = (shaderData.worldInvertMatrix * vec4f(gravityWorld, 0.0)).xyz;
        float_v += gravityLocal * deltaT;


        let encodedX = encodeFloatToInt(float_v.x);
        let encodedY = encodeFloatToInt(float_v.y);
        let encodedZ = encodeFloatToInt(float_v.z);

        node.vx = encodedX.x;
        node.vy = encodedY.x;
        node.vz = encodedZ.x;

        gridRem[id].vx = encodedX.y;
        gridRem[id].vy = encodedY.y;
        gridRem[id].vz = encodedZ.y;

        grid[id] = node;
    }
}
