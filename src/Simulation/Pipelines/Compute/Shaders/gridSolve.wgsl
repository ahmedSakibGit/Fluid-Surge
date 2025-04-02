struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
    _padding: u32
};

struct Node {
    velocity: vec3<f32>,
    mass: f32
};

const deltaT: f32 = 0.01;
const gravity: vec3<f32> = vec3<f32>(0.0, -9.81, 0.0);
@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<uniform> shaderData: ShaderData;

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

    // Inject fake test data (only once)
    let flicker = f32(id % 10u) * 0.1;
    node.velocity = vec3f(0.0, 5.0 + flicker, 0.0); // upward velocity to test movement
    node.mass = 1.0;
    if (node.mass <=0.0) {
        return;
    }
    
    node.velocity = node.velocity / node.mass;
    node.velocity.y = node.velocity.y + gravity.y * deltaT;
    grid[id] = node;
}
