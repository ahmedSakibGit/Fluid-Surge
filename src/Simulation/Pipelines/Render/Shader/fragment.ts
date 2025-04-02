const fragmentShaderCode =
`
@fragment
fn main(input : FragmentInputs) -> FragmentOutputs {
    fragmentOutputs.color = vec4(0.0, 0.5, 0.7, 1.0);
}
`

const name = "fluidFragmentShader";
export default {
    name: name,
    code: fragmentShaderCode
}