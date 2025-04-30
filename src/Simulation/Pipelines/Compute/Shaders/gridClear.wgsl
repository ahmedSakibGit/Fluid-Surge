struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
    _padding: u32
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


@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<storage, read_write> gridRem: array<Node>;
@group(0) @binding(2) var<uniform> shaderData: ShaderData;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    var id: u32 = globalIndex;

    if (id >= shaderData.nodeCount) {
        return;
    }

    grid[id].vx = 0;
    grid[id].vxNeg = 0;
    grid[id].vy = 0;
    grid[id].vyNeg = 0;
    grid[id].vz = 0;
    grid[id].vzNeg = 0;
    grid[id].mass = 0;
    gridRem[id].vx = 0;
    gridRem[id].vxNeg = 0;
    gridRem[id].vy = 0;
    gridRem[id].vyNeg = 0;
    gridRem[id].vz = 0;
    gridRem[id].vzNeg = 0;
    gridRem[id].mass = 0;

}
