import Shape from "./Shape";

class Cube extends Shape {
  constructor(scene: BABYLON.Scene, size: number) {
    super("cube", scene);
    this.mesh = BABYLON.MeshBuilder.CreateBox("cube", { size }, scene);
    const material = new BABYLON.StandardMaterial("cubeMat", scene);
    material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1);
    material.alpha = 0.05;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    material.backFaceCulling = false;
    this.mesh.material = material;
  }
}

export default Cube;