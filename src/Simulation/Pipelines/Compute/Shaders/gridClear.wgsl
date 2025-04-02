struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
    _padding: u32
};

struct Node {
    values: vec4f
};

@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<uniform> shaderData: ShaderData;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    var id: u32 = globalIndex;

    if (id >= shaderData.nodeCount) {
        return;
    }

    grid[id].values = vec4f(0.0);
}
