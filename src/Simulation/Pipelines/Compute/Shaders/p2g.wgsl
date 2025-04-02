struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    fluidCount: u32,
    _padding: u32
};

@group(0) @binding(0) var<storage, read_write> positions : array<f32>;
@group(0) @binding(1) var<uniform> shaderData: ShaderData;

@compute @workgroup_size(16, 8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.fluidCount) {
        return;
    }

    let baseIndex = id * 3u;
    positions[baseIndex + 1u] = - positions[baseIndex + 1u];
}
