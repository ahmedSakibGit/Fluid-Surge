struct ShaderData {
    dispatchX: u32,
    dispatchY: u32,
    nodeCount: u32,
};

struct Node {
    vx: i32,
    vy: i32,
    vz: i32,
    mass: i32
};

@group(0) @binding(0) var<storage, read_write> grid: array<Node>;
@group(0) @binding(1) var<storage, read_write> gridRem: array<Node>;
@group(0) @binding(2) var<uniform> shaderData: ShaderData;

const FIXED_POINT_MULTIPLIER: f32 = 1e8;

@compute @workgroup_size(4, 4, 4)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let globalIndex = global_id.z * shaderData.dispatchY * shaderData.dispatchX +
                      global_id.y * shaderData.dispatchX +
                      global_id.x;

    let id: u32 = globalIndex;

    if (id >= shaderData.nodeCount) {
        return;
    }

    let rem_mass = gridRem[id].mass;
    if (rem_mass >= i32(FIXED_POINT_MULTIPLIER)) {
        let carry = rem_mass / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_mass % i32(FIXED_POINT_MULTIPLIER);
        grid[id].mass += carry;
        gridRem[id].mass = new_rem;
    } else if (rem_mass < 0) {
        let borrow = (abs(rem_mass) + i32(FIXED_POINT_MULTIPLIER) - 1) / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_mass + borrow * i32(FIXED_POINT_MULTIPLIER);
        grid[id].mass -= borrow;
        gridRem[id].mass = new_rem;
    }

    let rem_vx = gridRem[id].vx;
    if (rem_vx >= i32(FIXED_POINT_MULTIPLIER)) {
        let carry = rem_vx / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vx % i32(FIXED_POINT_MULTIPLIER);
        grid[id].vx += carry;
        gridRem[id].vx = new_rem;
    } else if (rem_vx < 0) {
        let borrow = (abs(rem_vx) + i32(FIXED_POINT_MULTIPLIER) - 1) / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vx + borrow * i32(FIXED_POINT_MULTIPLIER);
        grid[id].vx -= borrow;
        gridRem[id].vx = new_rem;
    }

    let rem_vy = gridRem[id].vy;
    if (rem_vy >= i32(FIXED_POINT_MULTIPLIER)) {
        let carry = rem_vy / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vy % i32(FIXED_POINT_MULTIPLIER);
        grid[id].vy += carry;
        gridRem[id].vy = new_rem;
    } else if (rem_vy < 0) {
        let borrow = (abs(rem_vy) + i32(FIXED_POINT_MULTIPLIER) - 1) / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vy + borrow * i32(FIXED_POINT_MULTIPLIER);
        grid[id].vy -= borrow;
        gridRem[id].vy = new_rem;
    }

    let rem_vz = gridRem[id].vz;
    if (rem_vz >= i32(FIXED_POINT_MULTIPLIER)) {
        let carry = rem_vz / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vz % i32(FIXED_POINT_MULTIPLIER);
        grid[id].vz += carry;
        gridRem[id].vz = new_rem;
    } else if (rem_vz < 0) {
        let borrow = (abs(rem_vz) + i32(FIXED_POINT_MULTIPLIER) - 1) / i32(FIXED_POINT_MULTIPLIER);
        let new_rem = rem_vz + borrow * i32(FIXED_POINT_MULTIPLIER);
        grid[id].vz -= borrow;
        gridRem[id].vz = new_rem;
    }
    
}
