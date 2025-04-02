const vertexShaderCode = 
`
#include<sceneUboDeclaration>
#include<meshUboDeclaration>

attribute position : vec3<f32>;
attribute positionIndex : f32;
attribute offsetIndex : f32;

var<storage,read> positions : array<f32>;

const quadOffsets = array<vec3<f32>, 6>(
    vec3<f32>(-0.05, -0.05, 0.05),
    vec3<f32>( 0.05, -0.05, 0.05),
    vec3<f32>( 0.05,  0.05, 0.05),
    vec3<f32>(-0.05, -0.05, 0.05),
    vec3<f32>( 0.05,  0.05, 0.05),
    vec3<f32>(-0.05,  0.05, 0.05)
);

@vertex
fn main(input : VertexInputs) -> FragmentInputs {
    let baseIndex = u32(vertexInputs.positionIndex) * 3u;
    var base = vec3<f32>(
        positions[baseIndex],
        positions[baseIndex + 1u],
        positions[baseIndex + 2u]
    );

    let offset = quadOffsets[u32(vertexInputs.offsetIndex)];
    vertexOutputs.position = scene.viewProjection * mesh.world * vec4<f32>(base + offset, 1.0);
}    
`

const name = "fluidVertexShader";
export default {
    name: name,
    code: vertexShaderCode
}